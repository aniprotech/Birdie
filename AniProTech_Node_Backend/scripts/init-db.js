import { configuration } from "../src/config.js";
import { openDatabase, initializeSchema } from "../src/db.js";
const config = configuration();
const db = await openDatabase(config);
try {
  await initializeSchema(db);
  console.log(
    "Database schema initialized. Existing tables and data were retained.",
  );
} finally {
  await db.close();
}
