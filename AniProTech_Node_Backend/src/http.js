import { z } from "zod";
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export const fail = (status, message) => {
  throw new HttpError(status, message);
};
export const requireValue = (value, message = "Not found") =>
  value || fail(404, message);
export const uuid = (value) => {
  if (!z.uuid().safeParse(value).success) fail(400, "A valid UUID is required");
  return value;
};
export function reply(res, data = {}, message = "Success", status = 200) {
  return res
    .status(status)
    .json({
      message,
      error: false,
      code: status,
      results: { data: data ?? {} },
    });
}
export function pagination(body = {}) {
  const page = Number(body.page ?? 1),
    size = Number(body.size ?? 20);
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(size) ||
    size < 1 ||
    size > 200
  )
    fail(400, "page must be positive and size must be between 1 and 200");
  return { page, size, offset: (page - 1) * size };
}
export const actorSummary = (u) =>
  u ? { id: u.id, firstName: u.firstName, lastName: u.lastName } : null;
export function dates(data) {
  for (const [key, value] of Object.entries(data)) {
    if (
      value &&
      /Date$|^started$|^endsOn$/.test(key) &&
      typeof value === "string" &&
      !/^\d{4}-\d{2}-\d{2}$/.test(value)
    )
      fail(400, `${key} must use YYYY-MM-DD`);
  }
  if (data.startDate && data.endDate && data.endDate < data.startDate)
    fail(400, "End date must not precede start date");
}
