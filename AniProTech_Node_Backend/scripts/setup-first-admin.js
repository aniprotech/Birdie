import { randomUUID } from "node:crypto";
import { configuration } from "../src/config.js";
import { openDatabase } from "../src/db.js";
import { Repository } from "../src/repository.js";
import { createAuth } from "../src/auth.js";
import { createMail } from "../src/mail.js";

const config = configuration();
if (config.mailMode !== "outbox" || config.production)
  throw new Error("This local setup requires development outbox mode.");
const db = await openDatabase(config);
const repo = new Repository(db);
try {
  const email = "info@aniprotech.com";
  await db.transaction(async () => {
    await db.query("LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE");
    const existing = (await db.query("SELECT id FROM users WHERE lower(email)=$1", [email])).rows[0];
    if (existing) {
      const user = await repo.get("UserEntity", existing.id);
      if (user.role !== "ADMIN" || !user.isActive || !user.agencyId)
        throw new Error("Existing account requires review; no changes made.");
    } else {
      const { rows } = await db.query("SELECT count(*)::int AS count FROM users");
      if (rows[0].count !== 0) throw new Error("First-admin setup requires an empty user table.");
      await repo.save("UserEntity", {
        id: randomUUID(), agencyId: randomUUID(), firstName: "Anipro",
        lastName: "Tech", preferredName: "Anipro Tech", email,
        role: "ADMIN", isActive: true,
      });
    }
  });
  const auth = createAuth({ db, repo, config, mail: createMail(config) });
  await auth.requestLink(email);
  console.log("Verified active administrator: info@aniprotech.com (Anipro Tech). Login link saved to local outbox; no email sent.");
} finally {
  await db.close();
}
