import { randomUUID } from "node:crypto";
import { reply, fail, requireValue } from "../http.js";
import { singleton, ownedRecord } from "./common.js";
export function registerSettings(ctx, route) {
  const { repo, auth, db } = ctx;
  route("GET", "/api/client-settings/getByClient/:userId", async (req, res) => {
    const row = await singleton(
      ctx,
      req,
      "ClientSettingsEntity",
      req.params.userId,
    );
    return reply(
      res,
      row
        ? {
            ...(await repo.serialize("ClientSettingsEntity", row)),
            userId: row.user,
          }
        : {},
    );
  });
  route("PUT", "/api/client-settings/update/:userId", async (req, res) => {
    const row = await singleton(
      ctx,
      req,
      "ClientSettingsEntity",
      req.params.userId,
      req.body,
    );
    return reply(res, {
      ...(await repo.serialize("ClientSettingsEntity", row)),
      userId: row.user,
    });
  });
  route(
    "POST",
    "/api/client-settings/regenerate-qrcode/:userId",
    async (req, res) => {
      const qrCodeId = randomUUID(),
        qrCodeChangedAt = new Date().toISOString();
      await singleton(ctx, req, "ClientSettingsEntity", req.params.userId, {
        qrCodeId,
        qrCodeChangedAt,
      });
      return reply(res, { qrCodeId, qrCodeChangedAt });
    },
  );
  const name = "ClientCareCircleMemeberEntity";
  async function memberOutput(row) {
    const logs = await repo.find("ClientCareCircleMemberLogEntity", {
      careCircleMember: row.id,
    });
    const grouped = {};
    for (const entry of logs) {
      const day = entry.at.slice(0, 10),
        actor = await repo.get("UserEntity", entry.by);
      (grouped[day] ??= []).push({
        action: entry.action,
        at: day + ":" + entry.at.slice(11, 16),
        by: actor
          ? {
              id: actor.id,
              firstName: actor.firstName,
              lastName: actor.lastName,
            }
          : null,
        member: {
          id: row.id,
          firstName: row.firstName,
          lastName: row.lastName,
        },
      });
    }
    return {
      ...(await repo.serialize(name, row)),
      clientId: row.user,
      client_care_circle_member_logs: grouped,
    };
  }
  async function log(req, row, action) {
    await repo.save("ClientCareCircleMemberLogEntity", {
      agencyId: req.user.agencyId,
      careCircleMember: row.id,
      action,
      at: new Date().toISOString(),
      by: req.user.id,
    });
  }
  route("POST", "/api/client-care-circle/create", async (req, res) =>
    db.transaction(async () => {
      auth.admin(req);
      const clientId = req.body.userId || req.body.clientId;
      await auth.userAccess(req, clientId, { write: true });
      if (!req.body.firstName || !req.body.lastName)
        fail(400, "First name and last name are required");
      const row = await repo.save(name, {
        ...repo.input(name, req.body),
        user: clientId,
        agencyId: req.user.agencyId,
        createdBy: req.user.id,
        updatedBy: req.user.id,
      });
      if (row.isInviteSent) await log(req, row, "INVITE_SENT");
      return reply(
        res,
        await memberOutput(row),
        "Care circle member created",
        201,
      );
    }),
  );
  route("PUT", "/api/client-care-circle/update/:id", async (req, res) => {
    const old = await ownedRecord(ctx, req, name, req.params.id, {
      write: true,
    });
    const row = await repo.save(name, {
      ...repo.input(name, req.body),
      id: old.id,
      updatedBy: req.user.id,
    });
    return reply(res, await memberOutput(row));
  });
  route("PUT", "/api/client-care-circle/invitation/:id", async (req, res) =>
    db.transaction(async () => {
      const old = await ownedRecord(ctx, req, name, req.params.id, {
        write: true,
      });
      if (typeof req.body.isInviteSent !== "boolean")
        fail(400, "isInviteSent must be boolean");
      const row = await repo.save(name, {
        id: old.id,
        isInviteSent: req.body.isInviteSent,
        updatedBy: req.user.id,
      });
      await log(
        req,
        row,
        req.body.isInviteSent ? "INVITE_SENT" : "INVITE_CANCELED",
      );
      return reply(res, await memberOutput(row));
    }),
  );
  route("DELETE", "/api/client-care-circle/delete/:id", async (req, res) => {
    const row = await ownedRecord(ctx, req, name, req.params.id, {
      write: true,
    });
    await repo.save(name, {
      id: row.id,
      deletedAt: new Date().toISOString(),
      deletedBy: req.user.id,
    });
    return reply(res, {}, "Member deleted");
  });
  route("GET", "/api/client-care-circle/client/:clientId", async (req, res) => {
    await auth.userAccess(req, req.params.clientId);
    return reply(
      res,
      await Promise.all(
        (
          await repo.find(name, { user: req.params.clientId, deletedAt: null })
        ).map(memberOutput),
      ),
    );
  });
  route("GET", "/api/client-care-circle/:id", async (req, res) =>
    reply(
      res,
      await memberOutput(await ownedRecord(ctx, req, name, req.params.id)),
    ),
  );
}
