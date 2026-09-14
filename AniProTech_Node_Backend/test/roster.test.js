import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import request from "supertest";
import { openDatabase, initializeSchema } from "../src/db.js";
import { createApp } from "../src/app.js";
import { occursOn } from "../src/services/roster.js";

test("Roster workflows and Team safeguards", async (t) => {
  const db = await openDatabase({ driver: "pglite", dataDir: ":memory:" });
  await initializeSchema(db);
  const config = {
    production: false,
    jwtSecret: "test-only-secret-at-least-32-characters",
    frontendUrl: "http://localhost:5173",
    corsOrigins: [],
    uploadDir: "./test-uploads",
  };
  const sent = [],
    app = createApp({ db, config, mail: { send: async (m) => sent.push(m) } }),
    { repo, auth } = app.locals.ctx;
  const agency = randomUUID();
  async function person(email, role, agencyId = agency) {
    return repo.save("UserEntity", {
      firstName: "Test",
      lastName: role,
      email,
      role,
      agencyId,
      isActive: true,
    });
  }
  const admin = await person("admin@roster.test", "ADMIN"),
    staff = await person("staff@roster.test", "CAREGIVER"),
    client = await person("client@roster.test", "USER"),
    client2 = await person("client2@roster.test", "USER"),
    other = await person("other@roster.test", "ADMIN", randomUUID());
  async function token(email) {
    await auth.requestLink(email);
    const link = sent.at(-1).text.match(/http[^\s]+/)[0];
    const [e, p] = Buffer.from(
      new URL(link).searchParams.get("token"),
      "base64url",
    )
      .toString()
      .split(":");
    return (await auth.exchange(e, p)).accessToken;
  }
  const adminToken = await token(admin.email),
    staffToken = await token(staff.email),
    otherToken = await token(other.email);
  const call = (method, path, body, access = adminToken) =>
    request(app)
      [method](path)
      .set("Authorization", "Bearer " + access)
      .send(body);
  const data = (r) => r.body.results.data;
  const base = {
    clientId: client.id,
    staffId: staff.id,
    date: "2026-09-14",
    startTime: "09:00",
    endTime: "10:00",
    title: "Morning support",
    status: "SCHEDULED",
  };
  let visit;
  try {
    await t.test(
      "Create and list visits; London calendar date remains unchanged",
      async () => {
        const r = await call("post", "/api/roster/visits", base);
        assert.equal(r.status, 201, JSON.stringify(r.body));
        visit = data(r).visits[0];
        assert.equal(visit.date, base.date);
        assert.equal(visit.startTime, "09:00");
        const list = await call(
          "get",
          "/api/roster/visits?from=2026-09-14&to=2026-09-20",
        );
        assert.equal(data(list).visits.length, 1);
        assert.equal(
          data(await call("get", "/api/roster/options")).timezone,
          "Europe/London",
        );
      },
    );
    await t.test(
      "Overlap prevention, atomic repeat rollback, and invalid dates",
      async () => {
        assert.equal(
          (
            await call("post", "/api/roster/visits", {
              ...base,
              clientId: client2.id,
            })
          ).status,
          409,
        );
        assert.equal(
          (
            await call("post", "/api/roster/visits", {
              ...base,
              date: "2026-09-07",
              repeatWeeks: 2,
            })
          ).status,
          409,
        );
        const list = await call(
          "get",
          "/api/roster/visits?from=2026-09-07&to=2026-09-20",
        );
        assert.equal(data(list).visits.length, 1);
        assert.equal(
          (
            await call("post", "/api/roster/visits", {
              ...base,
              date: "2026-02-30",
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await call("post", "/api/roster/visits", {
              ...base,
              endTime: "08:00",
            })
          ).status,
          400,
        );
      },
    );
    await t.test("Staff permissions and agency isolation", async () => {
      assert.equal(
        (await call("post", "/api/roster/visits", base, staffToken)).status,
        403,
      );
      assert.equal(
        data(
          await call(
            "get",
            "/api/roster/visits?from=2026-09-14&to=2026-09-20",
            undefined,
            otherToken,
          ),
        ).visits.length,
        0,
      );
      assert.equal(
        (
          await call(
            "put",
            "/api/roster/visits/" + visit.id,
            { ...base, revision: 1 },
            otherToken,
          )
        ).status,
        404,
      );
      assert.equal(
        (
          await call("post", "/api/roster/visits", {
            ...base,
            clientId: other.id,
            date: "2026-09-15",
          })
        ).status,
        404,
      );
    });
    await t.test(
      "Edit revision protects against stale changes; status lifecycle",
      async () => {
        const r = await call("put", "/api/roster/visits/" + visit.id, {
          ...base,
          title: "Updated visit",
          revision: 1,
        });
        assert.equal(r.status, 200);
        assert.equal(
          (
            await call("put", "/api/roster/visits/" + visit.id, {
              ...base,
              revision: 1,
            })
          ).status,
          409,
        );
        assert.equal(
          (
            await call(
              "post",
              `/api/roster/visits/${visit.id}/status`,
              { status: "CANCELLED", revision: 2 },
              staffToken,
            )
          ).status,
          403,
        );
        assert.equal(
          (
            await call(
              "post",
              `/api/roster/visits/${visit.id}/status`,
              { status: "IN_PROGRESS", revision: 2 },
              staffToken,
            )
          ).status,
          200,
        );
        assert.equal(
          (
            await call(
              "post",
              `/api/roster/visits/${visit.id}/status`,
              { status: "COMPLETED", revision: 3 },
              staffToken,
            )
          ).status,
          200,
        );
        assert.equal(
          (
            await call("put", "/api/roster/visits/" + visit.id, {
              ...base,
              revision: 4,
            })
          ).status,
          409,
        );
      },
    );
    await t.test("Absences and weekly availability are enforced", async () => {
      await repo.save("TeamAbsenceEntity", {
        user: staff.id,
        startDate: "2026-09-15",
        endDate: "2026-09-15",
        startTime: "08:00",
        endTime: "12:00",
      });
      assert.equal(
        (
          await call("post", "/api/roster/visits", {
            ...base,
            date: "2026-09-15",
          })
        ).status,
        409,
      );
      await repo.save("TeamAvailabilityEntity", {
        user: staff.id,
        startDate: "2026-09-14",
        frequency: "WEEKLY",
        selectedDays: ["MONDAY"],
        startTime: "08:00",
        endTime: "12:00",
        isEnds: false,
      });
      assert.equal(
        (
          await call("post", "/api/roster/visits", {
            ...base,
            date: "2026-09-16",
          })
        ).status,
        409,
      );
      const r = await call("post", "/api/roster/visits", {
        ...base,
        date: "2026-09-21",
        repeatWeeks: 2,
      });
      assert.equal(r.status, 201, JSON.stringify(r.body));
      assert.equal(data(r).visits.length, 2);
      const id = data(r).visits[0].id;
      assert.equal(
        (
          await call("post", `/api/roster/visits/${id}/status`, {
            status: "CANCELLED",
            revision: 1,
          })
        ).status,
        200,
      );
      assert.equal(
        (
          await call("post", "/api/roster/visits", {
            ...base,
            date: "2026-09-21",
          })
        ).status,
        201,
      );
    });
    await t.test(
      "Absence booking cannot silently conflict with an existing visit",
      async () => {
        const r = await call("post", "/api/team-absence/create/" + staff.id, {
          startDate: "2026-09-28",
          endDate: "2026-09-28",
          startTime: "08:00",
          endTime: "12:00",
          type: "ANNUAL_LEAVE",
        });
        assert.equal(r.status, 409, JSON.stringify(r.body));
      },
    );
    await t.test(
      "London clock-change hours are rejected rather than mis-timed",
      async () => {
        const r = await call("post", "/api/roster/visits", {
          ...base,
          date: "2026-10-25",
          startTime: "01:15",
          endTime: "01:45",
        });
        assert.equal(r.status, 400);
      },
    );
    await t.test(
      "Team create, update, filter and own-account protection",
      async () => {
        const r = await call("post", "/api/team/create-user", {
          firstName: "New",
          lastName: "Staff",
          email: "new@roster.test",
          role: "CAREGIVER",
        });
        assert.equal(r.status, 201);
        const id = data(r).id;
        assert.equal(
          (
            await call("put", "/api/team/update-user/" + id, {
              isActive: false,
            })
          ).status,
          200,
        );
        const list = await call("post", "/api/team/get-all-users", {
          search: "new@roster.test",
          isActive: null,
        });
        assert.equal(data(list).users.length, 1);
        assert.equal(
          (
            await call("put", "/api/team/update-user/" + admin.id, {
              isActive: false,
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await call("put", "/api/team/update-user/" + id, {
              role: "SUPERADMIN",
            })
          ).status,
          403,
        );
      },
    );
    await t.test(
      "Custom recurrence skips deleted dates and respects ending",
      () => {
        const row = {
          startDate: "2026-09-07",
          endDate: "2026-09-30",
          isEnds: true,
          frequency: "CUSTOM",
          repeatEvery: 2,
          repeatUnit: "WEEKS",
          selectedDays: ["MONDAY"],
          deletedDate: ["2026-09-21"],
        };
        assert.equal(occursOn(row, "2026-09-07"), true);
        assert.equal(occursOn(row, "2026-09-14"), false);
        assert.equal(occursOn(row, "2026-09-21"), false);
        assert.equal(occursOn(row, "2026-10-05"), false);
      },
    );
    await t.test(
      "Team groups persist and feeds enforce ownership and resolution permissions",
      async () => {
        const group = await call("put", `/api/team/${staff.id}/groups`, {
          groups: ["North", "Weekend"],
        });
        assert.equal(group.status, 200);
        assert.deepEqual(
          data(await call("get", `/api/team/${staff.id}/groups`)).groups,
          ["North", "Weekend"],
        );
        assert.equal(
          data(await call("get", `/api/team/get-user/${staff.id}`)).groups,
          "North, Weekend",
        );
        assert.equal(
          (
            await call(
              "put",
              `/api/team/${staff.id}/groups`,
              { groups: [] },
              staffToken,
            )
          ).status,
          403,
        );
        const entry = await call(
          "post",
          `/api/team/${staff.id}/feed`,
          { kind: "CONCERN", body: "Test follow-up" },
          staffToken,
        );
        assert.equal(entry.status, 201);
        const entryId = data(entry).id;
        assert.equal(
          (
            await call(
              "get",
              `/api/team/${staff.id}/feed`,
              undefined,
              otherToken,
            )
          ).status,
          404,
        );
        assert.equal(
          (
            await call(
              "post",
              `/api/team/${staff.id}/feed/${entryId}/resolve`,
              {},
              staffToken,
            )
          ).status,
          403,
        );
        assert.equal(
          (
            await call(
              "post",
              `/api/team/${staff.id}/feed/${entryId}/resolve`,
              {},
            )
          ).status,
          200,
        );
        const feed = await call(
          "get",
          `/api/team/${staff.id}/feed?kind=CONCERN`,
        );
        assert.equal(data(feed).entries[0].status, "RESOLVED");
        assert.equal(
          (
            await call("post", `/api/team/${staff.id}/feed`, {
              kind: "NOTE",
              body: " ",
            })
          ).status,
          400,
        );
      },
    );
    await t.test('Time off holiday years, booking history, cancellation and permissions',async()=>{
      const path='/api/team/'+staff.id+'/time-off?year=2026';
      assert.equal(data(await call('get',path)).settings,null);
      assert.equal((await call('put','/api/team/holiday-year',{month:2,day:29})).status,400);
      assert.equal((await call('put','/api/team/holiday-year',{month:4,day:1},staffToken)).status,403);
      assert.equal((await call('put','/api/team/holiday-year',{month:4,day:1})).status,200);
      let result=data(await call('get',path));assert.equal(result.start,'2026-04-01');assert.equal(result.end,'2027-03-31');
      assert.equal((await call('get',path,undefined,otherToken)).status,404);
      assert.equal((await call('get','/api/team/'+admin.id+'/time-off',undefined,staffToken)).status,403);
      const booking={startDate:'2027-03-30',endDate:'2027-04-02',startTime:'00:00:00',endTime:'23:59:59',type:'ANNUAL_LEAVE',reason:'Test holiday'};
      let r=await call('post','/api/team-absence/create/'+staff.id,booking);assert.equal(r.status,200,r.body.message);const absence=data(r);
      assert.equal((await call('post','/api/team-absence/create/'+staff.id,booking)).status,409);
      assert.equal(data(await call('get',path)).entries.filter(x=>x.id===absence.id).length,1);
      assert.equal(data(await call('get','/api/team/'+staff.id+'/time-off?year=2027')).entries.filter(x=>x.id===absence.id).length,1);
      assert.equal((await call('delete','/api/team-absence/delete/'+absence.id,undefined,staffToken)).status,403);
      assert.equal((await call('delete','/api/team-absence/delete/'+absence.id)).status,200);
      result=data(await call('get',path));assert.equal(result.entries.find(x=>x.id===absence.id).status,'CANCELLED');
      assert.ok((await repo.get('TeamAbsenceEntity',absence.id)).deletedAt);
      assert.equal((await call('post','/api/team-absence/create/'+staff.id,booking)).status,200);
      assert.equal((await call('post','/api/team-absence/create/'+staff.id,{...booking,startDate:'2027-02-30'})).status,400);
    });
  } finally {
    await db.close();
  }
});
