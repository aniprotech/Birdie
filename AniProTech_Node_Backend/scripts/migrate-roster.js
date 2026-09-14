import { configuration } from "../src/config.js";
import { openDatabase } from "../src/db.js";
import { initializeRoster } from "../src/roster-schema.js";
const db = await openDatabase(configuration());
try {
  await db.transaction(() => initializeRoster(db));
  console.log("Roster tables ready. Existing records retained.");
} finally {
  await db.close();
}
