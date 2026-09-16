import { reply, fail, requireValue, uuid, dates } from "../http.js";
import { ownedRecord, singleton, replaceChildren, overlap } from "./common.js";

export function registerMedication(ctx, route) {
  const { repo, auth, db } = ctx,
    name = "ClientMedicationSchedulingEntity";
  route("POST", "/api/client-medication/create/:userId", async (req, res) => {
    auth.admin(req);
    const row = await singleton(
      ctx,
      req,
      "ClientMedicationEntity",
      req.params.userId,
      req.body,
    );
    return reply(
      res,
      {
        ...(await repo.serialize("ClientMedicationEntity", row)),
        userId: row.user,
      },
      "Client medication created",
      201,
    );
  });
  route("GET", "/api/client-medication/get-by-id/:userId", async (req, res) => {
    const row = requireValue(
      await singleton(ctx, req, "ClientMedicationEntity", req.params.userId),
      "No medication found",
    );
    return reply(res, {
      ...(await repo.serialize("ClientMedicationEntity", row)),
      userId: row.user,
    });
  });
  route("PUT", "/api/client-medication/update/:id", async (req, res) => {
    auth.admin(req);
    const old = await ownedRecord(
      ctx,
      req,
      "ClientMedicationEntity",
      req.params.id,
      { write: true },
    );
    const row = await repo.save("ClientMedicationEntity", {
      ...repo.input("ClientMedicationEntity", req.body),
      id: old.id,
    });
    return reply(res, {
      ...(await repo.serialize("ClientMedicationEntity", row)),
      userId: row.user,
    });
  });
  async function output(row) {
    const now = new Date().toISOString().slice(0, 19);
    const ends = [
      row.prnEndDate ? row.prnEndDate + "T23:59:59" : null,
      row.lastDoseDate
        ? row.lastDoseDate + "T" + (row.lastDoseTime || "00:00:00")
        : null,
      row.scheduledStopDate
        ? row.scheduledStopDate + "T" + (row.scheduledStopTime || "00:00:00")
        : null,
    ].filter(Boolean);
    if (!row.isStopped && ends.some((end) => end < now))
      row = await repo.save(name, { id: row.id, isStopped: true });
    const result = await repo.serialize(name, row, { children: true });
    result.pastAdministrations = await Promise.all(
      (
        await repo.find("ClientMedicationPastAdministrationEntity", {
          medication: row.id,
        })
      ).map(async (p) => {
        const actor = p.updatedBy
          ? await repo.get("UserEntity", p.updatedBy)
          : null;
        return {
          ...(await repo.serialize(
            "ClientMedicationPastAdministrationEntity",
            p,
          )),
          updatedBy: actor ? `${actor.firstName} ${actor.lastName}` : null,
        };
      }),
    );
    return result;
  }
  async function save(req, id) {
    auth.admin(req);
    const old = id
      ? await ownedRecord(ctx, req, name, id, { write: true })
      : null;
    const userId = old?.user || req.params.userId;
    await auth.userAccess(req, userId, { write: true });
    if (!String(req.body.medicationName ?? old?.medicationName ?? "").trim())
      fail(400, "Medication name is required");
    dates(req.body);
    const data = { ...repo.input(name, req.body), id: old?.id, user: userId };
    data.isControlledDrug = !!data.isControlledDrug;
    data.requiresWitness = data.isControlledDrug || !!data.requiresWitness;
    data.stockTrackingEnabled = !!data.stockTrackingEnabled;
    if (data.stockTrackingEnabled) {
      const quantity = Number(data.stockQuantity), threshold = Number(data.lowStockThreshold);
      if (!Number.isFinite(quantity) || quantity < 0 || !Number.isFinite(threshold) || threshold < 0)
        fail(400, "Stock quantity and low-stock threshold must be zero or greater");
      if (!String(data.stockUnit || "").trim()) fail(400, "Stock unit is required when stock tracking is enabled");
    } else {
      data.stockQuantity = 0;
      data.stockUnit = "";
      data.lowStockThreshold = 0;
    }
    if (!old) data.isStopped = false;
    if (
      data.firstDoseDate &&
      data.lastDoseDate &&
      data.lastDoseDate < data.firstDoseDate
    )
      fail(400, "Last dose must not precede first dose");
    if (
      data.prnStartDate &&
      data.prnEndDate &&
      data.prnEndDate < data.prnStartDate
    )
      fail(400, "PRN end must not precede start");
    const row = await repo.save(name, data);
    await replaceChildren(
      repo,
      "ClientMedicationPastAdministrationEntity",
      "medication",
      row.id,
      req.body.pastAdministrations,
      req,
      { updatedBy: req.user.id },
    );
    return output(row);
  }
  route(
    "POST",
    "/api/client-medication-scheduling/create/:userId",
    async (req, res) =>
      reply(
        res,
        await db.transaction(() => save(req)),
        "Schedule Created successfully",
      ),
  );
  route(
    "PUT",
    "/api/client-medication-scheduling/update/:id",
    async (req, res) =>
      reply(res, await db.transaction(() => save(req, req.params.id))),
  );
  route(
    "GET",
    "/api/client-medication-scheduling/get-by-id/:id",
    async (req, res) =>
      reply(
        res,
        await output(await ownedRecord(ctx, req, name, req.params.id)),
      ),
  );
  route(
    "GET",
    "/api/client-medication-scheduling/get-all-by-client-id/:userId",
    async (req, res) => {
      await auth.userAccess(req, req.params.userId);
      const filter = req.query.dateFilter;
      let range = {};
      if (filter) {
        let date;
        if (/^\d{4}-\d{2}$/.test(filter))
          date = new Date(filter + "-01T00:00:00Z");
        else date = new Date("1 " + filter.replace("_", " ") + " UTC");
        if (Number.isNaN(date.valueOf()))
          fail(400, "dateFilter must identify a month and year");
        range = {
          startDate: date.toISOString().slice(0, 10),
          endDate: new Date(
            Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
          )
            .toISOString()
            .slice(0, 10),
        };
      }
      const rows = (await repo.find(name, { user: req.params.userId })).filter(
        (m) =>
          !m.deletedAt &&
          overlap(
            m.type === "PRN" ? m.prnStartDate : m.firstDoseDate,
            m.type === "PRN" ? m.prnEndDate : m.lastDoseDate,
            range,
          ),
      );
      const inactivities = (
        await repo.find("ClientInactivityEntity", { user: req.params.userId })
      ).filter(
        (i) =>
          !i.deletedAt &&
          overlap(
            i.startDate,
            i.type === "PERMANENT" ? null : i.endDate,
            range,
          ),
      );
      return reply(res, {
        medicationSchedules: await Promise.all(rows.map(output)),
        clientInactivities: await Promise.all(
          inactivities.map((i) => repo.serialize("ClientInactivityEntity", i)),
        ),
      });
    },
  );
  route(
    "DELETE",
    "/api/client-medication-scheduling/delete/:id",
    async (req, res) => {
      auth.admin(req);
      const row = await ownedRecord(ctx, req, name, req.params.id, {
        write: true,
      });
      await repo.save(name, {
        id: row.id,
        deletedAt: new Date().toISOString(),
      });
      return reply(res, {}, "Schedule Deleted successfully");
    },
  );
  route(
    "PUT",
    "/api/client-medication-scheduling/stop-scheduling/:id",
    async (req, res) => {
      auth.admin(req);
      const row = await ownedRecord(ctx, req, name, req.params.id, {
        write: true,
      });
      const body = req.body;
      if (body.stopType === "IMMEDIATELY")
        await repo.save(name, { id: row.id, isStopped: true });
      else if (body.stopType === "SCHEDULED") {
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(body.endDate) ||
          !/^\d{2}:\d{2}(:\d{2})?$/.test(body.endTime)
        )
          fail(400, "Valid endDate and endTime are required");
        await repo.save(name, {
          id: row.id,
          scheduledStopDate: body.endDate,
          scheduledStopTime: body.endTime,
        });
      } else fail(400, "stopType must be IMMEDIATELY or SCHEDULED");
      return reply(res, {}, "Schedule Stopped successfully");
    },
  );
  route(
    "PUT",
    "/api/client-medication-scheduling/update/past-administration",
    async (req, res) =>
      db.transaction(async () => {
        const body = req.body,
          row = await ownedRecord(ctx, req, name, body.medicationId);
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(body.date) ||
          !body.slot ||
          !body.outcome
        )
          fail(400, "Date, slot and outcome are required");
        const previous = body.id
          ? requireValue(
              await repo.get(
                "ClientMedicationPastAdministrationEntity",
                uuid(body.id),
              ),
              "Administration not found",
            )
          : null;
        if (previous && previous.medication !== row.id)
          fail(404, "Administration not found");
        await repo.save("ClientMedicationPastAdministrationEntity", {
          ...repo.input("ClientMedicationPastAdministrationEntity", body),
          id: previous?.id,
          medication: row.id,
          updatedBy: req.user.id,
        });
        return reply(res, { isUpdated: true }, "Past administration saved");
      }),
  );
}
