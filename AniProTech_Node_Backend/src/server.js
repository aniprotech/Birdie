import { configuration } from "./config.js";
import { openDatabase } from "./db.js";
import { initializeRegistration } from "./registration-schema.js";
import { createApp } from "./app.js";
const config = configuration(),
  db = await openDatabase(config);
// Schema changes are explicit: run npm run db:init before the first start.
await db.query("SELECT id FROM node_sessions LIMIT 1");
// Registration must be available during rolling deploys even if the platform's
// pre-deploy migration hook is skipped. This initializer is idempotent.
await initializeRegistration(db);
const app = createApp({ db, config });
const stopNotifications=app.locals.ctx.notifications.start();
const server = app.listen(config.port, config.host, () =>
  console.log(
    `AniProTech Express listening at http://${config.host}:${config.port}`,
  ),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(async () => {
      await stopNotifications();
      await db.close();
      process.exit(0);
    }),
  );
