import { visibleLibraryItem } from "./task-library.js";
import { reply, fail, requireValue, pagination, dates, uuid } from "../http.js";
import { ownedRecord } from "./common.js";
import { carePlans, careType } from "./care-plans.js";

export function validateRecurrence(data, { task = false } = {}) {
  dates(data);
  if (data.frequency === "WEEKLY" && !data.selectedDays?.length)
    fail(400, "Weekly schedules require selectedDays");
  if (data.frequency === "CUSTOM") {
    if (
      !Number.isInteger(Number(data.repeatEvery)) ||
      Number(data.repeatEvery) <= 0 ||
      !data.repeatUnit
    )
      fail(
        400,
        "Custom schedules require a positive repeatEvery and repeatUnit",
      );
    if (data.repeatUnit === "WEEKS" && !data.selectedDays?.length)
      fail(400, "Weekly custom schedules require selectedDays");
  }
  if (task) {
    if (data.isAnyTime === true && data.sessions?.length)
      fail(400, "Sessions must be empty when isAnyTime is true");
    if (data.isAnyTime === false && !data.sessions?.length)
      fail(400, "Sessions are required when isAnyTime is false");
  }
}
export function registerTasks(ctx, route) {
  const { repo, auth, db } = ctx;
  const links = {
    personalCareId: "personal-care",
    everydayActivityId: "every-day-activity",
    socialSupportId: "social-support",
    environmentalId: "environmental",
    administrativeId: "administrative",
    psychologicalId: "psychological",
    nutritionHydrationId: "nutrition-hydration",
  };
  async function taskOutput(row, req) {
    const task = await repo.get("ClientTaskEntity", row.task),
      category = task
        ? await repo.get("ClientTaskCategoryEntity", task.clientTaskCategory)
        : null;
    return {
      ...(await repo.serialize("ClientTaskPlanEntity", row)),
      taskId: row.task,
      userId: row.user,
      task: task
        ? {
            ...(await repo.serialize("ClientTaskEntity", task)),
            name: row.taskNameSnapshot || task.name,
            category,
          }
        : null,
      taskName: row.taskNameSnapshot || task?.name,
      categoryName: row.categoryNameSnapshot || category?.name,
      canEdit: req.user.role !== "CAREGIVER" || row.createdBy === req.user.id,
    };
  }
  route("GET", "/api/client-task-plan/categories", async (req, res) => {
    const categories = (await repo.find("ClientTaskCategoryEntity")).filter(
      (c) => visibleLibraryItem(c, req.user.agencyId),
    );
    return reply(res, {
      totalCount: categories.length,
      categories: await Promise.all(
        categories.map(async (c) => ({
          ...c,
          tasks: (
            await repo.find("ClientTaskEntity", { clientTaskCategory: c.id })
          ).filter(
            (t) => visibleLibraryItem(t, req.user.agencyId) && !t.archived,
          ),
        })),
      ),
    });
  });
  route("POST", "/api/client-task-plan/tasks", async (req, res) => {
    const search = String(req.body.searchString || "").toLowerCase();
    return reply(
      res,
      await Promise.all(
        (await repo.find("ClientTaskEntity"))
          .filter(
            (t) =>
              visibleLibraryItem(t, req.user.agencyId) &&
              !t.archived &&
              t.name?.toLowerCase().includes(search),
          )
          .map((t) => repo.serialize("ClientTaskEntity", t)),
      ),
    );
  });
  route("POST", "/api/client-task-plan/categories/tasks", async (req, res) => {
    const categories = [];
    let totalTaskCount = 0;
    for (const category of await repo.find("ClientTaskCategoryEntity")) {
      if (!visibleLibraryItem(category, req.user.agencyId)) continue;
      if (req.body.category?.length && !req.body.category.includes(category.id))
        continue;
      const tasks = (
        await repo.find("ClientTaskEntity", { clientTaskCategory: category.id })
      ).filter(
        (t) =>
          visibleLibraryItem(t, req.user.agencyId) &&
          !t.archived &&
          String(t.name)
            .toLowerCase()
            .includes(String(req.body.searchString || "").toLowerCase()),
      );
      if (tasks.length) {
        totalTaskCount += tasks.length;
        categories.push({
          categoryId: category.id,
          categoryName: category.name,
          taskCount: tasks.length,
          tasks: await Promise.all(
            tasks.map((t) => repo.serialize("ClientTaskEntity", t)),
          ),
        });
      }
    }
    // This extra data level is present in the Java response and consumed by the UI.
    return reply(res, { data: { totalTaskCount, categories } });
  });
  async function save(req, id) {
    if (id)
      await db.query(
        "SELECT id FROM client_task_plans WHERE id=$1 FOR UPDATE",
        [id],
      );
    const old = id
      ? await ownedRecord(ctx, req, "ClientTaskPlanEntity", id)
      : null;
    const body = req.body,
      userId = body.userId || old?.user;
    const client = await auth.userAccess(req, userId);
    if (client.role !== "USER" || client.deletedAt)
      fail(404, "Client not found");
    if (old && req.user.role === "CAREGIVER" && old.createdBy !== req.user.id)
      fail(
        403,
        "Only the author or an administrator can edit this client task",
      );
    if (
      old &&
      body.revision !== undefined &&
      body.revision !== (old.revision || 1)
    )
      fail(409, "This task plan changed. Reload before saving");
    if (old && old.user !== userId)
      fail(400, "Task plans cannot be moved between clients");
    const taskId = body.taskId || old?.task;
    const libraryTask = await repo.get("ClientTaskEntity", uuid(taskId));
    if (!visibleLibraryItem(libraryTask, req.user.agencyId))
      fail(404, "Task not found");
    if (libraryTask.archived && old?.task !== taskId)
      fail(400, "This library task is archived. Choose an active task");
    const category = await repo.get(
      "ClientTaskCategoryEntity",
      libraryTask.clientTaskCategory,
    );
    if (!visibleLibraryItem(category, req.user.agencyId))
      fail(404, "Category not found");
    const data = {
      ...old,
      ...repo.input("ClientTaskPlanEntity", body),
      id: old?.id,
      task: taskId,
      taskNameSnapshot:
        old?.task === taskId
          ? old.taskNameSnapshot || libraryTask.name
          : libraryTask.name,
      categoryNameSnapshot:
        old?.task === taskId
          ? old.categoryNameSnapshot || category.name
          : category.name,
      revision: (old?.revision || 0) + 1,
      user: userId,
      createdBy: old?.createdBy || req.user.id,
      updatedBy: req.user.id,
    };
    // Ownership fields can only be derived from a verified care plan reference.
    data.entityId = old?.entityId ?? null;
    data.entityType = old?.entityType ?? null;
    const supplied = Object.entries(links).filter(([field]) => body[field]);
    if (supplied.length > 1)
      fail(400, "A task can belong to only one care plan");
    if (supplied.length) {
      const [field, key] = supplied[0],
        plan = requireValue(
          await repo.get(carePlans[key], uuid(body[field])),
          "Care plan not found",
        );
      if (plan.user !== userId) fail(404, "Care plan not found");
      data.entityId = plan.id;
      data.entityType = careType(key);
    }
    const validDate = (v) =>
      typeof v === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(v) &&
      !isNaN(Date.parse(v)) &&
      new Date(v).toISOString().slice(0, 10) === v;
    if (
      !validDate(data.startDate) ||
      (data.endDate && !validDate(data.endDate))
    )
      fail(400, "Enter valid start and end dates");
    if (!["DAILY", "WEEKLY", "CUSTOM"].includes(data.frequency))
      fail(400, "Choose a valid cadence");
    if (
      typeof data.details !== "undefined" &&
      (typeof data.details !== "string" || data.details.length > 20000)
    )
      fail(400, "Client instructions must be text up to 20,000 characters");
    data.selectedDays ??= [];
    if (
      !Array.isArray(data.selectedDays) ||
      new Set(data.selectedDays).size !== data.selectedDays.length
    )
      fail(400, "Choose unique weekdays");
    data.isAnyTime ??= true;
    if (typeof data.isAnyTime !== "boolean")
      fail(400, "Choose any time or specific sessions");
    data.sessions ??= [];
    if (
      !Array.isArray(data.sessions) ||
      new Set(data.sessions).size !== data.sessions.length
    )
      fail(400, "Choose unique sessions");
    data.timesPerDay = data.isAnyTime
      ? Number(body.timesPerDay ?? old?.timesPerDay ?? 1)
      : data.sessions.length;
    if (
      !Number.isInteger(data.timesPerDay) ||
      data.timesPerDay < 1 ||
      data.timesPerDay > 24
    )
      fail(400, "Choose 1–24 occurrences per day");
    if (data.isAnyTime === true) data.sessions = [];
    validateRecurrence(data, { task: true });
    return taskOutput(await repo.save("ClientTaskPlanEntity", data), req);
  }
  route("POST", "/api/client-task-plan/create", async (req, res) =>
    reply(
      res,
      await db.transaction(() => save(req)),
      "Task Plan Created Successfully",
      201,
    ),
  );
  route("PUT", "/api/client-task-plan/update/:taskPlanId", async (req, res) =>
    reply(res, await db.transaction(() => save(req, req.params.taskPlanId))),
  );
  route(
    "DELETE",
    "/api/client-task-plan/delete/:taskPlanId",
    async (req, res) => {
      const row = await ownedRecord(
        ctx,
        req,
        "ClientTaskPlanEntity",
        req.params.taskPlanId,
      );
      if (req.user.role === "CAREGIVER" && row.createdBy !== req.user.id)
        fail(
          403,
          "Only the author or an administrator can remove this client task",
        );
      await repo.remove("ClientTaskPlanEntity", row.id);
      return reply(res, {}, "Task Plan Deleted Successfully");
    },
  );
  route("GET", "/api/client-task-plan/getById/:taskPlanId", async (req, res) =>
    reply(
      res,
      await taskOutput(
        await ownedRecord(
          ctx,
          req,
          "ClientTaskPlanEntity",
          req.params.taskPlanId,
        ),
        req,
      ),
    ),
  );
  const list = async (req, res) => {
    await auth.userAccess(req, req.params.userId);
    const body = req.method === "GET" ? req.query : req.body,
      { size, offset } = pagination(body);
    let tasks = await Promise.all(
      (
        await repo.find("ClientTaskPlanEntity", { user: req.params.userId })
      ).map((row) => taskOutput(row, req)),
    );
    const query = String(body.search || body.searchString || "").toLowerCase();
    tasks = tasks.filter((t) =>
      `${t.taskName} ${t.details || ""}`.toLowerCase().includes(query),
    );
    for (const [key, field] of [
      ["task", "taskName"],
      ["frequency", "frequency"],
      ["startDate", "startDate"],
      ["endDate", "endDate"],
    ])
      if (["ASC", "DESC"].includes(body[key]?.toUpperCase()))
        tasks.sort(
          (a, b) =>
            String(a[field] || "").localeCompare(String(b[field] || "")) *
            (body[key].toUpperCase() === "ASC" ? 1 : -1),
        );
    return reply(res, {
      totalCount: tasks.length,
      taskPlans: tasks.slice(offset, offset + size),
    });
  };
  route("POST", "/api/client-task-plan/getByClient/:userId", list);
  route("GET", "/api/client-task-plan/getByClient/:userId", list);
}
