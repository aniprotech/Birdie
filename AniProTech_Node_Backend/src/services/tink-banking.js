import { createHash, randomBytes } from "node:crypto";
import { fail, reply } from "../http.js";

const callbackPath = "/api/accounting/banking/tink/callback";
const hash = (value) => createHash("sha256").update(value).digest("hex");
const list = (body, key) => Array.isArray(body?.[key]) ? body[key] : [];
const clean = (value, length = 200) => String(value ?? "").slice(0, length);
const amountPence = (amount) => {
  const value = Number(typeof amount === "object" ? amount?.value : amount);
  return Number.isFinite(value) && Math.abs(value) <= 1e9 ? Math.round(value * 100) : null;
};

async function tinkJson(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(15000) });
  if (!response.ok) {
    const error = new Error("Tink request failed");
    error.providerStatus = response.status;
    throw error;
  }
  return response.json();
}

export function registerTinkBanking({ db, auth, config }, route) {
  const requireAgency = async (req) => {
    auth.admin(req);
    if (!req.user.agencyId) fail(403, "An organisation is required");
    const agency = (await db.query("SELECT status FROM node_agencies WHERE id=$1", [req.user.agencyId])).rows[0];
    if (agency?.status !== "ACTIVE") fail(403, "Organisation approval is required");
    return req.user.agencyId;
  };
  route("GET", "/api/accounting/banking", async (req, res) => {
    const agencyId = await requireAgency(req);
    const [accounts, transactions] = await Promise.all([
      db.query(`SELECT provider_account_id AS id,name,currency,account_type AS "accountType",
        last_four AS "lastFour",updated_at AS "updatedAt" FROM node_tink_accounts
        WHERE agency_id=$1 ORDER BY lower(name),provider_account_id LIMIT 100`, [agencyId]),
      db.query(`SELECT provider_transaction_id AS id,provider_account_id AS "accountId",
        booked_at::text AS date,description,amount_pence AS "amountPence",currency
        FROM node_tink_transactions WHERE agency_id=$1 ORDER BY booked_at DESC NULLS LAST,provider_transaction_id DESC LIMIT 100`, [agencyId]),
    ]);
    return reply(res, { configured: Boolean(config.tinkBankingEnabled && config.tinkClientId && config.tinkClientSecret),
      accounts: accounts.rows, transactions: transactions.rows });
  });
  route("POST", "/api/accounting/banking/tink/start", async (req, res) => {
    const agencyId = await requireAgency(req);
    if (!config.tinkBankingEnabled || !config.tinkClientId || !config.tinkClientSecret)
      fail(503, "Tink sandbox is not ready. Register the redirect URI and enable banking first");
    const state = randomBytes(32).toString("base64url");
    await db.query(`INSERT INTO node_tink_connection_attempts(state_hash,agency_id,started_by,expires_at)
      VALUES($1,$2,$3,CURRENT_TIMESTAMP + INTERVAL '10 minutes')`, [hash(state), agencyId, req.user.id]);
    res.cookie("tink_bank_state", state, { httpOnly: true, secure: config.production,
      sameSite: "lax", path: callbackPath, maxAge: 600000 });
    const link = new URL("https://link.tink.com/1.0/business-transactions/connect-accounts/");
    link.searchParams.set("client_id", config.tinkClientId);
    link.searchParams.set("redirect_uri", config.tinkRedirectUri);
    link.searchParams.set("market", "GB");
    link.searchParams.set("locale", "en_US");
    link.searchParams.set("state", state);
    return reply(res, { url: link.toString() });
  });
}

export function tinkCallback({ db, config }) {
  return async (req, res) => {
    const returnUrl = new URL("/admin/accounting?section=banking", config.frontendUrl);
    try {
      const cookieState = req.headers.cookie?.match(/(?:^|; )tink_bank_state=([^;]+)/)?.[1] || "";
      const returnedState = typeof req.query.state === "string" ? req.query.state : "";
      if (returnedState && cookieState && returnedState !== cookieState) throw new Error("state_mismatch");
      const state = returnedState || cookieState;
      const code = typeof req.query.code === "string" ? req.query.code : "";
      if (!state || !code || req.query.error) throw new Error("consent_incomplete");
      const attempt = (await db.query(`UPDATE node_tink_connection_attempts SET completed_at=CURRENT_TIMESTAMP
        WHERE state_hash=$1 AND completed_at IS NULL AND expires_at>CURRENT_TIMESTAMP
        RETURNING agency_id`, [hash(state)])).rows[0];
      if (!attempt) throw new Error("invalid_state");
      const tokens = await tinkJson("https://api.tink.com/api/v1/oauth/token", {
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ client_id: config.tinkClientId, client_secret: config.tinkClientSecret,
          grant_type: "authorization_code", code, redirect_uri: config.tinkRedirectUri }),
      });
      if (!tokens.access_token) throw new Error("missing_access_token");
      const headers = { Authorization: `Bearer ${tokens.access_token}` };
      const accounts = list(await tinkJson("https://api.tink.com/data/v2/accounts", { headers }), "accounts");
      const transactions = [];
      let pageToken = "";
      for (let page = 0; page < 10; page++) {
        const url = new URL("https://api.tink.com/data/v2/transactions");
        if (pageToken) url.searchParams.set("pageToken", pageToken);
        const batch = await tinkJson(url, { headers });
        transactions.push(...list(batch, "transactions"));
        pageToken = batch.nextPageToken || "";
        if (!pageToken) break;
      }
      const accountIds = new Set();
      await db.transaction(async () => {
        for (const account of accounts) {
          const id = clean(account.id, 200);
          if (!id) continue;
          accountIds.add(id);
          const currency = clean(account.currencyCode || account.currency, 3).toUpperCase();
          const accountNumber = clean(account.accountNumber || "", 100);
          await db.query(`INSERT INTO node_tink_accounts
            (agency_id,provider_account_id,name,currency,account_type,last_four)
            VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(agency_id,provider_account_id) DO UPDATE
            SET name=EXCLUDED.name,currency=EXCLUDED.currency,account_type=EXCLUDED.account_type,
            last_four=EXCLUDED.last_four,updated_at=CURRENT_TIMESTAMP`,
            [attempt.agency_id,id,clean(account.name),currency,clean(account.type,60),accountNumber.slice(-4)]);
        }
        for (const transaction of transactions) {
          const id = clean(transaction.id, 200), accountId = clean(transaction.accountId, 200);
          const currency = clean(transaction.amount?.currencyCode || transaction.currencyCode || "GBP", 3).toUpperCase();
          const pence = amountPence(transaction.amount);
          if (!id || !accountIds.has(accountId) || currency !== "GBP" || pence === null) continue;
          const date = clean(transaction.bookedDate || transaction.date || "", 10);
          await db.query(`INSERT INTO node_tink_transactions
            (agency_id,provider_transaction_id,provider_account_id,booked_at,description,amount_pence,currency)
            VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(agency_id,provider_transaction_id) DO UPDATE
            SET provider_account_id=EXCLUDED.provider_account_id,booked_at=EXCLUDED.booked_at,
            description=EXCLUDED.description,amount_pence=EXCLUDED.amount_pence,currency=EXCLUDED.currency`,
            [attempt.agency_id,id,accountId,/^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
              clean(transaction.description || transaction.text, 500),pence,currency]);
        }
      });
      returnUrl.searchParams.set("bank", "connected");
    } catch (error) {
      console.error("Tink bank connection failed", error.providerStatus || error.message);
      returnUrl.searchParams.set("bank", "failed");
    }
    res.clearCookie("tink_bank_state", { path: callbackPath });
    return res.redirect(303, returnUrl.toString());
  };
}
