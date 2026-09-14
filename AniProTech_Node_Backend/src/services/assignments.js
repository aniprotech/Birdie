import { reply, fail, requireValue, uuid, pagination } from "../http.js";
export function registerAssignments(ctx, route) {
  const { repo, db, auth } = ctx,
    name = "ClientCareTeamEntity";
  const flags = [
    "viewAccess",
    "revokeViewaccess",
    "allowedToVisit",
    "declineCarer",
  ];
  for (const reverse of [false, true]) {
    const prefix = reverse ? "/api/team-clients" : "/api/client-care-team",
      parentKey = reverse ? "teamMemberId" : "clientId";
    const idKey = reverse ? "clientId" : "carerId",
      resultKey = reverse ? "clients" : "careTeam";
    async function output(link, user) {
      return {
        id: link?.id ?? null,
        [idKey]: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        ...Object.fromEntries(flags.map((k) => [k, link?.[k] ?? null])),
      };
    }
    route(
      "POST",
      prefix +
        (reverse ? "/getByTeamMember/" : "/getByClient/") +
        ":" +
        parentKey,
      async (req, res) => {
        const owner = await auth.userAccess(req, req.params[parentKey]);
        if (req.user.role === "CAREGIVER" && !reverse)
          fail(403, "Administrator access required");
        let users = (
          await repo.find("UserEntity", { agencyId: owner.agencyId })
        ).filter(
          (u) =>
            !u.deletedAt &&
            (reverse
              ? u.role === "USER"
              : ["ADMIN", "CAREGIVER"].includes(u.role)),
        );
        const links = await repo.find(name, {
          [reverse ? "carer" : "client"]: owner.id,
        });
        let rows = [];
        for (const user of users) {
          const link = links.find(
            (l) => l[reverse ? "client" : "carer"] === user.id && !l.deletedAt,
          );
          if (
            req.user.role === "CAREGIVER" &&
            (!link?.viewAccess || link.revokeViewaccess || link.declineCarer)
          )
            continue;
          rows.push(await output(link, user));
        }
        if (req.body.filter === "Declined")
          rows = rows.filter((r) => r.declineCarer);
        if (req.body.filter === "Viewer")
          rows = rows.filter((r) => r.viewAccess && !r.revokeViewaccess);
        const search = String(req.body.search || "").toLowerCase();
        rows = rows.filter((r) =>
          `${r.firstName} ${r.lastName}`.toLowerCase().includes(search),
        );
        const { size, offset } = pagination(req.body);
        return reply(res, {
          data: {
            totalCount: rows.length,
            [resultKey]: rows.slice(offset, offset + size),
          },
        });
      },
    );
    async function update(req, body) {
      auth.admin(req);
      const owner = await auth.userAccess(req, req.params[parentKey], {
        write: true,
      });
      let old = body.id
        ? requireValue(
            await repo.get(name, uuid(body.id)),
            "Assignment not found",
          )
        : null;
      if (old && old[reverse ? "carer" : "client"] !== owner.id)
        fail(404, "Assignment not found");
      const otherId = body[idKey] || old?.[reverse ? "client" : "carer"];
      const other = await auth.userAccess(req, otherId, { write: true });
      if (
        reverse
          ? other.role !== "USER"
          : !["ADMIN", "CAREGIVER"].includes(other.role)
      )
        fail(400, "Invalid assignment role");
      const client = reverse ? other.id : owner.id,
        carer = reverse ? owner.id : other.id;
      if (
        (reverse && !["ADMIN", "CAREGIVER"].includes(owner.role)) ||
        (!reverse && owner.role !== "USER")
      )
        fail(400, "Invalid assignment owner");
      await db.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [client]);
      old = old || (await repo.one(name, { client, carer }));
      const data = {
        id: old?.id,
        client,
        carer,
        createdBy: old?.createdBy || req.user.id,
        updatedBy: req.user.id,
      };
      for (const key of flags)
        if (body[key] !== undefined) data[key] = body[key];
      const saved = await repo.save(name, data);
      return output(saved, other);
    }
    route("PUT", prefix + "/update/:" + parentKey, async (req, res) =>
      reply(res, { data: await db.transaction(() => update(req, req.body)) }),
    );
    route("PUT", prefix + "/bulk-update/:" + parentKey, async (req, res) => {
      if (!Array.isArray(req.body) || req.body.length > 200)
        fail(400, "Expected an array of up to 200 assignments");
      const data = await db.transaction(async () => {
        const out = [];
        for (const item of req.body) out.push(await update(req, item));
        return out;
      });
      return reply(res, { data });
    });
  }
}
