import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { randomUUID } from "node:crypto";
import { Repository } from "./repository.js";
import { createAuth } from "./auth.js";
import { createMail } from "./mail.js";
import { createFiles } from "./files.js";
import { reply, fail, uuid } from "./http.js";
import { registerClientFeed } from "./services/client-feed.js";
import { registerUsers } from "./services/users.js";
import { registerCarePlans } from "./services/care-plans.js";
import { registerTaskLibrary } from "./services/task-library.js";
import { registerTasks } from "./services/tasks.js";
import { registerMedication } from "./services/medication.js";
import { registerTeam } from "./services/team.js";
import { registerAssignments } from "./services/assignments.js";
import { registerSettings } from "./services/settings.js";
import { registerShareAccess, createPortal } from "./services/share-access.js";
import { registerDocuments } from "./services/documents.js";
import { registerRoster } from "./services/roster.js";
import { registerVisitSchedule } from "./services/visit-schedule.js";
import { registerTeamFeed } from "./services/team-feed.js";
import { registerTeamActivity } from "./services/team-activity.js";
import { registerTimeOff } from "./services/time-off.js";
import { registerInbox } from "./services/inbox.js";
import { registerCareLog } from './services/care-log.js';
import { registerActivity } from "./services/activity.js";
import { registerFinanceReview } from './services/finance-review.js';
import { registerFinance } from "./services/finance.js";
import { registerReporting } from "./services/reporting.js";
import {createInboxNotifications} from './inbox-notifications.js';
import {registerNotificationDelivery} from './services/notification-delivery.js';
import { registerMobileCare } from "./services/mobile-care.js";

export function createApp({ db, config, mail = createMail(config) }) {
  const app = express(),
    repo = new Repository(db),
    files = createFiles(config, db);
  const ctx = { db, config, repo, mail, files };
  ctx.notifications=createInboxNotifications(ctx);
  ctx.auth = createAuth(ctx);
  const auth = ctx.auth;
  if (config.trustProxy) app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || config.corsOrigins.includes(origin))
          callback(null, true);
        else
          callback(
            Object.assign(new Error("Origin is not allowed"), { status: 403 }),
          );
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app.use((req, res, next) => {
    req.body ??= {};
    res.set("Cache-Control", "no-store");
    next();
  });
  const health = async (req, res) => {
    await db.query("SELECT 1");
    return res.json({ status: "UP", service: "aniprotech-express" });
  };
  app.get("/api/health", health);
  app.get("/health", health);
  app.get("/actuator/health", health);
  const authLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res) =>
      res
        .status(429)
        .json({
          message: "Too many login attempts. Try again later.",
          error: true,
          code: 429,
          results: { data: {} },
        }),
  });
  app.post("/api/auth/request-link", authLimit, async (req, res) => {
    if(req.body.client !== undefined && !['web','mobile'].includes(req.body.client)) fail(400,'Invalid login client');
    await auth.requestLink(req.body.email, { mobile: req.body.client === 'mobile' });
    return reply(
      res,
      {},
      "If the account is eligible, a login link has been queued",
    );
  });
  app.post("/api/auth/get-token", authLimit, async (req, res) =>
    reply(
      res,
      await auth.exchange(req.body.email, req.body.password),
      "Login successful",
    ),
  );
  app.get("/api/auth/microsoft", (req, res) => {
    if (!config.microsoftTenantId || !config.microsoftClientId || !config.microsoftClientSecret)
      return res.redirect(`${config.frontendUrl}/login?authError=microsoft_not_configured`);
    const state = randomUUID();
    const authorize = new URL(`https://login.microsoftonline.com/${encodeURIComponent(config.microsoftTenantId)}/oauth2/v2.0/authorize`);
    authorize.searchParams.set("client_id", config.microsoftClientId);
    authorize.searchParams.set("response_type", "code");
    authorize.searchParams.set("redirect_uri", config.microsoftRedirectUri);
    authorize.searchParams.set("response_mode", "query");
    authorize.searchParams.set("scope", "openid profile email User.Read");
    authorize.searchParams.set("state", state);
    res.cookie("microsoft_oauth_state", state, { httpOnly: true, secure: config.production, sameSite: "lax", maxAge: 600000 });
    return res.redirect(authorize.toString());
  });
  app.get("/api/auth/microsoft/callback", async (req, res, next) => {
    try {
      const cookieState = req.headers.cookie?.match(/(?:^|; )microsoft_oauth_state=([^;]+)/)?.[1];
      if (!req.query.code || !req.query.state || req.query.state !== cookieState)
        return res.redirect(`${config.frontendUrl}/login?authError=microsoft_state`);
      const tokenResponse = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(config.microsoftTenantId)}/oauth2/v2.0/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ client_id: config.microsoftClientId, client_secret: config.microsoftClientSecret, code: String(req.query.code), redirect_uri: config.microsoftRedirectUri, grant_type: "authorization_code" }),
      });
      if (!tokenResponse.ok) throw new Error("Microsoft token exchange failed");
      const tokens = await tokenResponse.json();
      const profileResponse = await fetch("https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName", { headers: { Authorization: `Bearer ${tokens.access_token}` } });
      if (!profileResponse.ok) throw new Error("Microsoft profile lookup failed");
      const profile = await profileResponse.json();
      const email = profile.mail || profile.userPrincipalName;
      const login = await auth.createLoginLink(email);
      if (!login) return res.redirect(`${config.frontendUrl}/login?authError=account_not_allowed`);
      return res.redirect(login.link.toString());
    } catch (error) {
      console.error("Microsoft sign-in failed", error);
      return res.redirect(`${config.frontendUrl}/login?authError=microsoft_failed`);
    }
  });
  app.get("/uploads/{*file}", files.download);
  app.use("/api/portal", createPortal(ctx));
  app.use("/api", auth.authenticate);
  app.post("/api/auth/validate-token", async (req, res) =>
    reply(
      res,
      {
        id: req.sessionId,
        user: auth.publicUser(req.user),
        token: req.accessToken,
        isUsed: true,
      },
      "Token is valid",
    ),
  );
  app.post("/api/auth/logout", async (req, res) => {
    await db.query(
      "UPDATE node_sessions SET revoked_at=CURRENT_TIMESTAMP WHERE id=$1",
      [req.sessionId],
    );
    return reply(res, {}, "Logged out");
  });
  app.use("/api", (req, res, next) => {
    const json = res.json.bind(res);
    res.json = (body) => json(files.signTree(body, req));
    next();
  });
  const routes = [];
  const route = (method, path, handler, options = {}) =>
    routes.push({ method, path, handler, options });
  for (const register of [
    registerUsers,
    registerClientFeed,
    registerCarePlans,
    registerTasks,
    registerTaskLibrary,
    registerMedication,
    registerTeam,
    registerAssignments,
    registerSettings,
    registerShareAccess,
    registerDocuments,
    registerRoster,
    registerVisitSchedule,
    registerTeamFeed,
    registerTeamActivity,
    registerTimeOff,
    registerInbox,
    registerActivity,
    registerCareLog,
    registerFinance,
    registerFinanceReview,
    registerReporting,
    registerNotificationDelivery,
    registerMobileCare,
  ])
    register(ctx, route);
  routes.sort(
    (a, b) =>
      a.path.split(":").length - b.path.split(":").length ||
      b.path.length - a.path.length,
  );
  const keys = new Set();
  for (const r of routes) {
    const key = r.method + " " + r.path;
    if (keys.has(key)) throw new Error("Duplicate route " + key);
    keys.add(key);
    const middleware = [];
    if (r.options.multipart) middleware.push(files.upload);
    middleware.push(async (req, res) => {
      for (const value of Object.values(req.params)) uuid(value);
      if (
        !["GET", "HEAD"].includes(req.method) &&
        !Array.isArray(req.body) &&
        (typeof req.body !== "object" || req.body === null)
      )
        fail(400, "An object request body is required");
      if (["GET", "HEAD"].includes(req.method)) return r.handler(req, res);
      // Publish success only after data changes and the audit entry commit together.
      const sendJson = res.json.bind(res);
      let pendingBody;
      res.json = (body) => {
        pendingBody = body;
        return res;
      };
      try {
        req.afterCommit = [];
        await db.transaction(async () => {
          await r.handler(req, res);
          await db.query(
            "INSERT INTO node_audit_log(id,actor_id,agency_id,method,path) VALUES($1,$2,$3,$4,$5)",
            [
              randomUUID(),
              req.user.id,
              req.user.agencyId,
              req.method,
              req.path,
            ],
          );
        });
        for (const work of req.afterCommit) await work().catch(() => console.error("Post-commit notification failed"));
      } finally {
        res.json = sendJson;
      }
      return res.json(pendingBody);
    });
    app[r.method.toLowerCase()](r.path, ...middleware);
  }
  app.use((req, res) =>
    res
      .status(404)
      .json({
        message: "Route not found",
        error: true,
        code: 404,
        results: { data: {} },
      }),
  );
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    let status = error.status || 500,
      message = error.status ? error.message : "Request could not be completed";
    if (error.code === "23505") {
      status = 409;
      message = "A record with this unique value already exists";
    } else if (error.code === "23503") {
      status = 400;
      message = "A referenced record does not exist";
    } else if (
      error.code === "22P02" ||
      error.code === "22007" ||
      error.code === "22008"
    ) {
      status = 400;
      message = "Invalid data format";
    } else if (error.code === "LIMIT_FILE_SIZE") {
      status = 413;
      message = "Each file must be 12 MB or smaller";
    } else if (!error.status && error.code) {
      status = 500;
      message = "Database or file operation failed";
    }
    if (status >= 500)
      console.error(
        "Request failed:",
        error.code || error.name,
        config.production ? "" : error.message,
      );
    return res
      .status(status)
      .json({ message, error: true, code: status, results: { data: {} } });
  });
  app.locals.routeInventory = [
    { method: "POST", path: "/api/auth/request-link" },
    { method: "POST", path: "/api/auth/get-token" },
    { method: "POST", path: "/api/auth/validate-token" },
    ...routes.map(({ method, path }) => ({ method, path })),
  ];
  app.locals.ctx = ctx;
  return app;
}
