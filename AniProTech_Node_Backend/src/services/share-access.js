import {
  randomBytes,
  randomUUID,
  createHash,
  createCipheriv,
  createDecipheriv,
  timingSafeEqual,
} from "node:crypto";
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { reply, fail } from "../http.js";
const hash = (value) => createHash("sha256").update(value).digest("hex");
const actor = (u) => [u.firstName, u.lastName].filter(Boolean).join(" ");
const reserved = (email) => !email || /\.(test|invalid)$/i.test(email);
const scopeNames = ["BASIC", "MEDICAL", "CARE_LOG", "VISITS", "CARE_PLANS", "MESSAGES", "FEEDBACK"];
const feedbackKinds = ["QUALITY_FEEDBACK", "CONCERN", "COMPLAINT", "COMPLIMENT"];
function crypt(config, value, decrypt = false) {
  const key = createHash("sha256")
    .update("aniprotech-share-code:" + config.jwtSecret)
    .digest();
  if (decrypt) {
    const [nonce, tag, data] = value
      .split(".")
      .map((x) => Buffer.from(x, "hex"));
    const c = createDecipheriv("aes-256-gcm", key, nonce);
    c.setAuthTag(tag);
    return Buffer.concat([c.update(data), c.final()]).toString();
  }
  const nonce = randomBytes(12),
    c = createCipheriv("aes-256-gcm", key, nonce),
    data = Buffer.concat([c.update(value, "utf8"), c.final()]);
  return [nonce, c.getAuthTag(), data].map((x) => x.toString("hex")).join(".");
}
async function audit(db, grant, action, name, email = "") {
  await db.query(
    "INSERT INTO node_share_history(id,grant_id,action,actor_name,actor_email) VALUES($1,$2,$3,$4,$5)",
    [randomUUID(), grant, action, name, email],
  );
}
const portalUrl = (config, id, token) => {
  const url = new URL("/access", config.frontendUrl);
  url.hash = new URLSearchParams({
    share: id,
    ...(token ? { token } : {}),
  }).toString();
  return url.toString();
};
export function registerShareAccess(ctx, route) {
  const { db, repo, auth, config, mail } = ctx;
  async function client(req) {
    auth.admin(req);
    const id = req.params.clientId || req.body.clientId;
    const c = await auth.userAccess(req, id);
    if (c.role !== "USER" || c.deletedAt) fail(404, "Client not found");
    return c;
  }
  async function info(c) {
    const grant = (
      await db.query(
        "SELECT * FROM node_share_grants WHERE client_id=$1 AND agency_id=$2",
        [c.id, c.agencyId],
      )
    ).rows[0];
    const active =
      !!grant &&
      !grant.revoked_at &&
      new Date(grant.expires_at) > new Date() &&
      c.isActive;
    let code = null;
    if (active)
      try {
        code = crypt(config, grant.code_cipher, true);
      } catch {}
    const history = grant
      ? (
          await db.query(
            'SELECT action,actor_name AS "actorName",actor_email AS "actorEmail",created_at AS "createdAt" FROM node_share_history WHERE grant_id=$1 ORDER BY created_at DESC,id DESC LIMIT 100',
            [grant.id],
          )
        ).rows
      : [];
    const recipients = grant
      ? (await db.query(`SELECT id,recipient_name AS "name",email,access_level AS "accessLevel",scopes,expires_at AS "expiresAt",used_at AS "usedAt" FROM node_share_links WHERE grant_id=$1 AND recipient_name IS NOT NULL ORDER BY expires_at DESC LIMIT 100`, [grant.id])).rows
      : [];
    const feedback = grant
      ? (await db.query(`SELECT id,kind,rating,comment,created_at AS "createdAt" FROM node_portal_feedback WHERE grant_id=$1 ORDER BY created_at DESC LIMIT 100`, [grant.id])).rows
      : [];
    return {
      clientId: c.id,
      clientName: actor(c),
      clientEmail: c.email,
      active,
      accessCode: code,
      websiteUrl: grant
        ? portalUrl(config, grant.id)
        : new URL("/access", config.frontendUrl).toString(),
      shareId: grant?.id || null,
      scopes: grant?.scopes || ["BASIC", "CARE_LOG"],
      expiresAt: grant?.expires_at || null,
      revision: grant?.revision || 0,
      canSendMagicLink: active && !reserved(c.email),
      history,
      recipients,
      feedback,
    };
  }
  route("GET", "/api/client-share-access/:clientId", async (req, res) =>
    reply(res, await info(await client(req))),
  );
  route("POST", "/api/client-share-access/generate", async (req, res) => {
    const c = await client(req);
    if (!c.isActive) fail(400, "Activate the client before enabling sharing");
    const parsed = z
      .object({
        acknowledged: z.literal(true),
        days: z.number().int().min(1).max(30).default(7),
        scopes: z.array(z.enum(scopeNames)).min(1).max(scopeNames.length),
        revision: z.number().int().nonnegative(),
      })
      .safeParse(req.body);
    if (!parsed.success)
      fail(
        400,
        "Choose shared sections, an expiry of 1–30 days, and confirm permission to share",
      );
    await db.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [c.id]);
    const old = (
      await db.query(
        "SELECT * FROM node_share_grants WHERE client_id=$1 FOR UPDATE",
        [c.id],
      )
    ).rows[0];
    if (parsed.data.revision !== (old?.revision || 0))
      fail(409, "Sharing settings changed. Refresh before generating a code");
    const code = randomBytes(10)
        .toString("hex")
        .toUpperCase()
        .match(/.{4}/g)
        .join("-"),
      gid = old?.id || randomUUID(),
      expires = new Date(
        Date.now() + parsed.data.days * 86400000,
      ).toISOString();
    await db.query(
      `INSERT INTO node_share_grants(id,client_id,agency_id,code_hash,code_cipher,scopes,expires_at,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8)
   ON CONFLICT(client_id) DO UPDATE SET code_hash=EXCLUDED.code_hash,code_cipher=EXCLUDED.code_cipher,scopes=EXCLUDED.scopes,expires_at=EXCLUDED.expires_at,revoked_at=NULL,revision=node_share_grants.revision+1,updated_at=CURRENT_TIMESTAMP,last_email_at=NULL,failed_attempts=0,attempt_window=CURRENT_TIMESTAMP`,
      [
        gid,
        c.id,
        c.agencyId,
        hash(code.replaceAll("-", "")),
        crypt(config, code),
        JSON.stringify([...new Set(parsed.data.scopes)]),
        expires,
        req.user.id,
      ],
    );
    await audit(
      db,
      gid,
      old ? "CODE_REPLACED" : "SHARING_ENABLED",
      actor(req.user),
    );
    return reply(
      res,
      await info(c),
      "New code generated; previous codes, links and portal sessions are revoked",
    );
  });
  route("POST", "/api/client-share-access/revoke", async (req, res) => {
    const c = await client(req);
    const old = (
      await db.query(
        "SELECT * FROM node_share_grants WHERE client_id=$1 FOR UPDATE",
        [c.id],
      )
    ).rows[0];
    if (!old) fail(404, "Sharing is not enabled");
    if (req.body.revision !== old.revision)
      fail(409, "Sharing settings changed. Refresh before revoking");
    await db.query(
      "UPDATE node_share_grants SET revoked_at=CURRENT_TIMESTAMP,revision=revision+1,updated_at=CURRENT_TIMESTAMP WHERE id=$1",
      [old.id],
    );
    await audit(db, old.id, "ACCESS_REVOKED", actor(req.user));
    return reply(res, await info(c), "All shared access revoked");
  });
  route(
    "POST",
    "/api/client-share-access/send-magic-link",
    async (req, res) => {
      const c = await client(req);
      if (reserved(c.email) || !z.email().safeParse(c.email).success)
        fail(400, "Set a real client email before sending a link");
      const g = (
        await db.query(
          "SELECT * FROM node_share_grants WHERE client_id=$1 FOR UPDATE",
          [c.id],
        )
      ).rows[0];
      if (
        !g ||
        g.revoked_at ||
        new Date(g.expires_at) <= new Date() ||
        !c.isActive
      )
        fail(400, "Enable sharing with an unexpired code first");
      if (req.body.revision !== g.revision)
        fail(409, "Sharing settings changed. Refresh before sending");
      if (
        g.last_email_at &&
        Date.now() - new Date(g.last_email_at).getTime() < 60000
      )
        fail(429, "Wait one minute before sending another link");
      const secret = randomBytes(32).toString("base64url");
      await db.query(
        "INSERT INTO node_share_links(id,grant_id,revision,secret_hash,email,expires_at) VALUES($1,$2,$3,$4,$5,$6)",
        [
          randomUUID(),
          g.id,
          g.revision,
          hash(secret),
          c.email,
          new Date(
            Math.min(Date.now() + 900000, new Date(g.expires_at).getTime()),
          ).toISOString(),
        ],
      );
      await mail.send({
        to: c.email,
        subject: "Your secure care-record access",
        text: `Your care provider has shared read-only access to your care record. This one-time link expires in 15 minutes.\n${portalUrl(config, g.id, secret)}`,
        actionUrl: portalUrl(config, g.id, secret),
        actionLabel: "Open my care record",
      });
      await db.query(
        "UPDATE node_share_grants SET last_email_at=CURRENT_TIMESTAMP WHERE id=$1",
        [g.id],
      );
      await audit(db, g.id, "CLIENT_EMAIL_QUEUED", actor(req.user), c.email);
      return reply(res, {}, "Client access email queued");
    },
  );
  route("POST", "/api/client-share-access/invite", async (req, res) => {
    const c = await client(req);
    const parsed = z.object({
      name: z.string().trim().min(2).max(100),
      email: z.email().max(254),
      accessLevel: z.enum(["FULL", "LIMITED"]),
      scopes: z.array(z.enum(scopeNames)).min(1).max(scopeNames.length),
      days: z.number().int().min(1).max(30).default(7),
      acknowledged: z.literal(true),
      revision: z.number().int().nonnegative(),
    }).safeParse(req.body);
    if (!parsed.success) fail(400, "Enter the recipient, permission level, shared sections and confirm authorisation");
    const g = (await db.query("SELECT * FROM node_share_grants WHERE client_id=$1 AND agency_id=$2 FOR UPDATE", [c.id, c.agencyId])).rows[0];
    if (!g || g.revoked_at || new Date(g.expires_at) <= new Date()) fail(400, "Enable shared access before inviting a recipient");
    if (parsed.data.revision !== g.revision) fail(409, "Sharing settings changed. Refresh before inviting");
    const b = parsed.data;
    const inviteScopes = b.accessLevel === "FULL" ? scopeNames : [...new Set(b.scopes)];
    const secret = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Math.min(Date.now() + b.days * 86400000, new Date(g.expires_at).getTime())).toISOString();
    await db.query(`INSERT INTO node_share_links(id,grant_id,revision,secret_hash,email,expires_at,recipient_name,access_level,scopes) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [randomUUID(), g.id, g.revision, hash(secret), b.email.toLowerCase(), expiresAt, b.name, b.accessLevel, JSON.stringify(inviteScopes)]);
    await mail.send({to:b.email,subject:`Access to ${actor(c)}'s care information`,text:`Hello ${b.name},\n\nThe care team has shared ${b.accessLevel === "FULL" ? "full" : "limited"} access with you. This one-time sign-in link expires ${new Date(expiresAt).toLocaleString("en-GB", {timeZone:"Europe/London"})}.\n${portalUrl(config,g.id,secret)}`,actionUrl:portalUrl(config,g.id,secret),actionLabel:"Open shared care information"});
    await audit(db,g.id,"RECIPIENT_INVITED",actor(req.user),b.email);
    return reply(res,await info(c),"Recipient invitation sent",201);
  });
  route("GET", "/api/client-share-access/:clientId/messages", async (req, res) => {
    const c = await client(req);
    const grant = (await db.query("SELECT id,scopes FROM node_share_grants WHERE client_id=$1 AND agency_id=$2", [c.id, c.agencyId])).rows[0];
    if (!grant) return reply(res, []);
    return reply(res, (await db.query(`SELECT id,sender_type AS "senderType",sender_name AS "senderName",body,created_at AS "createdAt" FROM node_portal_messages WHERE grant_id=$1 ORDER BY created_at,id`, [grant.id])).rows);
  });
  route("GET", "/api/client-share-access/:clientId/preferences", async(req,res)=>{
    const c=await client(req),grant=(await db.query("SELECT id FROM node_share_grants WHERE client_id=$1 AND agency_id=$2",[c.id,c.agencyId])).rows[0];
    if(!grant)return reply(res,{messageEmail:true,feedbackEmail:false,responseTargetHours:24});
    const pref=(await db.query(`SELECT message_email AS "messageEmail",feedback_email AS "feedbackEmail",response_target_hours AS "responseTargetHours" FROM node_portal_preferences WHERE grant_id=$1`,[grant.id])).rows[0];
    return reply(res,pref||{messageEmail:true,feedbackEmail:false,responseTargetHours:24});
  });
  route("PUT", "/api/client-share-access/:clientId/preferences", async(req,res)=>{
    const c=await client(req),parsed=z.object({messageEmail:z.boolean(),feedbackEmail:z.boolean(),responseTargetHours:z.number().int().min(1).max(168)}).safeParse(req.body);if(!parsed.success)fail(400,"Enter valid portal notification preferences");
    const grant=(await db.query("SELECT id FROM node_share_grants WHERE client_id=$1 AND agency_id=$2",[c.id,c.agencyId])).rows[0];if(!grant)fail(404,"Sharing is not enabled");const b=parsed.data;
    await db.query(`INSERT INTO node_portal_preferences(grant_id,message_email,feedback_email,response_target_hours) VALUES($1,$2,$3,$4) ON CONFLICT(grant_id) DO UPDATE SET message_email=EXCLUDED.message_email,feedback_email=EXCLUDED.feedback_email,response_target_hours=EXCLUDED.response_target_hours,updated_at=CURRENT_TIMESTAMP`,[grant.id,b.messageEmail,b.feedbackEmail,b.responseTargetHours]);
    await audit(db,grant.id,"PREFERENCES_UPDATED",actor(req.user));return reply(res,b,"Portal preferences saved");
  });
  route("POST", "/api/client-share-access/:clientId/messages", async (req, res) => {
    const c = await client(req);
    const parsed = z.object({ body: z.string().trim().min(1).max(2000) }).safeParse(req.body);
    if (!parsed.success) fail(400, "Enter a message of up to 2,000 characters");
    const grant = (await db.query("SELECT id,scopes FROM node_share_grants WHERE client_id=$1 AND agency_id=$2 AND revoked_at IS NULL AND expires_at>CURRENT_TIMESTAMP", [c.id, c.agencyId])).rows[0];
    if (!grant || !grant.scopes.includes("MESSAGES")) fail(403, "Messaging is not enabled for this shared record");
    const id = randomUUID();
    await db.query("INSERT INTO node_portal_messages(id,grant_id,agency_id,client_id,sender_type,sender_name,body) VALUES($1,$2,$3,$4,'STAFF',$5,$6)", [id,grant.id,c.agencyId,c.id,actor(req.user),parsed.data.body]);
    await audit(db, grant.id, "STAFF_MESSAGE_SENT", actor(req.user));
    const pref=(await db.query("SELECT message_email FROM node_portal_preferences WHERE grant_id=$1",[grant.id])).rows[0];
    if(pref?.message_email!==false&&!reserved(c.email))req.afterCommit.push(()=>mail.send({to:c.email,subject:"New secure Caremonitor message",text:"Your care team sent a secure message. Sign in to the shared care record to read it. No care details are included in this email.",actionUrl:portalUrl(config,grant.id),actionLabel:"Open secure portal"}));
    return reply(res, { id }, "Message sent", 201);
  });
}

export function createPortal(ctx) {
  const { db, repo, config, mail } = ctx,
    router = Router();
  router.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    res.set("Referrer-Policy", "no-referrer");
    next();
  });
  const limiter = rateLimit({
    windowMs: 15 * 60000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many access attempts. Please try again later." },
  });
  router.post("/exchange", limiter, async (req, res) => {
    const parsed = z
      .object({
        shareId: z.uuid(),
        code: z.string().max(64).optional(),
        token: z.string().max(128).optional(),
        name: z.string().trim().min(2).max(100).optional(),
        email: z.email().max(254).optional(),
      })
      .safeParse(req.body);
    if (!parsed.success)
      fail(
        400,
        "Enter the access code, your name and email, or use a valid email link",
      );
    const b = parsed.data;
    if (!b.token && (!b.code || !b.name || !b.email))
      fail(400, "Enter the access code, your name and email");
    const result = await db.transaction(async () => {
      const g = (
        await db.query(
          `SELECT g.*,u.first_name,u.last_name,u.email AS client_email FROM node_share_grants g JOIN users u ON u.id=g.client_id WHERE g.id=$1 AND g.revoked_at IS NULL AND g.expires_at>CURRENT_TIMESTAMP AND u.is_active=true AND u.deleted_at IS NULL AND u.role='USER' AND u.agency_id=g.agency_id FOR UPDATE OF g`,
          [b.shareId],
        )
      ).rows[0];
      if (!g) return null;
      if (
        Date.now() - new Date(g.attempt_window).getTime() < 900000 &&
        g.failed_attempts >= 10
      )
        return null;
      let link = null,
        valid = false;
      if (b.token) {
        link = (
          await db.query(
            "SELECT * FROM node_share_links WHERE grant_id=$1 AND revision=$2 AND secret_hash=$3 AND used_at IS NULL AND expires_at>CURRENT_TIMESTAMP FOR UPDATE",
            [g.id, g.revision, hash(b.token)],
          )
        ).rows[0];
        valid = !!link;
      } else {
        const code = b.code.replace(/[\s-]/g, "").toUpperCase();
        valid = timingSafeEqual(
          Buffer.from(hash(code), "hex"),
          Buffer.from(g.code_hash, "hex"),
        );
      }
      if (!valid) {
        await db.query(
          `UPDATE node_share_grants SET failed_attempts=CASE WHEN attempt_window<CURRENT_TIMESTAMP-interval '15 minutes' THEN 1 ELSE failed_attempts+1 END,attempt_window=CASE WHEN attempt_window<CURRENT_TIMESTAMP-interval '15 minutes' THEN CURRENT_TIMESTAMP ELSE attempt_window END WHERE id=$1`,
          [g.id],
        );
        return null;
      }
      if (link)
        await db.query(
          "UPDATE node_share_links SET used_at=CURRENT_TIMESTAMP WHERE id=$1",
          [link.id],
        );
      const token = randomBytes(32).toString("base64url"),
        name = link
          ? link.recipient_name || [g.first_name, g.last_name].filter(Boolean).join(" ")
          : b.name,
        email = link ? link.email : b.email,
        method = link ? (link.recipient_name ? "RECIPIENT_EMAIL" : "CLIENT_EMAIL") : "ACCESS_CODE",
        sessionScopes = link?.scopes || g.scopes,
        expiresAt = new Date(
          Math.min(Date.now() + 3600000, new Date(g.expires_at).getTime()),
        ).toISOString();
      await db.query(
        "INSERT INTO node_share_sessions(id,grant_id,revision,secret_hash,viewer_name,viewer_email,method,expires_at,scopes) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        [
          randomUUID(),
          g.id,
          g.revision,
          hash(token),
          name,
          email,
          method,
          expiresAt,
          JSON.stringify(sessionScopes),
        ],
      );
      await db.query(
        "UPDATE node_share_grants SET failed_attempts=0,attempt_window=CURRENT_TIMESTAMP WHERE id=$1",
        [g.id],
      );
      await audit(
        db,
        g.id,
        method === "CLIENT_EMAIL" ? "CLIENT_SIGNED_IN" : method === "RECIPIENT_EMAIL" ? "RECIPIENT_SIGNED_IN" : "CODE_SIGNED_IN",
        name,
        email,
      );
      return { token, expiresAt };
    });
    if (!result)
      fail(401, "Invalid, expired, revoked or already used access details");
    return reply(res, result);
  });
  router.use(async (req, res, next) => {
    const token = req.headers.authorization?.match(
      /^Bearer ([A-Za-z0-9_-]{43})$/,
    )?.[1];
    if (!token) fail(401, "Sign in to view the shared record");
    const session = (
      await db.query(
        `SELECT s.*,g.client_id,g.agency_id,COALESCE(s.scopes,g.scopes) AS scopes FROM node_share_sessions s JOIN node_share_grants g ON g.id=s.grant_id JOIN users u ON u.id=g.client_id
   WHERE s.secret_hash=$1 AND s.revoked_at IS NULL AND s.expires_at>CURRENT_TIMESTAMP AND g.revoked_at IS NULL AND g.expires_at>CURRENT_TIMESTAMP AND g.revision=s.revision AND u.is_active=true AND u.deleted_at IS NULL AND u.role='USER' AND u.agency_id=g.agency_id`,
        [hash(token)],
      )
    ).rows[0];
    if (!session) fail(401, "Shared access expired or was revoked");
    req.portal = session;
    next();
  });
  router.get("/record", async (req, res) => {
    const s = req.portal,
      page = Number(req.query.page || 1);
    if (!Number.isInteger(page) || page < 1 || page > 10000)
      fail(400, "Invalid page");
    const c = await repo.get("UserEntity", s.client_id),
      out = {
        clientName: actor(c),
        scopes: s.scopes,
        expiresAt: s.expires_at,
        page,
      };
    if (s.scopes.includes("BASIC")) {
      const addresses = await repo.find("UserPrimaryAddressEntity", {
        user: c.id,
      });
      out.basic = {
        firstName: c.firstName,
        middleName: c.middleName,
        lastName: c.lastName,
        preferredName: c.preferredName,
        dateOfBirth: c.dateOfBirth,
        primaryPhone: c.primaryPhone,
        email: c.email,
        highlights: c.highlights,
        addresses: addresses.map((a) => ({
          addressLine1: a.addressLine1,
          addressLine2: a.addressLine2,
          city: a.city,
          county: a.county,
          postalCode: a.postalCode,
          country: a.country,
        })),
      };
    }
    if (s.scopes.includes("MEDICAL")) {
      const m = await repo.one("ClientInformationEntity", { user: c.id });
      out.medical = {
        medicalHistory: m?.medicalHistory || "",
        allergiesIntolerances: m?.allergiesIntolerances || "",
      };
    }
    if (s.scopes.includes("CARE_LOG")) {
      out.careLog = (
        await db.query(
          `SELECT e.id,e.kind,e.title,e.body,e.status,e.created_at AS "createdAt" FROM node_client_entries e WHERE e.client_id=$1 AND e.agency_id=$2 AND e.kind IN ('NOTE','OBSERVATION','ACTIVITY') ORDER BY e.created_at DESC,e.id DESC LIMIT 20 OFFSET $3`,
          [c.id, s.agency_id, (page - 1) * 20],
        )
      ).rows;
      out.totalEntries = (
        await db.query(
          `SELECT count(*)::int AS n FROM node_client_entries WHERE client_id=$1 AND agency_id=$2 AND kind IN ('NOTE','OBSERVATION','ACTIVITY')`,
          [c.id, s.agency_id],
        )
      ).rows[0].n;
    }
    if (s.scopes.includes("VISITS")) {
      out.upcomingVisits = (await db.query(`SELECT v.id,v.visit_date AS "visitDate",v.start_time AS "startTime",v.end_time AS "endTime",v.title,v.status,concat_ws(' ',u.first_name,u.last_name) AS "caregiverName" FROM node_roster_visits v LEFT JOIN users u ON u.id=v.staff_id WHERE v.client_id=$1 AND v.agency_id=$2 AND v.visit_date>=CURRENT_DATE AND v.status IN ('SCHEDULED','IN_PROGRESS') ORDER BY v.visit_date,v.start_time LIMIT 50`,[c.id,s.agency_id])).rows;
    }
    if (s.scopes.includes("CARE_PLANS")) {
      const planTypes = [["Medication","CarePlanMedicationEntity"],["Behaviour","ClientBehaviourEntity"],["Communication","ClientCommunicationEntity"],["Condition specific","ClientConditionSpecificEntity"],["End of life","ClientEndOfLifeEntity"],["Everyday activities","ClientEveryDayActivityEntity"],["Mental capacity","ClientMentalCapacityEntity"],["Nutrition and hydration","ClientNutritionHydrationEntity"],["Personal care","ClientPersonalCareEntity"],["Psychological","ClientPsychologicalEntity"],["Social support","ClientSocialSupportEntity"]];
      out.carePlans = [];
      for (const [label,entity] of planTypes) {
        const plan = await repo.one(entity,{user:c.id});
        if (plan && !plan.deletedAt) out.carePlans.push({type:label,updatedAt:plan.updatedAt || plan.createdAt || null});
      }
    }
    await audit(db, s.grant_id, "RECORD_VIEWED", s.viewer_name, s.viewer_email);
    return reply(res, out);
  });
  router.get("/messages", async (req, res) => {
    const s=req.portal;
    if (!s.scopes.includes("MESSAGES")) fail(403,"Messaging is not included in this shared access");
    const rows=(await db.query(`SELECT id,sender_type AS "senderType",sender_name AS "senderName",body,created_at AS "createdAt" FROM node_portal_messages WHERE grant_id=$1 ORDER BY created_at,id`,[s.grant_id])).rows;
    const pref=(await db.query(`SELECT response_target_hours AS "responseTargetHours",message_email AS "messageEmail",feedback_email AS "feedbackEmail" FROM node_portal_preferences WHERE grant_id=$1`,[s.grant_id])).rows[0]||{responseTargetHours:24,messageEmail:true,feedbackEmail:false};
    const latestPortal=[...rows].reverse().find(x=>x.senderType==='PORTAL'),latestStaff=[...rows].reverse().find(x=>x.senderType==='STAFF');
    const pending=latestPortal&&(!latestStaff||new Date(latestStaff.createdAt)<new Date(latestPortal.createdAt));
    return reply(res,{messages:rows,preferences:pref,responseDueAt:pending?new Date(new Date(latestPortal.createdAt).getTime()+pref.responseTargetHours*3600000).toISOString():null});
  });
  router.post("/messages", async (req, res) => {
    const s=req.portal;
    if (!s.scopes.includes("MESSAGES")) fail(403,"Messaging is not included in this shared access");
    const parsed=z.object({body:z.string().trim().min(1).max(2000)}).safeParse(req.body);
    if(!parsed.success) fail(400,"Enter a message of up to 2,000 characters");
    const id=randomUUID();
    await db.query("INSERT INTO node_portal_messages(id,grant_id,agency_id,client_id,sender_type,sender_name,body) VALUES($1,$2,$3,$4,'PORTAL',$5,$6)",[id,s.grant_id,s.agency_id,s.client_id,s.viewer_name,parsed.data.body]);
    await audit(db,s.grant_id,"PORTAL_MESSAGE_SENT",s.viewer_name,s.viewer_email);
    const admins=(await db.query("SELECT email FROM users WHERE agency_id=$1 AND role IN ('ADMIN','SUPERADMIN') AND is_active=true AND deleted_at IS NULL",[s.agency_id])).rows;
    await Promise.allSettled(admins.map(a=>mail.send({to:a.email,subject:"New family portal message",text:"A new secure portal message is waiting in Caremonitor. Sign in to review it; no care details are included in this email.",actionUrl:config.frontendUrl,actionLabel:"Open Caremonitor"})));
    return reply(res,{id},"Message sent",201);
  });
  router.post("/feedback", async (req,res)=>{
    const s=req.portal;
    if(!s.scopes.includes("FEEDBACK")) fail(403,"Feedback is not included in this shared access");
    const parsed=z.object({kind:z.enum(feedbackKinds).default("QUALITY_FEEDBACK"),rating:z.number().int().min(1).max(5),comment:z.string().trim().min(1).max(2000),consent:z.literal(true)}).safeParse(req.body);
    if(!parsed.success) fail(400,"Choose a feedback type and rating, enter details, and confirm consent");
    const id=randomUUID();
    await db.query("INSERT INTO node_portal_feedback(id,grant_id,agency_id,client_id,kind,rating,comment,consented_at) VALUES($1,$2,$3,$4,$5,$6,$7,CURRENT_TIMESTAMP)",[id,s.grant_id,s.agency_id,s.client_id,parsed.data.kind,parsed.data.rating,parsed.data.comment]);
    await audit(db,s.grant_id,"FEEDBACK_SUBMITTED",s.viewer_name,s.viewer_email);
    const pref=(await db.query("SELECT feedback_email FROM node_portal_preferences WHERE grant_id=$1",[s.grant_id])).rows[0];
    if(pref?.feedback_email){const admins=(await db.query("SELECT email FROM users WHERE agency_id=$1 AND role IN ('ADMIN','SUPERADMIN') AND is_active=true AND deleted_at IS NULL",[s.agency_id])).rows;await Promise.allSettled(admins.map(a=>mail.send({to:a.email,subject:"New Caremonitor feedback",text:"New consented feedback is available in Caremonitor. Sign in to review it.",actionUrl:config.frontendUrl,actionLabel:"Open Caremonitor"})))}
    return reply(res,{id},"Thank you for your feedback",201);
  });
  router.post("/logout", async (req, res) => {
    await db.query(
      "UPDATE node_share_sessions SET revoked_at=CURRENT_TIMESTAMP WHERE id=$1",
      [req.portal.id],
    );
    await audit(
      db,
      req.portal.grant_id,
      "SIGNED_OUT",
      req.portal.viewer_name,
      req.portal.viewer_email,
    );
    return reply(res, {});
  });
  return router;
}
