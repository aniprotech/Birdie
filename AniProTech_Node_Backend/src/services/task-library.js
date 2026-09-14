import { z } from "zod";
import { reply, fail, uuid } from "../http.js";
export const visibleLibraryItem = (row, agency) =>
  row && (!row.agencyId || row.agencyId === agency);
export function registerTaskLibrary({ repo, db, auth }, route) {
  const canEdit = (req, t) =>
    !!t.agencyId &&
    t.agencyId === req.user.agencyId &&
    (req.user.role !== "CAREGIVER" || t.createdBy === req.user.id);
  const output = (req, t) => ({
    ...t,
    canEdit: canEdit(req, t),
    source: t.agencyId ? "Organisation" : "Built-in",
  });
  route("GET", "/api/task-library", async (req, res) => {
    const page = Number(req.query.page || 1),
      search = String(req.query.search || "")
        .trim()
        .toLowerCase(),
      category = req.query.category || null;
    if (!req.user.agencyId) fail(403, "An organisation is required");
    if (!Number.isInteger(page) || page < 1 || search.length > 200)
      fail(400, "Invalid library filter");
    if (category) uuid(category);
    const categories = (await repo.find("ClientTaskCategoryEntity"))
      .filter((c) => visibleLibraryItem(c, req.user.agencyId))
      .sort((a, b) => a.name.localeCompare(b.name));
    const categoryIds = new Set(categories.map((c) => c.id));
    const all = (await repo.find("ClientTaskEntity")).filter(
      (t) =>
        visibleLibraryItem(t, req.user.agencyId) &&
        categoryIds.has(t.clientTaskCategory) &&
        (!t.archived || req.query.archived === "true"),
    );
    const matching = all
      .filter(
        (t) =>
          (!category || t.clientTaskCategory === category) &&
          `${t.name} ${t.description || ""}`.toLowerCase().includes(search),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
    return reply(res, {
      categories: categories.map((c) => ({
        ...c,
        count: all.filter((t) => t.clientTaskCategory === c.id).length,
      })),
      totalCount: matching.length,
      totalLibraryCount: all.length,
      page,
      size: 40,
      tasks: matching
        .slice((page - 1) * 40, page * 40)
        .map((t) => output(req, t)),
    });
  });
  route("POST", "/api/task-library/categories", async (req, res) => {
    const name = z.string().trim().min(2).max(100).safeParse(req.body.name);
    if (!name.success) fail(400, "Enter a category name of 2–100 characters");
    if (!req.user.agencyId) fail(403, "An organisation is required");
    await db.query(
      "LOCK TABLE client_task_categories IN SHARE ROW EXCLUSIVE MODE",
    );
    if (
      (await repo.find("ClientTaskCategoryEntity")).some(
        (c) =>
          visibleLibraryItem(c, req.user.agencyId) &&
          c.name.trim().toLowerCase() === name.data.toLowerCase(),
      )
    )
      fail(409, "This category already exists");
    const row = await repo.save("ClientTaskCategoryEntity", {
      name: name.data,
      agencyId: req.user.agencyId,
      createdBy: req.user.id,
    });
    return reply(res, row, "Shared category created", 201);
  });
  async function save(req, res, editing) {
    if (!req.user.agencyId) fail(403, "An organisation is required");
    const parsed = z
      .object({
        name: z.string().trim().min(2).max(200),
        description: z.string().trim().max(8000).default(""),
        categoryId: z.uuid(),
        revision: z.number().int().positive().optional(),
      })
      .safeParse(req.body);
    if (!parsed.success)
      fail(
        400,
        "Enter a task name, category and reusable instructions (up to 8,000 characters)",
      );
    const b = parsed.data,
      category = await repo.get("ClientTaskCategoryEntity", b.categoryId);
    if (!visibleLibraryItem(category, req.user.agencyId))
      fail(404, "Category not found");
    await db.query("LOCK TABLE client_tasks IN SHARE ROW EXCLUSIVE MODE");
    const old = editing
      ? await repo.get("ClientTaskEntity", req.params.taskId)
      : null;
    if (editing && (!old || !visibleLibraryItem(old, req.user.agencyId)))
      fail(404, "Task not found");
    if (editing && !canEdit(req, old))
      fail(
        403,
        "Only the author or an administrator can edit organisation tasks",
      );
    if (editing && b.revision !== old.revision)
      fail(409, "This library task changed. Reload before saving");
    if (
      (await repo.find("ClientTaskEntity")).some(
        (t) =>
          t.id !== old?.id &&
          visibleLibraryItem(t, req.user.agencyId) &&
          !t.archived &&
          t.clientTaskCategory === b.categoryId &&
          t.name.trim().toLowerCase() === b.name.toLowerCase(),
      )
    )
      fail(409, "A task with this name already exists in this category");
    if (old)
      await db.query(
        "UPDATE client_task_plans SET task_name_snapshot=COALESCE(task_name_snapshot,$2),category_name_snapshot=COALESCE(category_name_snapshot,(SELECT name FROM client_task_categories WHERE id=$3)) WHERE task_id=$1",
        [old.id, old.name, old.clientTaskCategory],
      );
    const row = await repo.save("ClientTaskEntity", {
      id: old?.id,
      name: b.name,
      description: b.description,
      clientTaskCategory: b.categoryId,
      agencyId: req.user.agencyId,
      createdBy: old?.createdBy || req.user.id,
      archived: old?.archived || false,
      revision: (old?.revision || 0) + 1,
    });
    return reply(
      res,
      output(req, row),
      "Shared task saved",
      editing ? 200 : 201,
    );
  }
  route("POST", "/api/task-library/tasks", (req, res) => save(req, res, false));
  route("PUT", "/api/task-library/tasks/:taskId", (req, res) =>
    save(req, res, true),
  );
  route("PUT", "/api/task-library/tasks/:taskId/archive", async (req, res) => {
    await db.query("LOCK TABLE client_tasks IN SHARE ROW EXCLUSIVE MODE");
    const old = await repo.get("ClientTaskEntity", req.params.taskId);
    if (!visibleLibraryItem(old, req.user.agencyId))
      fail(404, "Task not found");
    if (!canEdit(req, old))
      fail(
        403,
        "Only the author or an administrator can archive organisation tasks",
      );
    if (req.body.revision !== old.revision)
      fail(409, "This task changed. Reload before saving");
    if (typeof req.body.archived !== "boolean")
      fail(400, "Specify whether to archive or restore");
    if (
      !req.body.archived &&
      (await repo.find("ClientTaskEntity")).some(
        (t) =>
          t.id !== old.id &&
          visibleLibraryItem(t, req.user.agencyId) &&
          !t.archived &&
          t.clientTaskCategory === old.clientTaskCategory &&
          t.name.trim().toLowerCase() === old.name.trim().toLowerCase(),
      )
    )
      fail(409, "An active task already has this name in this category");
    const row = await repo.save("ClientTaskEntity", {
      ...old,
      archived: req.body.archived,
      revision: old.revision + 1,
    });
    return reply(res, output(req, row), "Library updated");
  });
}
