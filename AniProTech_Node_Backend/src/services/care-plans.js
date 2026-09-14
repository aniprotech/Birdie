import { entities } from "../db.js";
import { reply, fail, requireValue, uuid } from "../http.js";

export const carePlans = {
  medication: "CarePlanMedicationEntity",
  administrative: "ClientAdministrativeEntity",
  behaviour: "ClientBehaviourEntity",
  communication: "ClientCommunicationEntity",
  "condition-specific": "ClientConditionSpecificEntity",
  "control-substances": "ClientControlSubstancesEntity",
  covid: "ClientCovidEntity",
  dysphagia: "ClientDysphagiaEntity",
  "end-of-life": "ClientEndOfLifeEntity",
  environmental: "ClientEnvironmentalEntity",
  "environment-fire": "ClientEnvironmentFireEntity",
  "every-day-activity": "ClientEveryDayActivityEntity",
  financial: "ClientFinancialEntity",
  "mental-capacity": "ClientMentalCapacityEntity",
  "nutrition-hydration": "ClientNutritionHydrationEntity",
  "personal-care": "ClientPersonalCareEntity",
  psychological: "ClientPsychologicalEntity",
  "social-support": "ClientSocialSupportEntity",
};
export const careType = (key) =>
  key === "every-day-activity"
    ? "EVERYDAY_ACTIVITY"
    : key.toUpperCase().replaceAll("-", "_");
export function registerCarePlans(ctx, route) {
  const { repo, db, auth } = ctx;
  async function parent(req, name, clientId) {
    await auth.userAccess(req, clientId);
    return db.transaction(async () => {
      await db.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [clientId]);
      return (
        (await repo.one(name, { user: clientId })) ||
        repo.save(name, {
          user: clientId,
          createdBy: req.user.id,
          updatedBy: req.user.id,
        })
      );
    });
  }
  async function riskAccess(req, id, key) {
    const risk = requireValue(
      await repo.get("CarePlanRisksMitigationsEntity", uuid(id)),
      "Risk not found",
    );
    if (risk.deletedAt || (key && risk.entityType !== careType(key)))
      fail(404, "Risk not found");
    const entry = Object.entries(carePlans).find(
      ([key]) => careType(key) === risk.entityType,
    );
    const plan = entry ? await repo.get(entry[1], risk.entityId) : null;
    requireValue(plan, "Care plan not found");
    await auth.userAccess(req, plan.user);
    return risk;
  }
  const getRisk = (key) => async (req, res) =>
    reply(
      res,
      await repo.serialize(
        "CarePlanRisksMitigationsEntity",
        await riskAccess(req, req.params.id, key),
      ),
    );
  const deleteRisk = (key) => async (req, res) => {
    auth.admin(req);
    const risk = await riskAccess(req, req.params.id, key);
    await repo.remove("CarePlanRisksMitigationsEntity", risk.id);
    return reply(res, {}, "Risk deleted successfully");
  };
  for (const [key, name] of Object.entries(carePlans)) {
    const prefix = "/api/client-care-plan/" + key;
    const association = entities[name].fields.find(
        (f) => f.name === "assessments",
      ),
      assessmentName = association.target;
    route("GET", prefix + "/:clientId", async (req, res) => {
      const row = await parent(req, name, req.params.clientId);
      const result = await repo.serialize(name, row, { children: true });
      result.risks = await Promise.all(
        (
          await repo.find("CarePlanRisksMitigationsEntity", {
            entityId: row.id,
            entityType: careType(key),
            deletedAt: null,
          })
        ).map((r) => repo.serialize("CarePlanRisksMitigationsEntity", r)),
      );
      if (entities[name].fields.some((f) => f.name === "taskPlans"))
        result.taskPlans = await Promise.all(
          (
            await repo.find("ClientTaskPlanEntity", {
              entityId: row.id,
              entityType: careType(key),
            })
          ).map(async (t) => ({
            ...(await repo.serialize("ClientTaskPlanEntity", t)),
            task: await repo.get("ClientTaskEntity", t.task),
          })),
        );
      return reply(res, result);
    });
    if (
      entities[name].fields.some((f) => f.name === "assessmentSummaryOutcomes")
    )
      route("PUT", prefix + "/:clientId", async (req, res) => {
        auth.admin(req);
        const row = await parent(req, name, req.params.clientId);
        const updated = await repo.save(name, {
          id: row.id,
          assessmentSummaryOutcomes: req.body.assessmentSummaryOutcomes,
          updatedBy: req.user.id,
        });
        return reply(
          res,
          await repo.serialize(name, updated, { children: true }),
        );
      });
    route("POST", prefix + "/assessment/:clientId", async (req, res) =>
      db.transaction(async () => {
        auth.admin(req);
        const row = await parent(req, name, req.params.clientId),
          body = req.body;
        const old = body.id
          ? requireValue(
              await repo.get(assessmentName, uuid(body.id)),
              "Assessment not found",
            )
          : null;
        if (old && old[association.mappedBy] !== row.id)
          fail(404, "Assessment not found");
        const data = {
          ...repo.input(assessmentName, body),
          id: old?.id,
          [association.mappedBy]: row.id,
          createdBy: old?.createdBy || req.user.id,
          updatedBy: req.user.id,
        };
        if (body.assessmentInprogress === false) {
          data.submittedBy = req.user.id;
          data.submittedAt = new Date().toISOString();
        }
        if (body.reviewInprogress === false) {
          data.reviewedBy = req.user.id;
          data.reviewedAt = new Date().toISOString();
        }
        const saved = await repo.save(assessmentName, data);
        return reply(
          res,
          await repo.serialize(assessmentName, saved),
          "Assessment saved",
        );
      }),
    );
    async function assessmentAccess(req) {
      const assessment = requireValue(
        await repo.get(assessmentName, uuid(req.params.id)),
        "Assessment not found",
      );
      const plan = requireValue(
        await repo.get(name, assessment[association.mappedBy]),
        "Care plan not found",
      );
      await auth.userAccess(req, plan.user);
      return assessment;
    }
    route("GET", prefix + "/assessment/:id", async (req, res) =>
      reply(
        res,
        await repo.serialize(assessmentName, await assessmentAccess(req)),
      ),
    );
    route("DELETE", prefix + "/assessment/:id", async (req, res) => {
      auth.admin(req);
      const row = await assessmentAccess(req);
      await repo.remove(assessmentName, row.id);
      return reply(res, {}, "Assessment deleted successfully");
    });
    route("POST", prefix + "/risk/:clientId", async (req, res) =>
      db.transaction(async () => {
        auth.admin(req);
        const row = await parent(req, name, req.params.clientId),
          body = req.body;
        const old = body.id ? await riskAccess(req, body.id, key) : null;
        if (old && old.entityId !== row.id) fail(404, "Risk not found");
        if (!String(body.risk ?? old?.risk ?? "").trim())
          fail(400, "Risk is required");
        const risk = await repo.save("CarePlanRisksMitigationsEntity", {
          ...repo.input("CarePlanRisksMitigationsEntity", body),
          id: old?.id,
          entityId: row.id,
          entityType: careType(key),
          createdBy: old?.createdBy || req.user.id,
          updatedBy: req.user.id,
        });
        return reply(
          res,
          await repo.serialize("CarePlanRisksMitigationsEntity", risk),
        );
      }),
    );
    route("GET", prefix + "/risk/:id", getRisk(key));
    route("DELETE", prefix + "/risk/:id", deleteRisk(key));
  }
  route("GET", "/api/care-plan/risk/:id", getRisk());
  route("DELETE", "/api/care-plan/risk/:id", deleteRisk());
}
