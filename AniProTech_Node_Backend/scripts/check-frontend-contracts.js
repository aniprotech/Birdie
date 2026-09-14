import fs from "node:fs";
import vm from "node:vm";
import { createApp } from "../src/app.js";
const source = fs.readFileSync(
  new URL("../../AniProTech_UI-main/src/utils/ApiConfig.jsx", import.meta.url),
  "utf8",
);
const api = vm.runInNewContext(
  source
    .replaceAll("import.meta.env.VITE_APP_BASE_LIVE_URL", '"http://local"')
    .replace("export default APIConfig;", "APIConfig;"),
  {},
  { timeout: 1000 },
);
const normalize = (p) => p.replace(/\{[^}]+\}|:[^/]+/g, ":id");
const app = createApp({
  db: {},
  config: {
    production: false,
    corsOrigins: [],
    jwtSecret: "inspection",
    uploadDir: "uploads",
  },
  mail: {},
});
const actual = new Set(app.locals.routeInventory.map((r) => normalize(r.path)));
const unavailable = [];
function visit(object, prefix = "") {
  for (const [key, value] of Object.entries(object)) {
    if (typeof value === "object") visit(value, prefix + key + ".");
    else {
      const url =
        typeof value === "function" ? value(":id", ":id", ":id") : value;
      if (typeof url === "string" && url.startsWith("http://local")) {
        const route = url.slice("http://local".length).split("?")[0];
        if (!actual.has(normalize(route)))
          unavailable.push({ constant: prefix + key, path: route });
      }
    }
  }
}
visit(api);
fs.writeFileSync(
  new URL("../docs/frontend-unavailable-endpoints.json", import.meta.url),
  JSON.stringify(unavailable, null, 2),
);
console.log(
  JSON.stringify(
    {
      unavailableConstants: unavailable.length,
      distinctUnavailablePaths: [...new Set(unavailable.map((r) => r.path))],
    },
    null,
    2,
  ),
);
