import { createHash, randomBytes, randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { fail, requireValue, uuid, reply } from "./http.js";

const hash = (value) => createHash("sha256").update(value).digest("hex");
export function createAuth({ db, repo, config, mail }) {
  const publicUser = (user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    primaryPhone: user.primaryPhone,
    role: user.role,
    isActive: user.isActive,
  });
  async function requestLink(email, { mobile = false } = {}) {
    if (!z.email().safeParse(email).success)
      fail(400, "A valid email address is required");
    email = email.toLowerCase().trim();
    const row = (
      await db.query("SELECT id FROM users WHERE lower(email)=$1", [email])
    ).rows[0];
    const user = row ? await repo.get("UserEntity", row.id) : null;
    // Identical response for unknown and inactive users prevents account enumeration.
    if (
      !user ||
      !user.isActive ||
      !["ADMIN", "SUPERADMIN", "CAREGIVER"].includes(user.role)
    )
      return;
    const secret = randomBytes(32).toString("hex"),
      id = randomUUID();
    await db.query(
      "INSERT INTO node_login_links(id,user_id,secret_hash,expires_at) VALUES($1,$2,$3,$4)",
      [
        id,
        user.id,
        hash(secret),
        new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      ],
    );
    const token = Buffer.from(`${email}:${secret}`).toString("base64url");
    const link = mobile ? new URL("aniprotech://login") : new URL("/login", config.frontendUrl);
    link.searchParams.set("token", token);
    await mail.send({
      to: user.email,
      subject: "Your AniProTech login link",
      text: `Use this one-time link within 15 minutes:\n${link}`,
    });
  }
  async function exchange(email, password) {
    if (
      !z.email().safeParse(email).success ||
      typeof password !== "string" ||
      password.length < 1 ||
      password.length > 512
    )
      fail(400, "Email and login token are required");
    return db.transaction(async () => {
      const { rows } = await db.query(
        "SELECT l.*,u.id AS uid FROM node_login_links l JOIN users u ON u.id=l.user_id WHERE lower(u.email)=$1 AND l.secret_hash=$2 AND l.used_at IS NULL AND l.expires_at>CURRENT_TIMESTAMP FOR UPDATE",
        [email.toLowerCase().trim(), hash(password)],
      );
      if (!rows[0]) fail(401, "Invalid, expired or already used login link");
      const user = await repo.get("UserEntity", rows[0].uid);
      if (
        !user.isActive ||
        !["ADMIN", "SUPERADMIN", "CAREGIVER"].includes(user.role)
      )
        fail(401, "Account cannot sign in");
      await db.query(
        "UPDATE node_login_links SET used_at=CURRENT_TIMESTAMP WHERE id=$1",
        [rows[0].id],
      );
      const session = randomUUID(),
        expiresAt = new Date(Date.now() + 86400000).toISOString();
      await db.query(
        "INSERT INTO node_sessions(id,user_id,expires_at) VALUES($1,$2,$3)",
        [session, user.id, expiresAt],
      );
      const accessToken = jwt.sign(
        { email: user.email, role: user.role },
        config.jwtSecret,
        {
          subject: user.id,
          jwtid: session,
          expiresIn: "24h",
          issuer: "aniprotech",
          audience: "aniprotech-app",
          algorithm: "HS256",
        },
      );
      return { user: publicUser(user), accessToken };
    });
  }
  async function authenticate(req, res, next) {
    try {
      const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
      if (!token) fail(401, "Authorization token is required");
      let claims;
      try {
        claims = jwt.verify(token, config.jwtSecret, {
          algorithms: ["HS256"],
          issuer: "aniprotech",
          audience: "aniprotech-app",
        });
      } catch {
        fail(401, "Invalid or expired token");
      }
      const session = (
        await db.query(
          "SELECT id FROM node_sessions WHERE id=$1 AND user_id=$2 AND revoked_at IS NULL AND expires_at>CURRENT_TIMESTAMP",
          [claims.jti, claims.sub],
        )
      ).rows[0];
      if (!session) fail(401, "Session expired or revoked");
      const user = await repo.get("UserEntity", claims.sub);
      if (!user?.isActive) fail(401, "Account is inactive");
      if (!["ADMIN", "SUPERADMIN", "CAREGIVER"].includes(user.role))
        fail(403, "Access denied");
      req.user = user;
      req.sessionId = claims.jti;
      req.accessToken = token;
      next();
    } catch (error) {
      next(error);
    }
  }
  async function userAccess(req, id, { staff = false, write = false } = {}) {
    uuid(id);
    const user = requireValue(
      await repo.get("UserEntity", id),
      "User not found",
    );
    if (!req.user.agencyId || req.user.agencyId !== user.agencyId)
      fail(404, "User not found");
    if (staff && user.role === "USER") fail(404, "Team member not found");
    if (write && req.user.role === "CAREGIVER")
      fail(403, "Administrator access required");
    if (req.user.role === "CAREGIVER" && user.id !== req.user.id) {
      if (user.role !== "USER") fail(403, "Access denied");
      const assignment = await repo.one("ClientCareTeamEntity", {
        carer: req.user.id,
        client: id,
      });
      if (
        !assignment ||
        assignment.deletedAt ||
        !assignment.viewAccess ||
        assignment.revokeViewaccess ||
        assignment.declineCarer
      )
        fail(403, "Client is not assigned to this carer");
    }
    return user;
  }
  function admin(req) {
    if (!["ADMIN", "SUPERADMIN"].includes(req.user.role))
      fail(403, "Administrator access required");
  }
  async function reset(id) {
    await db.transaction(async () => {
      await db.query(
        "UPDATE node_sessions SET revoked_at=CURRENT_TIMESTAMP WHERE user_id=$1",
        [id],
      );
      await db.query(
        "UPDATE node_login_links SET used_at=CURRENT_TIMESTAMP WHERE user_id=$1 AND used_at IS NULL",
        [id],
      );
    });
  }
  return {
    requestLink,
    exchange,
    authenticate,
    userAccess,
    admin,
    reset,
    publicUser,
  };
}
