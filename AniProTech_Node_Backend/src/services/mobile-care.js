import { randomUUID } from "node:crypto";
import { z } from "zod";
import { fail, reply } from "../http.js";
import { visitEvent } from "../client-feed-schema.js";
import { occursOn } from "./roster.js";

const entryInput = z.object({
  kind: z.enum(["NOTE", "ALERT", "ACTIVITY", "OBSERVATION"]),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().max(10000).default(""),
  category: z.string().trim().max(100).default(""),
  status: z.enum(["OPEN", "PENDING", "COMPLETED", "NOT_COMPLETED", "RECORDED"]),
});

const medicationAdministrationInput = z.object({
  clientEventId: z.uuid(),
  medicationId: z.uuid(),
  outcome: z.enum(["ADMINISTERED", "PRN_ADMINISTERED", "REFUSED", "NOT_AVAILABLE", "OMITTED"]),
  slot: z.string().trim().min(1).max(80),
  doseGiven: z.string().trim().max(160).default(""),
  reason: z.string().trim().max(500).default(""),
  note: z.string().trim().max(2000).default(""),
  prnEffect: z.string().trim().max(1000).default(""),
  witnessedBy: z.uuid().nullable().default(null),
  quantityGiven: z.number().positive().max(100000).nullable().default(null),
  occurredAt: z.iso.datetime({ offset: true }),
}).superRefine((value, issue) => {
  if (!["ADMINISTERED", "PRN_ADMINISTERED"].includes(value.outcome) && value.reason.length < 3)
    issue.addIssue({ code: "custom", path: ["reason"], message: "A reason is required when medication is not administered" });
  if (value.outcome === "PRN_ADMINISTERED" && value.note.length < 3)
    issue.addIssue({ code: "custom", path: ["note"], message: "Record why PRN medication was required" });
});

const minutes = (value) => {
  const match = String(value || "").match(/^(\d{2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
};
const periods = { Morning: [300, 720], Lunch: [660, 840], Afternoon: [780, 1080], Evening: [1020, 1440] };
function medicationDueSlots(medication, visit) {
  if (String(medication.type || "").toUpperCase() === "PRN" || medication.frequencyType !== "DAILY") return [];
  if (medication.firstDoseDate && visit.date < medication.firstDoseDate) return [];
  if (medication.lastDoseDate && visit.date > medication.lastDoseDate) return [];
  const start = minutes(visit.startTime), end = minutes(visit.endTime);
  if (start == null || end == null) return [];
  if (medication.timingPreference === "EXACT_TIME")
    return Object.values(medication.exactTimes || {}).map(String).filter((slot) => { const value = minutes(slot); return value != null && value >= start && value <= end; });
  if (medication.timingPreference === "TIME_PERIOD")
    return (medication.selectedTimeSlots || []).filter((slot) => { const range = periods[slot]; return range && start < range[1] && end > range[0]; });
  return [];
}

export function registerMobileCare({ db, repo, auth, files, mail }, route) {
  async function visit(req, locking = false) {
    const row = (await db.query(`SELECT v.*,v.visit_date::text AS date,to_char(v.start_time,'HH24:MI') AS "startTime",
      to_char(v.end_time,'HH24:MI') AS "endTime",c.first_name||' '||c.last_name AS "clientName",
      c.primary_phone AS "clientPhone",c.email AS "clientEmail" FROM node_roster_visits v JOIN users c ON c.id=v.client_id
      WHERE v.id=$1 AND v.agency_id=$2${locking ? " FOR UPDATE OF v" : ""}`, [req.params.id, req.user.agencyId])).rows[0];
    if (!row || (req.user.role === "CAREGIVER" && row.staff_id !== req.user.id)) fail(404, "Visit not found");
    return row;
  }

  route("GET", "/api/mobile/visits/:id", async (req, res) => {
    const v = await visit(req);
    const [entries, attendance, attachments, administrations, addresses, witnesses] = await Promise.all([
      db.query("SELECT id,kind,title,body,category,status,revision,created_at FROM node_client_entries WHERE visit_id=$1 ORDER BY created_at,id", [v.id]),
      db.query("SELECT id,event,latitude,longitude,accuracy,distance_metres AS \"distanceMetres\",within_radius AS \"withinRadius\",source,created_at FROM node_visit_attendance WHERE visit_id=$1 ORDER BY created_at,id", [v.id]),
      db.query("SELECT id,file_url AS url,file_name AS name,mime_type AS mime,caption,created_at FROM node_visit_attachments WHERE visit_id=$1 ORDER BY created_at,id", [v.id]),
      db.query(`SELECT a.id,a.client_event_id AS "clientEventId",a.medication_id AS "medicationId",a.outcome,a.slot,
        a.dose_given AS "doseGiven",a.reason,a.note,a.prn_effect AS "prnEffect",a.witnessed_by AS "witnessedBy",
        a.quantity_given AS "quantityGiven",a.stock_before AS "stockBefore",a.stock_after AS "stockAfter",
        a.occurred_at AS "occurredAt",a.created_at AS "createdAt",u.first_name||' '||u.last_name AS "recordedBy",
        COALESCE((SELECT jsonb_agg(jsonb_build_object('id',c.id,'reason',c.reason,'replacement',c.replacement,'createdAt',c.created_at,'actorId',c.actor_id) ORDER BY c.created_at,c.id) FROM node_medication_administration_corrections c WHERE c.administration_id=a.id),'[]') AS corrections
        FROM node_medication_administrations a JOIN users u ON u.id=a.actor_id
        WHERE a.visit_id=$1 ORDER BY a.occurred_at,a.id`, [v.id]),
      repo.find("UserPrimaryAddressEntity", { user: v.client_id }),
      db.query("SELECT id,first_name||' '||last_name AS name FROM users WHERE agency_id=$1 AND role IN ('ADMIN','SUPERADMIN','CAREGIVER') AND is_active=true AND deleted_at IS NULL AND id<>$2 ORDER BY first_name,last_name", [req.user.agencyId,req.user.id]),
    ]);
    const plans = await repo.find("ClientTaskPlanEntity", { user: v.client_id });
    const tasks = [];
    for (const p of plans) if (!p.deletedAt && occursOn({ ...p, isEnds: !!p.endDate }, v.date)) {
      const task = await repo.get("ClientTaskEntity", p.task);
      const name = p.taskNameSnapshot || task?.name || "Care task";
      const recorded = entries.rows.find((e) => e.kind === "ACTIVITY" && e.category === p.id);
      tasks.push({ id: p.id, name, details: p.details || "", essential: !!p.isEssential, sessions: p.isAnyTime ? ["ANYTIME"] : p.sessions || [], status: recorded?.status || "PENDING", recordId: recorded?.id || null });
    }
    const medication = await repo.find("ClientMedicationSchedulingEntity", { user: v.client_id });
    return reply(res, { visit: v, address: addresses.find((a) => a.isPrimary) || addresses[0] || null, tasks, medication: medication.filter((m) => !m.isStopped && !m.deletedAt).map((m) => ({ id:m.id, name:m.medicationName, type:m.type || "REGULAR", instructions:m.additionalInstructions || m.medicationDescription || m.dose || "", dose:m.dose || "", route:m.route || "", slots:m.selectedTimeSlots || [], exactTimes:m.exactTimes || {}, dueSlots:medicationDueSlots(m,v), isControlledDrug:!!m.isControlledDrug, requiresWitness:!!m.requiresWitness, stockTrackingEnabled:!!m.stockTrackingEnabled, stockQuantity:Number(m.stockQuantity||0), stockUnit:m.stockUnit||"", lowStockThreshold:Number(m.lowStockThreshold||0), timeBetweenDoses:m.timeBetweenDoses || "", timeBetweenUnit:m.timeBetweenUnit || "", maxDoseCount:m.maxDoseCount || "", maxDosePeriod:m.maxDosePeriod || "", maxDoseUnit:m.maxDoseUnit || "" })), medicationAdministrations: administrations.rows, witnesses:witnesses.rows, entries: entries.rows, attendance: attendance.rows, attachments: attachments.rows });
  });

  route("POST", "/api/mobile/visits/:id/medication-administrations", async (req, res) => {
    const parsed = medicationAdministrationInput.safeParse(req.body);
    if (!parsed.success) fail(400, parsed.error.issues[0]?.message || "Medication administration details are invalid");
    const body = parsed.data;
    const result = await db.transaction(async () => {
      const v = await visit(req, true);
      if (v.status !== "IN_PROGRESS") fail(409, "Check in before recording medication");
      const duplicate = (await db.query("SELECT * FROM node_medication_administrations WHERE agency_id=$1 AND client_event_id=$2", [req.user.agencyId, body.clientEventId])).rows[0];
      if (duplicate) {
        if (duplicate.visit_id !== v.id || duplicate.medication_id !== body.medicationId) fail(409, "This offline event identifier was already used");
        return { row: duplicate, created: false };
      }
      await db.query("SELECT id FROM client_medications_scheduling WHERE id=$1 FOR UPDATE", [body.medicationId]);
      const medication = await repo.get("ClientMedicationSchedulingEntity", body.medicationId);
      if (!medication || medication.user !== v.client_id || medication.deletedAt || medication.isStopped)
        fail(404, "Active medication schedule not found for this client");
      if (body.outcome === "PRN_ADMINISTERED" && String(medication.type || "").toUpperCase() !== "PRN")
        fail(400, "PRN administration can only be recorded for a PRN medication");
      if ((medication.isControlledDrug || medication.requiresWitness) && !body.witnessedBy)
        fail(400, "A second active team member must witness this administration");
      if (body.witnessedBy) {
        const witness = await repo.get("UserEntity", body.witnessedBy, { collections: false });
        if (!witness || witness.agencyId !== req.user.agencyId || witness.role === "USER" || !witness.isActive || witness.deletedAt || witness.id === req.user.id)
          fail(400, "Choose another active team member as witness");
      }
      const occurred = new Date(body.occurredAt);
      if (Math.abs(Date.now() - occurred.valueOf()) > 36 * 60 * 60 * 1000)
        fail(400, "Administration time must be within 36 hours of submission");
      const id = randomUUID();
      const administered = ["ADMINISTERED", "PRN_ADMINISTERED"].includes(body.outcome);
      if (administered && medication.stockTrackingEnabled && body.quantityGiven == null)
        fail(400, "Quantity given is required for stock-tracked medication");
      const stockBefore = medication.stockTrackingEnabled ? Number(medication.stockQuantity || 0) : null;
      const stockAfter = medication.stockTrackingEnabled && administered ? stockBefore - Number(body.quantityGiven) : stockBefore;
      if (stockAfter != null && stockAfter < 0) fail(409, "Recorded stock is insufficient for this administration");
      let inserted;
      try {
        inserted = (await db.query(`INSERT INTO node_medication_administrations
          (id,agency_id,client_event_id,visit_id,client_id,medication_id,actor_id,outcome,slot,dose_given,reason,note,prn_effect,witnessed_by,quantity_given,stock_before,stock_after,occurred_at)
          VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`,
          [id,req.user.agencyId,body.clientEventId,v.id,v.client_id,body.medicationId,req.user.id,body.outcome,body.slot,body.doseGiven,body.reason,body.note,body.prnEffect,body.witnessedBy,body.quantityGiven,stockBefore,stockAfter,body.occurredAt])).rows[0];
      } catch (error) {
        if (error?.code === "23505") fail(409, "This medication and time slot have already been recorded for the visit");
        throw error;
      }
      if (medication.stockTrackingEnabled && administered) {
        await repo.save("ClientMedicationSchedulingEntity", { id: medication.id, stockQuantity: stockAfter });
        if (stockAfter <= Number(medication.lowStockThreshold || 0)) {
          const title = `Medication stock low: ${medication.medicationName}`;
          const existing = (await db.query("SELECT id FROM node_client_entries WHERE agency_id=$1 AND client_id=$2 AND category='MEDICATION_STOCK' AND title=$3 AND status='OPEN' LIMIT 1", [req.user.agencyId,v.client_id,title])).rows[0];
          if (!existing) await db.query(`INSERT INTO node_client_entries(id,agency_id,client_id,visit_id,kind,title,body,category,status,revision,created_by,updated_by)
            VALUES($1,$2,$3,$4,'ALERT',$5,$6,'MEDICATION_STOCK','OPEN',1,$7,$7)`,
            [randomUUID(),req.user.agencyId,v.client_id,v.id,title,`${stockAfter} ${medication.stockUnit || "units"} remaining`,req.user.id]);
        }
      }
      const exception = !["ADMINISTERED", "PRN_ADMINISTERED"].includes(body.outcome);
      if (exception) {
        const title = `Medication ${body.outcome.toLowerCase().replaceAll("_", " ")}: ${medication.medicationName}`;
        await db.query(`INSERT INTO node_client_entries(id,agency_id,client_id,visit_id,kind,title,body,category,status,revision,created_by,updated_by)
          VALUES($1,$2,$3,$4,'ALERT',$5,$6,'MEDICATION','OPEN',1,$7,$7)`,
          [randomUUID(),req.user.agencyId,v.client_id,v.id,title,[body.reason,body.note].filter(Boolean).join(" - "),req.user.id]);
      }
      await visitEvent(db, v.id, req.user.id, `Medication ${body.outcome.toLowerCase().replaceAll("_", " ")}: ${medication.medicationName} (${body.slot})`);
      return { row: inserted, created: true };
    });
    return reply(res, result.row, result.created ? "Medication administration recorded" : "Medication administration already recorded", result.created ? 201 : 200);
  });

  route("POST", "/api/medication-administrations/:id/corrections", async (req, res) => {
    auth.admin(req);
    const parsed = z.object({ reason:z.string().trim().min(5).max(1000), replacement:z.object({ outcome:z.enum(["ADMINISTERED","PRN_ADMINISTERED","REFUSED","NOT_AVAILABLE","OMITTED"]).optional(), reason:z.string().trim().max(500).optional(), note:z.string().trim().max(2000).optional(), doseGiven:z.string().trim().max(160).optional() }).strict().refine((value)=>Object.keys(value).length>0,"Enter at least one corrected value") }).safeParse(req.body);
    if (!parsed.success) fail(400, parsed.error.issues[0]?.message || "Correction details are invalid");
    const administration = (await db.query("SELECT * FROM node_medication_administrations WHERE id=$1 AND agency_id=$2", [req.params.id,req.user.agencyId])).rows[0];
    if (!administration) fail(404,"Medication administration not found");
    const correction = (await db.query(`INSERT INTO node_medication_administration_corrections(id,administration_id,agency_id,actor_id,reason,replacement) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [randomUUID(),administration.id,req.user.agencyId,req.user.id,parsed.data.reason,JSON.stringify(parsed.data.replacement)])).rows[0];
    await visitEvent(db,administration.visit_id,req.user.id,`Medication record correction added: ${parsed.data.reason}`);
    return reply(res,correction,"Correction appended",201);
  });

  route("POST", "/api/mobile/visits/:id/attendance", async (req, res) => {
    const v = await visit(req, true);
    const parsed = z.object({ event:z.enum(["CHECK_IN","CHECK_OUT"]), latitude:z.number().min(-90).max(90).nullable().default(null), longitude:z.number().min(-180).max(180).nullable().default(null), accuracy:z.number().nonnegative().max(10000).nullable().default(null) }).safeParse(req.body);
    if (!parsed.success) fail(400, "Provide a valid attendance event and location");
    const b = parsed.data;
    if (b.event === "CHECK_IN" && v.status !== "SCHEDULED") fail(409, "Only a scheduled visit can be checked in");
    if (b.event === "CHECK_OUT" && v.status !== "IN_PROGRESS") fail(409, "Check in before checking out");
    if (b.event === "CHECK_OUT") {
      const scheduled = (await repo.find("ClientMedicationSchedulingEntity", { user: v.client_id })).filter((m) => !m.deletedAt && !m.isStopped);
      const recorded = (await db.query("SELECT medication_id,slot FROM node_medication_administrations WHERE visit_id=$1", [v.id])).rows;
      const missing = scheduled.flatMap((m) => medicationDueSlots(m, v).filter((slot) => !recorded.some((r) => r.medication_id === m.id && r.slot === slot)).map((slot) => `${m.medicationName} (${slot})`));
      if (missing.length) fail(409, `Record an outcome for due medication before checkout: ${missing.join(", ")}`);
    }
    const address=(await repo.find("UserPrimaryAddressEntity",{user:v.client_id})).find((a)=>a.isPrimary);
    if(address?.latitude!=null&&address?.longitude!=null&&(b.latitude==null||b.longitude==null)) fail(400,"Location is required for this client's attendance record");
    let distance=null,within=null;
    if(address?.latitude!=null&&address?.longitude!=null&&b.latitude!=null&&b.longitude!=null){const rad=(x)=>x*Math.PI/180,dLat=rad(b.latitude-address.latitude),dLon=rad(b.longitude-address.longitude),a=Math.sin(dLat/2)**2+Math.cos(rad(address.latitude))*Math.cos(rad(b.latitude))*Math.sin(dLon/2)**2;distance=Math.round(6371000*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)));within=distance<=Math.max(25,address.checkinRadius||150);}
    await db.query("INSERT INTO node_visit_attendance(id,visit_id,actor_id,event,latitude,longitude,accuracy,distance_metres,within_radius) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)", [randomUUID(),v.id,req.user.id,b.event,b.latitude,b.longitude,b.accuracy,distance,within]);
    if (b.event === "CHECK_IN") await db.query("UPDATE node_roster_visits SET status='IN_PROGRESS',actual_start=COALESCE(actual_start,CURRENT_TIMESTAMP),revision=revision+1,updated_by=$2,updated_at=CURRENT_TIMESTAMP WHERE id=$1",[v.id,req.user.id]);
    else await db.query("UPDATE node_roster_visits SET status='COMPLETED',actual_end=COALESCE(actual_end,CURRENT_TIMESTAMP),revision=revision+1,updated_by=$2,updated_at=CURRENT_TIMESTAMP WHERE id=$1",[v.id,req.user.id]);
    await visitEvent(db,v.id,req.user.id,b.event === "CHECK_IN" ? "Checked in using the mobile app" : "Checked out using the mobile app");
    if(b.event==="CHECK_IN"){
      const id=randomUUID(),location=within===true?"Location verified":within===false?`Outside configured radius (${distance} m)`:"Location could not be verified";
      await db.query("INSERT INTO node_client_entries(id,agency_id,client_id,visit_id,kind,title,body,category,status,created_by,updated_by) VALUES($1,$2,$3,$4,'ALERT','Caregiver arrived',$5,'Other alerts','OPEN',$6,$6)",[id,req.user.agencyId,v.client_id,v.id,location,req.user.id]);
      if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.clientEmail||"")) req.afterCommit?.push(()=>mail.send({to:v.clientEmail,subject:"Your caregiver has arrived",text:`Your scheduled caregiver checked in at ${new Date().toLocaleString("en-GB",{timeZone:"Europe/London"})}. Contact your care provider if this was unexpected.`}));
    }
    return reply(res,{ status:b.event === "CHECK_IN" ? "IN_PROGRESS" : "COMPLETED",distanceMetres:distance,withinRadius:within },b.event === "CHECK_IN" ? "Checked in" : "Checked out");
  });

  route("POST", "/api/mobile/visits/:id/entries", async (req,res) => {
    const v=await visit(req);
    const parsed=entryInput.safeParse(req.body); if(!parsed.success) fail(400,"Enter valid care record details");
    const b=parsed.data;
    const allowed={NOTE:["RECORDED"],OBSERVATION:["RECORDED"],ALERT:["OPEN"],ACTIVITY:["COMPLETED","NOT_COMPLETED"]};
    if(!allowed[b.kind].includes(b.status)) fail(400,"Invalid record status");
    const id=randomUUID();
    await db.query("INSERT INTO node_client_entries(id,agency_id,client_id,visit_id,kind,title,body,category,status,created_by,updated_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10)",[id,req.user.agencyId,v.client_id,v.id,b.kind,b.title,b.body,b.category,b.status,req.user.id]);
    await visitEvent(db,v.id,req.user.id,`${b.kind.toLowerCase()} recorded in the mobile app`);
    return reply(res,{id},"Care record saved",201);
  });

  route("POST", "/api/mobile/visits/:id/photos", async (req,res) => {
    const v=await visit(req);
    const file=req.files?.[0]; if(!file) fail(400,"Choose a photo");
    const saved=await files.save(file); if(!saved.mime.startsWith("image/")) fail(400,"Only PNG and JPEG photos are allowed");
    const caption=String(req.body.caption||"").trim(); if(caption.length>500) fail(400,"Caption is too long");
    const id=randomUUID();
    await db.query("INSERT INTO node_visit_attachments(id,agency_id,visit_id,client_id,file_url,file_name,mime_type,caption,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",[id,req.user.agencyId,v.id,v.client_id,saved.url,saved.filename,saved.mime,caption,req.user.id]);
    await visitEvent(db,v.id,req.user.id,"Photo added from the mobile app");
    return reply(res,{id,url:saved.url,name:saved.filename,caption},"Photo uploaded",201);
  },{multipart:true});

  route("POST", "/api/mobile/note-assist", async (req,res) => {
    const text=String(req.body.text||"").trim(); if(text.length<10||text.length>10000) fail(400,"Enter 10 to 10,000 characters");
    const sentences=text.split(/(?<=[.!?])\s+/).filter(Boolean);
    const attention=/fall|injur|bleed|missed|refus|pain|breath|confus|unwell|emergency|medication/i;
    return reply(res,{ summary:sentences.slice(0,3).join(" "), attention:sentences.filter((s)=>attention.test(s)).slice(0,5), requiresReview:true, method:"rules" });
  });
}
