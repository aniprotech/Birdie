import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import request from "supertest";
import { openDatabase, initializeSchema } from "../src/db.js";
import { createApp } from "../src/app.js";
test("Inbox alert and action workflows", async (t) => {
  const db = await openDatabase({ driver: "pglite", dataDir: ":memory:" });
  await initializeSchema(db);
  const sent = [],
    config = {
      production: false,
      jwtSecret: "test-only-secret-at-least-32-characters",
      frontendUrl: "http://localhost:5173",
      corsOrigins: [],
      uploadDir: "./test-uploads",
    },
    app = createApp({ db, config, mail: { send: async (m) => sent.push(m) } }),
    { repo, auth } = app.locals.ctx,
    agency = randomUUID();
  const person = (name, role, agencyId = agency) =>
    repo.save("UserEntity", {
      firstName: name,
      lastName: "Fixture",
      email: name + "@inbox.test",
      role,
      agencyId,
      isActive: true,
    });
  const admin = await person("admin", "ADMIN"),
    carer = await person("carer", "CAREGIVER"),
    client = await person("client", "USER"),
    other = await person("other", "ADMIN", randomUUID()),
    unassigned = await person("unassigned", "CAREGIVER");
  async function login(u) {
    await auth.requestLink(u.email);
    const link = sent.at(-1).text.match(/http[^\s]+/)[0],
      [email, password] = Buffer.from(
        new URL(link).searchParams.get("token"),
        "base64url",
      )
        .toString()
        .split(":");
    return (await auth.exchange(email, password)).accessToken;
  }
  const at = await login(admin),
    ct = await login(carer),
    ot = await login(other),
    ut = await login(unassigned),
    call = (m, p, b, token = at) =>
      request(app)
        [m](p)
        .set("Authorization", "Bearer " + token)
        .send(b),
    data = (r) => r.body.results.data;
  let alert, action;
  try {
    await t.test(
      "Client feed alerts appear automatically and changes stay synchronized",
      async () => {
        let r = await call("post", "/api/clients/" + client.id + "/entries", {
          kind: "ALERT",
          title: "Medication not taken",
          body: "Fixture incident",
          status: "OPEN",
        });
        assert.equal(r.status, 201, r.body.message);
        alert = data(r);
        r = await call("get", "/api/inbox/items");
        assert.equal(r.status, 200, r.body.message);
        assert.equal(data(r).counts.ALERT.OPEN, 1);
        assert.equal(data(r).items[0].id, alert.id);
        r = await call("put", "/api/inbox/items/" + alert.id, {
          revision: 1,
          state: "IN_PROGRESS",
          severity: "HIGH",
        });
        assert.equal(r.status, 200, r.body.message);
        assert.equal(data(r).revision, 2);
        assert.equal(data(r).state, "IN_PROGRESS");
        assert.equal(
          (
            await call("put", "/api/inbox/items/" + alert.id, {
              revision: 1,
              state: "RESOLVED",
            })
          ).status,
          409,
        );
        r = await call("put", "/api/inbox/items/" + alert.id, {
          revision: 2,
          state: "RESOLVED",
        });
        assert.equal(r.status, 200, r.body.message);
        assert.equal(
          (
            await db.query(
              "SELECT status FROM node_client_entries WHERE id=$1",
              [alert.id],
            )
          ).rows[0].status,
          "RESOLVED",
        );
        r = await call(
          "put",
          "/api/clients/" + client.id + "/entries/" + alert.id,
          {
            kind: "ALERT",
            visitId: null,
            title: "Medication not taken",
            body: "Reopened via care feed",
            status: "OPEN",
            revision: 3,
          },
        );
        assert.equal(r.status, 200, r.body.message);
        assert.equal(
          data(await call("get", "/api/inbox/items/" + alert.id)).item.state,
          "OPEN",
        );
      },
    );
    await t.test(
      "Assignment, due dates, scoped carer access and comments",
      async () => {
        await repo.save("ClientCareTeamEntity", {
          client: client.id,
          carer: carer.id,
          viewAccess: true,
          allowedToVisit: true,
        });
        const today = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Europe/London",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date());
        let r = await call("post", "/api/inbox/items", {
          kind: "ACTION",
          clientId: client.id,
          title: "Follow up wellbeing",
          body: "Contact coordinator",
          assignedTo: carer.id,
          dueDate: today,
        });
        assert.equal(r.status, 201, r.body.message);
        action = data(r);
        r = await call(
          "get",
          "/api/inbox/items?kind=ACTION&filter=MINE",
          undefined,
          ct,
        );
        assert.equal(r.status, 200, r.body.message);
        assert.equal(data(r).items.length, 1);
        assert.equal(data(r).counts.ACTION.TODAY, 1);
        assert.equal(
          data(
            await call(
              "get",
              "/api/inbox/items?kind=ACTION&filter=ALL",
              undefined,
              ut,
            ),
          ).items.length,
          0,
        );
        assert.equal(
          (await call("get", "/api/inbox/items/" + action.id, undefined, ot))
            .status,
          404,
        );
        assert.equal(
          (await call("get", "/api/inbox/items/" + action.id, undefined, ut))
            .status,
          404,
        );
        assert.equal(
          (
            await call(
              "put",
              "/api/inbox/items/" + action.id,
              { revision: action.revision, severity: "CRITICAL" },
              ct,
            )
          ).status,
          403,
        );
        r = await call(
          "put",
          "/api/inbox/items/" + action.id,
          { revision: action.revision, state: "IN_PROGRESS" },
          ct,
        );
        assert.equal(r.status, 200, r.body.message);
        action = data(r);
        r = await call(
          "post",
          "/api/inbox/items/" + action.id + "/comments",
          { body: "Follow-up recorded" },
          ct,
        );
        assert.equal(r.status, 201, r.body.message);
        r = await call("get", "/api/inbox/items/" + action.id);
        assert.equal(data(r).comments[0].body, "Follow-up recorded");
        assert.ok(
          data(r).events.some((e) => e.description === "Comment added"),
        );
        assert.equal(
          (
            await call("post", "/api/inbox/items/" + action.id + "/comments", {
              body: "  ",
            })
          ).status,
          400,
        );
      },
    );
    await t.test(
      "Bulk changes are atomic; archive preserves history and restore works",
      async () => {
        const ids = [
          data(await call("get", "/api/inbox/items/" + alert.id)).item,
          action,
        ].sort((a, b) => a.id.localeCompare(b.id));
        let r = await call("post", "/api/inbox/items/bulk", {
          items: ids.map((i, n) => ({
            id: i.id,
            revision: i.revision + (n === 1 ? 1 : 0),
          })),
          changes: { severity: "CRITICAL" },
        });
        assert.equal(r.status, 409, r.body.message);
        assert.notEqual(
          data(await call("get", "/api/inbox/items/" + ids[0].id)).item
            .severity,
          "CRITICAL",
        );
        r = await call("post", "/api/inbox/items/bulk", {
          items: ids.map((i) => ({ id: i.id, revision: i.revision })),
          changes: { state: "RESOLVED", archived: true },
        });
        assert.equal(r.status, 200, r.body.message);
        assert.equal(
          data(await call("get", "/api/inbox/items?filter=ARCHIVED")).items
            .length,
          1,
        );
        const item = data(
          await call("get", "/api/inbox/items/" + action.id),
        ).item;
        r = await call("put", "/api/inbox/items/" + item.id, {
          revision: item.revision,
          archived: false,
        });
        assert.equal(r.status, 200, r.body.message);
        assert.equal(data(r).state, "RESOLVED");
      },
    );
    await t.test(
      "Invalid assignments and forged visit links roll back; revoked access hides assigned actions",
      async () => {
        let r = await call("post", "/api/inbox/items", {
          kind: "ALERT",
          clientId: client.id,
          title: "Invalid",
          body: "Test",
          assignedTo: other.id,
        });
        assert.equal(r.status, 400, r.body.message);
        r = await call("post", "/api/inbox/items", {
          kind: "ALERT",
          clientId: client.id,
          title: "Invalid",
          body: "Test",
          visitId: randomUUID(),
        });
        assert.equal(r.status, 400);
        assert.equal(
          (
            await db.query(
              "SELECT count(*)::int n FROM node_client_entries WHERE title='Invalid'",
            )
          ).rows[0].n,
          0,
        );
        assert.equal(
          (
            await call(
              "post",
              "/api/inbox/items/bulk",
              {
                items: [{ id: action.id, revision: 1 }],
                changes: { state: "OPEN" },
              },
              ct,
            )
          ).status,
          403,
        );
        assert.equal(
          (await call("get", "/api/inbox/items?filter=bogus")).status,
          400,
        );
        const link = await repo.one("ClientCareTeamEntity", {
          client: client.id,
          carer: carer.id,
        });
        await repo.save("ClientCareTeamEntity", {
          ...link,
          revokeViewaccess: true,
        });
        assert.equal(
          (await call("get", "/api/inbox/items/" + action.id, undefined, ct))
            .status,
          404,
        );
      },
    );
    await t.test('Pagination and literal searches return complete, disjoint pages',async()=>{
      for(let i=0;i<35;i++)await db.query("INSERT INTO node_client_entries(id,agency_id,client_id,kind,title,body,status,created_by,updated_by) VALUES($1,$2,$3,'ALERT',$4,'Pagination fixture','OPEN',$5,$5)",[randomUUID(),agency,client.id,'Batch_100% item '+i,admin.id]);
      const url='/api/inbox/items?kind=ALERT&filter=ALL&search='+encodeURIComponent('Batch_100%');
      const first=data(await call('get',url)),second=data(await call('get',url+'&page=2'));
      assert.equal(first.total,35);assert.equal(first.items.length,30);assert.equal(second.items.length,5);assert.equal(new Set([...first.items,...second.items].map(i=>i.id)).size,35);
      assert.equal(data(await call('get',url+'&severity=HIGH')).total,0);
      assert.equal((await call('post','/api/inbox/items',{kind:'ACTION',clientId:client.id,title:'Impossible due date',body:'Fixture',dueDate:'2026-02-30'})).status,400);
    });

    await t.test('Advanced filters intersect, validate dates and preserve agency scope',async()=>{
      const base='/api/inbox/items?filter=ALL';
      let combined=await call('get',base+'&recordKind=ALL&states=OPEN|IN_PROGRESS|RESOLVED|ARCHIVED&actionStates=OPEN|IN_PROGRESS|RESOLVED|ARCHIVED');assert.equal(combined.status,200,combined.body.message);assert.ok(data(combined).total>35);
      combined=await call('get',base+'&recordKind=ALL&types=Medication%20not%20taken&states=ARCHIVED|OPEN|RESOLVED&actionStates=OPEN|RESOLVED|ARCHIVED');assert.equal(combined.status,200,combined.body.message);assert.ok(data(combined).items.some(i=>i.kind==='ACTION'));assert.ok(data(combined).items.some(i=>i.kind==='ALERT'));

      let r=await call('get',base+'&clientId='+client.id+'&createdBy='+admin.id+'&sort=OLDEST');assert.equal(r.status,200,r.body.message);assert.ok(data(r).total>0);
      assert.equal(data(await call('get',base+'&clientId='+other.id)).total,0);
      assert.equal(data(await call('get',base+'&states=ARCHIVED|RESOLVED|OPEN&types='+encodeURIComponent('Medication not taken'))).items[0].title,'Medication not taken');
      r=await call('get',base+'&levels=LOW|CRITICAL&states=OPEN|RESOLVED');assert.equal(r.status,200,r.body.message);assert.ok(data(r).items.every(i=>['LOW','CRITICAL'].includes(i.severity)));
      for(const query of ['from=2026-02-30','from=2026-02-02&to=2026-01-01','states=wrong','levels=wrong','sort=wrong'])assert.equal((await call('get',base+'&'+query)).status,400,query);
      assert.equal(data(await call('get',base+'&from=2099-01-01')).total,0);
      assert.equal(data(await call('get',base+'&group=Unknown')).total,0);
      assert.equal(data(await call('get',base+'&carerId='+carer.id)).total,0);
      assert.equal(data(await call('get',base+'&hasVisit=LINKED')).total,0);
      assert.equal(data(await call('get',base+'&dueFrom=2099-01-01&dueTo=2099-12-31')).total,0);
      assert.equal(data(await call('get',base+'&levels=LOW',undefined,ot)).total,0);
    });
    await t.test('Personal preferences persist, reject stale writes and stay isolated',async()=>{
      const defaults=data(await call('get','/api/inbox/preferences'));assert.equal(defaults.revision,0);
      const preferences={...defaults.preferences,sort:'SEVERITY',notifications:{'Medication not taken':{email:true,sms:false}}};
      let r=await call('put','/api/inbox/preferences',{preferences,revision:0});assert.equal(r.status,200,r.body.message);assert.equal(data(r).revision,1);
      assert.deepEqual(data(await call('get','/api/inbox/preferences')).preferences,preferences);
      assert.equal((await call('put','/api/inbox/preferences',{preferences,revision:0})).status,409);
      assert.equal(data(await call('get','/api/inbox/preferences',undefined,ct)).revision,0);
      assert.equal(data(await call('get','/api/inbox/preferences',undefined,ot)).revision,0);
      assert.equal((await call('put','/api/inbox/preferences',{preferences,revision:4},ot)).status,409);
      assert.equal((await call('put','/api/inbox/preferences',{preferences:{...preferences,sort:'SQL'},revision:1})).status,400);
    });
  } finally {
    await db.close();
  }
});
