import { readFileSync } from "node:fs";
import { createApp } from "../src/app.js";
const normalize = (p) => p.replace(/\{[^}]+\}|:[^/]+/g, ":id");
const original = JSON.parse(
  readFileSync(new URL("../docs/java-api-inventory.json", import.meta.url)),
);
const app = createApp({
  db: {},
  config: {
    production: false,
    corsOrigins: [],
    jwtSecret: "route-inspection-only",
    uploadDir: "./uploads",
  },
  mail: {},
});
const actual = new Set(
  app.locals.routeInventory.map((r) => r.method + " " + normalize(r.path)),
);
const missing = original.filter(
  (r) => !actual.has(r.method + " " + normalize(r.path)),
);
console.log(
  JSON.stringify(
    { javaRoutes: original.length, expressRoutes: actual.size, missing },
    null,
    2,
  ),
);
if (missing.length) process.exitCode = 1;
