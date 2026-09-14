import { configuration } from "../src/config.js";
import { openDatabase, entities, sqlType } from "../src/db.js";
const db = await openDatabase(configuration());
try {
  const { rows } = await db.query(
    "SELECT table_name,column_name,data_type FROM information_schema.columns WHERE table_schema=current_schema()",
  );
  const actual = new Map(
      rows.map((r) => [r.table_name + "." + r.column_name, r.data_type]),
    ),
    missing = [],
    typeWarnings = [];
  for (const [name, m] of Object.entries(entities))
    for (const f of m.fields) {
      if (f.inverse) continue;
      const expected = f.collection
        ? [
            {
              table: f.collection.table,
              column: f.collection.owner,
              type: "uuid",
            },
            {
              table: f.collection.table,
              column: f.collection.value,
              type: sqlType(f),
            },
            ...(f.collection.key
              ? [
                  {
                    table: f.collection.table,
                    column: f.collection.key,
                    type: "text",
                  },
                ]
              : []),
          ]
        : [{ table: m.table, column: f.column, type: sqlType(f) }];
      for (const e of expected) {
        const key = e.table + "." + e.column,
          found = actual.get(key);
        if (!found) missing.push(key);
        else if (
          !(
            {
              text: ["text", "character varying"],
              timestamp: ["timestamp without time zone"],
              time: ["time without time zone"],
            }[e.type] || [e.type]
          ).includes(found)
        )
          typeWarnings.push({ column: key, expected: e.type, actual: found });
      }
    }
  for (const table of ["node_sessions", "node_login_links", "node_audit_log", "node_roster_visits"])
    if (!rows.some((r) => r.table_name === table)) missing.push(table);
  console.log(
    JSON.stringify(
      {
        models: Object.keys(entities).length,
        missing: [...new Set(missing)],
        typeWarnings,
      },
      null,
      2,
    ),
  );
  if (missing.length || typeWarnings.length) process.exitCode = 1;
} finally {
  await db.close();
}
