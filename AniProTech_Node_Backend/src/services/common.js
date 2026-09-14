import { fail, requireValue, uuid, dates } from "../http.js";
export const parseJson = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    fail(400, "Invalid JSON form field");
  }
};
export async function replaceChildren(
  repo,
  name,
  parentField,
  parentId,
  items,
  req,
  extra = {},
) {
  if (items === undefined) return;
  if (!Array.isArray(items) || items.length > 200)
    fail(400, "Expected an array with at most 200 items");
  const previous = await repo.find(name, { [parentField]: parentId }),
    keep = new Set();
  for (const item of items) {
    dates(item);
    if (item.id && !previous.some((p) => p.id === item.id))
      fail(404, "Related record does not belong to this parent");
    const saved = await repo.save(name, {
      ...repo.input(name, item),
      id: item.id || undefined,
      [parentField]: parentId,
      ...extra,
      createdBy: item.id
        ? previous.find((p) => p.id === item.id).createdBy
        : req.user.id,
      updatedBy: req.user.id,
    });
    keep.add(saved.id);
  }
  for (const old of previous)
    if (!keep.has(old.id)) await repo.remove(name, old.id);
}
export async function ownedRecord(ctx, req, name, id, { write = false } = {}) {
  const row = requireValue(
    await ctx.repo.get(name, uuid(id)),
    "Record not found",
  );
  if (row.deletedAt) fail(404, "Record not found");
  await ctx.auth.userAccess(req, row.user, { write });
  return row;
}
export async function singleton(ctx, req, name, userId, body, trusted = {}) {
  await ctx.auth.userAccess(req, userId, { write: body !== undefined });
  const old = await ctx.repo.one(name, { user: userId });
  if (body === undefined) return old;
  dates(body);
  return ctx.repo.save(name, {
    ...ctx.repo.input(name, body),
    ...trusted,
    id: old?.id,
    user: userId,
    createdBy: old?.createdBy || req.user.id,
    updatedBy: req.user.id,
  });
}
export function overlap(start, end, range) {
  return (
    (!range.endDate || !start || start <= range.endDate) &&
    (!range.startDate || !end || end >= range.startDate)
  );
}
