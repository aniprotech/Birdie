import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import request from "supertest";
import { openDatabase, initializeSchema } from "../src/db.js";
import { createApp } from "../src/app.js";
test("Operations modules", async (t) => {
  const db = await openDatabase({ driver: "pglite", dataDir: ":memory:" });
  await initializeSchema(db);
  const sent = [],
    config = {
      production: false,
      jwtSecret: "operations-test-secret-at-least-32-characters",
      frontendUrl: "http://localhost:5173",
      corsOrigins: [],
      uploadDir: "./test-uploads",
    };
  const app = createApp({
      db,
      config,
      mail: { send: async (m) => sent.push(m) },
    }),
    { repo, auth } = app.locals.ctx,
    agency = randomUUID();
  async function person(name, role = "CAREGIVER", agencyId = agency) {
    return repo.save("UserEntity", {
      firstName: name,
      lastName: "Test",
      email: name + "@ops.test",
      role,
      isActive: true,
      agencyId,
    });
  }
  const admin = await person("admin", "ADMIN"),
    staff = await person("staff"),
    third = await person("third"),
    other = await person("other", "ADMIN", randomUUID()),
    client = await person("client", "USER");
  async function login(u) {
    await auth.requestLink(u.email);
    const url = sent.at(-1).text.match(/http[^\s]+/)[0];
    const [email, password] = Buffer.from(
      new URL(url).searchParams.get("token"),
      "base64url",
    )
      .toString()
      .split(":");
    return (await auth.exchange(email, password)).accessToken;
  }
  const at = await login(admin),
    st = await login(staff),
    tt = await login(third),
    ot = await login(other);
  const call = (method, path, body, token = at) =>
    request(app)
      [method](path)
      .set("Authorization", "Bearer " + token)
      .send(body);
  const data = (r) => r.body.results.data;
  let thread;
  try {
    await t.test(
      "Inbox conversations are private to members and their agency",
      async () => {
        let r = await call("post", "/api/inbox/threads", {
          subject: "Handover",
          body: "Test message",
          participantIds: [staff.id],
        });
        assert.equal(r.status, 201);
        thread = data(r).id;
        assert.equal(
          (
            await call(
              "get",
              `/api/inbox/threads/${thread}/messages`,
              undefined,
              tt,
            )
          ).status,
          404,
        );
        assert.equal(
          (
            await call(
              "get",
              `/api/inbox/threads/${thread}/messages`,
              undefined,
              ot,
            )
          ).status,
          404,
        );
        assert.equal(
          (
            await call("post", "/api/inbox/threads", {
              subject: "Invalid",
              body: "Test",
              participantIds: [other.id],
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await call("post", "/api/inbox/threads", {
              subject: "Invalid",
              body: "Test",
              participantIds: [client.id],
            })
          ).status,
          400,
        );
      },
    );
    await t.test(
      "Unread state, replies, archive and restore persist",
      async () => {
        let list = data(await call("get", "/api/inbox/threads", undefined, st));
        assert.equal(list.threads[0].unread, 1);
        const messages = data(
          await call(
            "get",
            `/api/inbox/threads/${thread}/messages`,
            undefined,
            st,
          ),
        ).messages;
        assert.equal(
          (
            await call(
              "post",
              `/api/inbox/threads/${thread}/read`,
              { throughSeq: messages[0].seq },
              st,
            )
          ).status,
          200,
        );
        assert.equal(
          data(await call("get", "/api/inbox/threads", undefined, st))
            .threads[0].unread,
          0,
        );
        await call(
          "post",
          `/api/inbox/threads/${thread}/archive`,
          { archived: true },
          st,
        );
        assert.equal(
          data(await call("get", "/api/inbox/threads", undefined, st)).threads
            .length,
          0,
        );
        await call("post", `/api/inbox/threads/${thread}/messages`, {
          body: "Follow-up",
        });
        assert.equal(
          data(await call("get", "/api/inbox/threads", undefined, st)).threads
            .length,
          1,
        );
        assert.equal(
          (
            await call(
              "post",
              `/api/inbox/threads/${thread}/read`,
              { throughSeq: "999999" },
              st,
            )
          ).status,
          400,
        );
      },
    );
    await t.test("Log is read-only, agency-scoped and admin-only", async () => {
      const path = "/api/activity?from=2020-01-01&to=2030-01-01";
      assert.equal((await call("get", path)).status, 400);
      const today = new Date().toISOString().slice(0, 10),
        range = `/api/activity?from=${today}&to=${today}`;
      assert.equal((await call("get", range, undefined, st)).status, 403);
      assert.equal(
        data(await call("get", range, undefined, ot)).entries.length,
        0,
      );
      assert.ok(data(await call("get", range)).entries.length > 0);
    });
    await t.test(
      "Finance snapshots completed visits, checks rates and prevents duplicate billing",
      async () => {
        const visit = (
          await db.query(
            `INSERT INTO node_roster_visits(id,agency_id,client_id,staff_id,visit_date,start_time,end_time,title,notes,status,created_by,updated_by)
 VALUES($1,$2,$3,$4,'2026-09-10','09:00','09:45','Completed test visit','','COMPLETED',$5,$5) RETURNING id`,
            [randomUUID(), agency, client.id, staff.id, admin.id],
          )
        ).rows[0];
        const query = {
          kind: "INVOICE",
          recipientId: client.id,
          from: "2026-09-01",
          to: "2026-09-30",
        };
        assert.equal(
          (await call("post", "/api/finance/documents", query)).status,
          400,
        );
        assert.equal(
          (
            await call("post", "/api/finance/rates", {
              userId: client.id,
              kind: "BILLING",
              effectiveFrom: "2026-09-01",
              hourlyPence: 1999,
            })
          ).status,
          200,
        );
        assert.equal(
          (
            await call(
              "post",
              "/api/finance/rates",
              {
                userId: staff.id,
                kind: "PAY",
                effectiveFrom: "2026-09-01",
                hourlyPence: 1200,
              },
              st,
            )
          ).status,
          403,
        );
        await call("post", "/api/finance/rates", {
          userId: staff.id,
          kind: "PAY",
          effectiveFrom: "2026-09-01",
          hourlyPence: 1200,
        });
        assert.equal(
          (
            await call("post", "/api/finance/visits/review", {
              items: [{ id: visit.id, revision: 1, reviewRevision: 0 }],
              kind: "PAY",
              state: "CONFIRMED",
              basis: "ACTUAL",
              reason: "Actual attendance is required",
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await call("post", "/api/finance/travel-rates", {
              userId: staff.id,
              effectiveFrom: "2026-09-01",
              mileagePence: 45,
              hourlyPence: 1200,
            })
          ).status,
          200,
        );
        assert.equal(data(await call("get", "/api/finance/travel-rates")).length, 1);
        assert.equal(
          (
            await call("post", "/api/finance/service-hours", {
              userId: client.id,
              effectiveFrom: "2026-09-01",
              weeklyMinutes: 600,
              fundingSource: "Private",
              reference: "TEST-1",
            })
          ).status,
          200,
        );
        assert.equal(data(await call("get", "/api/finance/service-hours"))[0].weeklyMinutes, 600);
        assert.equal(
          (await call("get", "/api/finance/visits?from=2026-09-01&to=2026-09-30", undefined, st)).status,
          403,
        );
        for (const kind of ["BILLING", "PAY"])
          assert.equal(
            (
              await call("post", "/api/finance/visits/review", {
                items: [{ id: visit.id, revision: 1, reviewRevision: 0 }],
                kind,
                state: "CONFIRMED",
                basis: "PLANNED",
                reason: "Approved for the test period",
              })
            ).status,
            200,
          );
        const overview = data(
          await call("get", "/api/finance/overview?from=2026-09-10&to=2026-09-10"),
        );
        assert.equal(overview.clients.find((x) => x.id === client.id).confirmedMinutes, 45);
        assert.equal(overview.clients.find((x) => x.id === client.id).serviceMinutes, 86);
        assert.equal(overview.staff.find((x) => x.id === staff.id).confirmedMinutes, 45);
        const invoice = await call("post", "/api/finance/documents", query);
        assert.equal(invoice.status, 201, JSON.stringify(invoice.body));
        const id = data(invoice).id;
        let detail = data(await call("get", "/api/finance/documents/" + id));
        assert.equal(detail.totalPence, 1499);
        assert.equal(detail.lines[0].minutes, 45);
        assert.equal(
          (await call("post", "/api/finance/documents", query)).status,
          400,
        );
        await call("post", "/api/finance/rates", {
          userId: client.id,
          kind: "BILLING",
          effectiveFrom: "2026-09-01",
          hourlyPence: 3000,
        });
        assert.equal(
          data(await call("get", "/api/finance/documents/" + id)).totalPence,
          1499,
        );
        assert.equal(
          (await call("get", "/api/finance/documents/" + id, undefined, ot))
            .status,
          404,
        );
        assert.equal(
          (
            await call("post", `/api/finance/documents/${id}/status`, {
              expectedStatus: "DRAFT",
              status: "PAID",
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await call("post", `/api/finance/documents/${id}/status`, {
              expectedStatus: "DRAFT",
              status: "ISSUED",
            })
          ).status,
          200,
        );
        assert.equal(
          (
            await call("post", `/api/finance/documents/${id}/status`, {
              expectedStatus: "DRAFT",
              status: "VOID",
            })
          ).status,
          409,
        );
        assert.equal(
          (
            await call("post", `/api/finance/documents/${id}/status`, {
              expectedStatus: "ISSUED",
              status: "VOID",
            })
          ).status,
          200,
        );
        assert.equal(
          (await call("post", "/api/finance/documents", query)).status,
          201,
        );
        const pay = await call("post", "/api/finance/documents", {
          ...query,
          kind: "PAYRUN",
          recipientId: staff.id,
        });
        assert.equal(pay.status, 201);
        const payId = data(pay).id;
        assert.equal(
          data(await call("get", "/api/finance/documents/" + payId)).totalPence,
          900,
        );
        await call("post", `/api/finance/documents/${payId}/status`, {
          expectedStatus: "DRAFT",
          status: "APPROVED",
        });
        assert.equal(
          (
            await call("post", `/api/finance/documents/${payId}/status`, {
              expectedStatus: "APPROVED",
              status: "PAID",
            })
          ).status,
          200,
        );
        assert.equal(
          (
            await call("post", `/api/finance/documents/${payId}/status`, {
              expectedStatus: "PAID",
              status: "VOID",
            })
          ).status,
          400,
        );
        const visit2=(await db.query(`INSERT INTO node_roster_visits(id,agency_id,client_id,staff_id,visit_date,start_time,end_time,title,notes,status,created_by,updated_by)
          VALUES($1,$2,$3,$4,'2026-09-11','10:00','10:45','Travelled visit','','COMPLETED',$5,$5) RETURNING id`,[randomUUID(),agency,client.id,staff.id,admin.id])).rows[0];
        for(const kind of ["BILLING","PAY"])assert.equal((await call("post","/api/finance/visits/review",{items:[{id:visit2.id,revision:1,reviewRevision:0}],kind,state:"CONFIRMED",basis:"PLANNED",reason:"Gate B test approval"})).status,200);
        assert.equal((await call("post","/api/finance/travel",{visitId:visit2.id,miles:2,minutes:30,source:"ACTUAL",expectedRevision:0})).status,200);
        const travelPreview=data(await call("get",`/api/finance/preview?kind=PAYRUN&recipientId=${staff.id}&from=2026-09-11&to=2026-09-11`));
        assert.deepEqual(travelPreview.lines.map(x=>x.component).sort(),["CARE","MILEAGE","TRAVEL_TIME"]);assert.equal(travelPreview.totalPence,1590);
        const travelPay=data(await call("post","/api/finance/documents",{kind:"PAYRUN",recipientId:staff.id,from:"2026-09-11",to:"2026-09-11"}));
        const reconciliation=data(await call("get",`/api/finance/documents/${travelPay.id}/reconcile`));assert.equal(reconciliation.balanced,true);assert.equal(reconciliation.lineCount,3);
        const exported=await call("post",`/api/finance/documents/${travelPay.id}/export`,{format:"CSV"});assert.equal(exported.status,200);assert.equal(data(exported).reconciliation.balanced,true);
        const newInvoice=data(await call("post","/api/finance/documents",{kind:"INVOICE",recipientId:client.id,from:"2026-09-11",to:"2026-09-11"}));
        assert.equal((await call("post",`/api/finance/documents/${newInvoice.id}/status`,{expectedStatus:"DRAFT",status:"ISSUED"})).status,200);
        const invoiceDetail=data(await call("get",`/api/finance/documents/${newInvoice.id}`));
        const credit=data(await call("post","/api/finance/credit-notes",{invoiceId:newInvoice.id,reason:"Service adjustment agreed",lines:[{financeLineId:invoiceDetail.lines[0].id,amountPence:500}]}));
        let creditDetail=data(await call("get",`/api/finance/credit-notes/${credit.id}`));assert.equal(creditDetail.totalPence,500);assert.equal(creditDetail.status,"DRAFT");
        assert.equal((await call("post",`/api/finance/credit-notes/${credit.id}/status`,{expectedStatus:"DRAFT",status:"ISSUED"})).status,200);
        assert.equal((await call("post",`/api/finance/credit-notes/${credit.id}/status`,{expectedStatus:"ISSUED",status:"APPLIED"})).status,200);
        assert.equal((await call("post","/api/finance/credit-notes",{invoiceId:newInvoice.id,reason:"Invalid excessive line credit",lines:[{financeLineId:invoiceDetail.lines[0].id,amountPence:2000}]})).status,409);
        assert.equal((await call("post","/api/finance/travel",{visitId:visit2.id,miles:3,minutes:35,source:"ACTUAL",expectedRevision:1})).status,409);
        await db.query("UPDATE node_roster_visits SET revision=revision+1 WHERE id=$1",[visit2.id]);
        assert.equal(data(await call("get",`/api/finance/documents/${travelPay.id}/reconcile`)).sourcesMatch,false);
        assert.equal((await call("post",`/api/finance/documents/${travelPay.id}/status`,{expectedStatus:"DRAFT",status:"APPROVED"})).status,409);
      },
    );
    await t.test(
      "Reports reconcile delivered visits and keep finances admin-only",
      async () => {
        const path = "/api/reports/summary?from=2026-09-01&to=2026-09-30";
        const r = await call("get", path);
        assert.equal(r.status, 200);
        assert.equal(
          data(r).byStatus.find((s) => s.status === "COMPLETED").visits,
          2,
        );
        assert.equal(data(r).staff[0].completedMinutes, 90);
        assert.equal((await call("get", path, undefined, st)).status, 403);
        assert.equal(
          data(await call("get", path, undefined, ot)).byStatus.length,
          0,
        );
      },
    );
    await t.test('Mobile links use a fixed app scheme and remain single use',async()=>{
      await call('post','/api/auth/request-link',{email:admin.email,client:'mobile'});
      const link=sent.at(-1).text.match(/aniprotech:[^\s]+/)[0];
      const [email,password]=Buffer.from(new URL(link).searchParams.get('token'),'base64url').toString().split(':');
      assert.equal((await call('post','/api/auth/get-token',{email,password})).status,200);
      assert.equal((await call('post','/api/auth/get-token',{email,password})).status,401);
      assert.equal((await call('post','/api/auth/request-link',{email:admin.email,client:'https://untrusted.example'})).status,400);
    });
  } finally {
    await db.close();
  }
});
