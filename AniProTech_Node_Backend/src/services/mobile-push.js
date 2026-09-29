import { z } from "zod";
import { fail, reply } from "../http.js";

const pushToken = z.string().regex(/^(Expo|Exponent)PushToken\[[A-Za-z0-9_-]{10,200}\]$/);

async function expoTransport(tokens, message) {
  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(tokens.map((to) => ({ to, title: "Caremonitor", body: message, sound: "default", priority: "high", channelId: "caremonitor-updates" }))),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`Expo push service returned ${response.status}`);
  return response.json();
}

export function createMobilePush({ db, transport = expoTransport }) {
  return {
    async sendToUsers(agencyId, userIds, message) {
      const recipients = [...new Set(userIds.filter(Boolean))];
      if (!recipients.length) return;
      const rows = (await db.query(`SELECT p.token FROM node_mobile_push_tokens p JOIN users u ON u.id=p.user_id JOIN node_sessions s ON s.id=p.session_id AND s.user_id=p.user_id
        WHERE p.agency_id=$1 AND p.user_id=ANY($2::uuid[]) AND u.agency_id=$1 AND u.is_active=true AND u.deleted_at IS NULL AND s.revoked_at IS NULL AND s.expires_at>CURRENT_TIMESTAMP`,
        [agencyId, recipients])).rows;
      for (let i=0;i<rows.length;i+=100) {
        const tokens=rows.slice(i,i+100).map((row)=>row.token);
        const response=await transport(tokens,message);
        const tickets=Array.isArray(response?.data)?response.data:[];
        for (let j=0;j<tickets.length;j++)
          if (tickets[j]?.details?.error==="DeviceNotRegistered")
            await db.query("DELETE FROM node_mobile_push_tokens WHERE token=$1",[tokens[j]]);
      }
    },
  };
}

export function registerMobilePush({ db }, route) {
  route("PUT", "/api/mobile/push-token", async (req,res) => {
    if (!['CAREGIVER','ADMIN','SUPERADMIN'].includes(req.user.role)) fail(403,"Staff account required");
    const parsed=z.object({token:pushToken,platform:z.enum(['ios','android'])}).safeParse(req.body);
    if (!parsed.success) fail(400,"Choose a valid device notification token");
    await db.query(`INSERT INTO node_mobile_push_tokens(token,agency_id,user_id,session_id,platform) VALUES($1,$2,$3,$4,$5)
      ON CONFLICT(token) DO UPDATE SET agency_id=$2,user_id=$3,session_id=$4,platform=$5,updated_at=CURRENT_TIMESTAMP`,
      [parsed.data.token,req.user.agencyId,req.user.id,req.sessionId,parsed.data.platform]);
    return reply(res,{enabled:true},"Device notifications enabled");
  });
  route("DELETE", "/api/mobile/push-token", async (req,res) => {
    const parsed=z.object({token:pushToken}).safeParse(req.body);
    if (!parsed.success) fail(400,"Choose a valid device notification token");
    await db.query("DELETE FROM node_mobile_push_tokens WHERE token=$1 AND agency_id=$2 AND user_id=$3",[parsed.data.token,req.user.agencyId,req.user.id]);
    return reply(res,{enabled:false},"Device notifications disabled");
  });
}
