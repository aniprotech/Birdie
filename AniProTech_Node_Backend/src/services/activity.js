import { reply, fail } from "../http.js";
export function dateRange(query, max = 366) {
  const { from, to } = query;
  const valid = (d) =>
    typeof d === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(d) &&
    !isNaN(Date.parse(d)) &&
    new Date(d).toISOString().slice(0, 10) === d;
  if (
    !valid(from) ||
    !valid(to) ||
    to < from ||
    (Date.parse(to) - Date.parse(from)) / 86400000 > max
  )
    fail(400, `Choose a valid date range of up to ${max + 1} days`);
  return { from, to };
}
export function registerActivity({ db, auth }, route) {
  route("GET", "/api/activity", async (req, res) => {
    auth.admin(req);
    const { from, to } = dateRange(req.query);
    const page = Number(req.query.page || 1);
    if (!Number.isInteger(page) || page < 1) fail(400, "Invalid page");
    const { rows } = await db.query(
      `SELECT a.id,a.method,a.path,(a.created_at AT TIME ZONE 'UTC') AS "createdAt",
      COALESCE(u.first_name||' '||u.last_name,'Former user') AS actor
      FROM node_audit_log a LEFT JOIN users u ON u.id=a.actor_id
      WHERE a.agency_id=$1 AND ((a.created_at AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/London')::date BETWEEN $2 AND $3
      AND ($4::text='' OR a.path ILIKE '%'||$4||'%')
      ORDER BY a.created_at DESC,a.id LIMIT 51 OFFSET $5`,
      [
        req.user.agencyId,
        from,
        to,
        String(req.query.search || "").slice(0, 100),
        (page - 1) * 50,
      ],
    );
    return reply(res, {
      entries: rows.slice(0, 50),
      hasMore: rows.length > 50,
    });
  });
}
