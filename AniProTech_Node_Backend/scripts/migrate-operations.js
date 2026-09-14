import { configuration } from "../src/config.js";
import { openDatabase } from "../src/db.js";
import { initializeOperations } from "../src/operations-schema.js";
const db = await openDatabase(configuration());
try {
  await db.transaction(() => initializeOperations(db));
  console.log("Operations tables ready. Existing records retained.");
} finally {
  await db.close();
}
