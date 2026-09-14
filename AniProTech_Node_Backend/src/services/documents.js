import { randomUUID } from "node:crypto";
import { reply, fail, requireValue, uuid } from "../http.js";
import { ownedRecord, replaceChildren } from "./common.js";
export function registerDocuments(ctx, route) {
  const { repo, auth, db, files } = ctx;
  const name = "ClientUploadDocumentEntity",
    signedName = "ClientSignatureDocumentEntity";
  route(
    "POST",
    "/api/client-care-plan/files/upload-document",
    async (req, res) => {
      await auth.userAccess(req, req.body.clientId, { write: true });
      const file = await files.save(
        req.files?.find((f) => f.fieldname === "file"),
      );
      const row = await repo.save(name, {
        user: req.body.clientId,
        fileName: file.filename,
        fileUrl: file.url,
        fileType: req.body.fileType,
        readAccessToCareGivers: req.body.readAccessToCareGivers ?? false,
      });
      return reply(
        res,
        await repo.serialize(name, row),
        "File uploaded successfully",
      );
    },
    { multipart: true },
  );
  route("GET", "/api/client-care-plan/files/:clientId", async (req, res) => {
    await auth.userAccess(req, req.params.clientId);
    const rows = (await repo.find(name, { user: req.params.clientId })).filter(
      (r) => req.user.role !== "CAREGIVER" || r.readAccessToCareGivers,
    );
    return reply(
      res,
      await Promise.all(rows.map((r) => repo.serialize(name, r))),
    );
  });
  route(
    "PUT",
    "/api/client-care-plan/files/update/:fileId",
    async (req, res) => {
      const row = await ownedRecord(ctx, req, name, req.params.fileId, {
        write: true,
      });
      if (typeof req.body.readAccessToCareGivers !== "boolean")
        fail(400, "readAccessToCareGivers must be boolean");
      await repo.save(name, {
        id: row.id,
        readAccessToCareGivers: req.body.readAccessToCareGivers,
      });
      return reply(res, {}, "Read access updated");
    },
  );
  route(
    "DELETE",
    "/api/client-care-plan/files/delete-document/:fileId",
    async (req, res) => {
      const row = await ownedRecord(ctx, req, name, req.params.fileId, {
        write: true,
      });
      await repo.remove(name, row.id);
      return reply(res, {}, "Document deleted");
    },
  );
  const prefix = "/api/client-care-plan/signature";
  route(
    "POST",
    prefix + "/upload",
    async (req, res) => {
      await auth.userAccess(req, req.body.clientId, { write: true });
      const file = await files.save(
        req.files?.find((f) => f.fieldname === "file"),
      );
      const row = await repo.save(signedName, {
        user: req.body.clientId,
        fileName: file.filename,
        fileUrl: file.url,
        documentUniqueId: randomUUID().slice(0, 8),
        signedAt: null,
      });
      return reply(res, await repo.serialize(signedName, row));
    },
    { multipart: true },
  );
  async function docOutput(row) {
    return {
      ...(await repo.serialize(signedName, row, { children: true })),
      collectedBy: row.collectedBy,
    };
  }
  for (const signed of [false, true])
    route(
      "GET",
      prefix +
        (signed ? "/signed-documents/" : "/uploaded-documents/") +
        ":clientId",
      async (req, res) => {
        auth.admin(req);
        await auth.userAccess(req, req.params.clientId);
        return reply(
          res,
          await Promise.all(
            (await repo.find(signedName, { user: req.params.clientId }))
              .filter((r) => !!r.signedAt === signed)
              .map(docOutput),
          ),
        );
      },
    );
  route("POST", prefix + "/document-pack/create", async (req, res) =>
    db.transaction(async () => {
      await auth.userAccess(req, req.body.clientId, { write: true });
      const ids = req.body.documents;
      if (
        !Array.isArray(ids) ||
        !ids.length ||
        ids.length > 100 ||
        new Set(ids).size !== ids.length
      )
        fail(400, "Provide 1 to 100 unique document IDs");
      const packId = randomUUID();
      for (const id of ids) {
        const doc = await ownedRecord(ctx, req, signedName, id, {
          write: true,
        });
        if (doc.user !== req.body.clientId || doc.signedAt)
          fail(400, "All documents must be unsigned and belong to the client");
        await repo.save(signedName, { id: doc.id, documentPackId: packId });
      }
      return reply(res, { documentPackId: packId });
    }),
  );
  route("GET", prefix + "/document-pack/:clientId", async (req, res) => {
    auth.admin(req);
    await auth.userAccess(req, req.params.clientId);
    const rows = (
      await repo.find(signedName, { user: req.params.clientId })
    ).filter((r) => r.documentPackId);
    if (!rows.length) fail(404, "No document pack found");
    const first = rows[0],
      docs = rows.filter((r) => r.documentPackId === first.documentPackId);
    const all = await repo.find(signedName, { user: req.params.clientId });
    return reply(res, {
      id: first.documentPackId,
      startedAt: first.createdAt,
      startedBy: first.user,
      status: docs.every(
        (d) =>
          d.signedAt || all.some((s) => s.documentId === d.id && s.signedAt),
      )
        ? "SIGNED"
        : "IN_PROGRESS",
      notes: first.notes,
      documents: docs.map((d) => d.id),
    });
  });
  route("DELETE", prefix + "/document-pack/delete/:packId", async (req, res) =>
    db.transaction(async () => {
      auth.admin(req);
      const docs = await repo.find(signedName, {
        documentPackId: uuid(req.params.packId),
      });
      if (!docs.length) fail(404, "No document pack found");
      for (const doc of docs) {
        await auth.userAccess(req, doc.user, { write: true });
        await repo.save(signedName, { id: doc.id, documentPackId: null });
      }
      return reply(res, {}, "Document pack unlinked");
    }),
  );
  route("POST", prefix + "/save-signed-documents", async (req, res) =>
    db.transaction(async () => {
      const body = req.body;
      await auth.userAccess(req, body.clientId, { write: true });
      if (
        !Array.isArray(body.signatories) ||
        !body.signatories.length ||
        body.signatories.length > 30
      )
        fail(400, "At least one signatory is required");
      for (const s of body.signatories)
        if (!s.name || !s.role)
          fail(400, "Each signatory needs a name and role");
      const docs = await repo.find(signedName, {
        documentPackId: uuid(body.documentPackId),
      });
      if (!docs.length) fail(404, "Document pack not found");
      const result = [];
      for (const doc of docs) {
        if (doc.user !== body.clientId) fail(404, "Document pack not found");
        const notes = (body.documentNotes || []).find(
          (n) => n.documentId === doc.id,
        )?.notes;
        const row = await repo.save(signedName, {
          user: body.clientId,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          documentId: doc.id,
          documentUniqueId: randomUUID().slice(0, 8),
          notes,
          collectedBy: req.user.id,
          signedAt: new Date().toISOString(),
        });
        await replaceChildren(
          repo,
          "ClientSignatoriesEntity",
          "document",
          row.id,
          body.signatories,
          req,
        );
        result.push(await docOutput(row));
      }
      return reply(res, result, "Signed documents saved");
    }),
  );
}
