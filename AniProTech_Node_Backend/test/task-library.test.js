import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import request from "supertest";
import { openDatabase, initializeSchema } from "../src/db.js";
import { createApp } from "../src/app.js";
import {
  taskPresets,
  initializeTaskLibrary,
} from "../src/task-library-schema.js";

test("Shared task library and client scheduling", async (t) => {
  const db = await openDatabase({ driver: "pglite", dataDir: ":memory:" });
  await initializeSchema(db);
  let mail;
  const app = createApp({
    db,
    config: {
      production: false,
      jwtSecret: "task-library-test-secret-32-characters",
      frontendUrl: "http://localhost:5173",
      corsOrigins: [],
      uploadDir: "./test-uploads",
    },
    mail: { send: async (m) => (mail = m) },
  });
  const { repo, auth } = app.locals.ctx,
    agency = randomUUID();
  const person = (name, role, agencyId = agency) =>
    repo.save("UserEntity", {
      firstName: name,
      lastName: "Test",
      email: name + "@tasks.test",
      role,
      agencyId,
      isActive: true,
    });
  const admin = await person("admin", "ADMIN"),
    carer = await person("carer", "CAREGIVER"),
    outsider = await person("outsider", "ADMIN", randomUUID()),
    client = await person("client", "USER"),
    unassigned = await person("unassigned", "USER");
  await repo.save("ClientCareTeamEntity", {
    client: client.id,
    carer: carer.id,
    viewAccess: true,
    revokeViewaccess: false,
    declineCarer: false,
  });
  const login = async (u) => {
    await auth.requestLink(u.email);
    const [email, password] = Buffer.from(
      new URL(mail.text.match(/http[^\s]+/)[0]).searchParams.get("token"),
      "base64url",
    )
      .toString()
      .split(":");
    return (await auth.exchange(email, password)).accessToken;
  };
  const at = await login(admin),
    ct = await login(carer),
    ot = await login(outsider);
  const call = (method, path, body, token = at) =>
    request(app)
      [method](path)
      .set("Authorization", "Bearer " + token)
      .send(body);
  const data = (r) => r.body.results.data;
  let category, shared, plan;
  const schedule = (taskId, userId = client.id) => ({
    taskId,
    userId,
    details: "Only this client: test instructions",
    frequency: "DAILY",
    isAnyTime: true,
    timesPerDay: 4,
    startDate: "2026-09-08",
    selectedDays: [],
    sessions: [],
  });
  try {
    await t.test(
      "Nine categories seed idempotently and search paginates",
      async () => {
        let r = await call("get", "/api/task-library");
        assert.equal(r.status, 200);
        const count = Object.values(taskPresets).flat().length;
        assert.equal(data(r).categories.length, 9);
        assert.equal(data(r).totalCount, count);
        assert.equal(data(r).tasks.length, 40);
        await db.transaction(() => initializeTaskLibrary(db));
        r = await call("get", "/api/task-library?search=key%20safe");
        assert.equal(data(r).totalCount, 1);
        assert.equal(data(r).totalLibraryCount, count);
        category = data(r).categories.find((c) => c.name === "Environmental");
      },
    );
    await t.test(
      "Carers create shared categories and reusable tasks; duplicate and tenant guards apply",
      async () => {
        let r = await call(
          "post",
          "/api/task-library/categories",
          { name: "Our routines" },
          ct,
        );
        assert.equal(r.status, 201);
        const custom = data(r);
        assert.equal(
          (
            await call("post", "/api/task-library/categories", {
              name: "OUR ROUTINES",
            })
          ).status,
          409,
        );
        r = await call(
          "post",
          "/api/task-library/tasks",
          {
            name: "Shared test task",
            categoryId: custom.id,
            description: "Reusable instructions",
          },
          ct,
        );
        assert.equal(r.status, 201);
        shared = data(r);
        assert.equal(
          (
            await call("post", "/api/task-library/tasks", {
              name: "shared TEST task",
              categoryId: custom.id,
            })
          ).status,
          409,
        );
        assert.equal(
          data(await call("get", "/api/task-library?search=Shared%20test"))
            .tasks[0].id,
          shared.id,
        );
        assert.equal(
          data(
            await call(
              "get",
              "/api/task-library?search=Shared%20test",
              undefined,
              ot,
            ),
          ).totalCount,
          0,
        );
        for (const path of [
          "/api/client-task-plan/tasks",
          "/api/client-task-plan/categories/tasks",
        ]) {
          r = await call("post", path, { searchString: "Shared test" }, ot);
          assert.equal(r.status, 200);
          assert.ok(!JSON.stringify(data(r)).includes(shared.id));
        }
        r = await call(
          "get",
          "/api/client-task-plan/categories",
          undefined,
          ot,
        );
        assert.ok(!JSON.stringify(data(r)).includes(shared.id));
        assert.equal(
          (
            await call(
              "post",
              "/api/task-library/tasks",
              { name: "Other task", categoryId: custom.id },
              ot,
            )
          ).status,
          404,
        );
      },
    );
    await t.test(
      "Carers schedule assigned clients; sessions, dates and ownership are validated",
      async () => {
        let r = await call(
          "post",
          "/api/client-task-plan/create",
          schedule(shared.id),
          ct,
        );
        assert.equal(r.status, 201, JSON.stringify(r.body));
        plan = data(r);
        assert.equal(plan.timesPerDay, 4);
        assert.equal(
          (
            await call(
              "post",
              "/api/client-task-plan/create",
              schedule(shared.id, unassigned.id),
              ct,
            )
          ).status,
          403,
        );
        assert.equal(
          (
            await call(
              "post",
              "/api/client-task-plan/create",
              schedule(shared.id),
              ot,
            )
          ).status,
          404,
        );
        for (const patch of [
          { startDate: "2026-02-30" },
          { timesPerDay: 0 },
          { frequency: "WEEKLY", selectedDays: [] },
          { isAnyTime: false, sessions: [] },
          { endDate: "2025-01-01" },
        ])
          assert.equal(
            (
              await call("post", "/api/client-task-plan/create", {
                ...schedule(shared.id),
                ...patch,
              })
            ).status,
            400,
          );
        r = await call("post", "/api/client-task-plan/create", {
          ...schedule(shared.id),
          frequency: "WEEKLY",
          selectedDays: ["MONDAY", "FRIDAY"],
          isAnyTime: false,
          sessions: ["MORNING", "EVENING"],
        });
        assert.equal(r.status, 201);
        const adminPlan = data(r);
        assert.equal(adminPlan.timesPerDay, 2);
        assert.equal(
          (
            await call(
              "put",
              `/api/client-task-plan/update/${adminPlan.id}`,
              { details: "Overwrite" },
              ct,
            )
          ).status,
          403,
        );
        assert.equal(
          (
            await call(
              "delete",
              `/api/client-task-plan/delete/${adminPlan.id}`,
              undefined,
              ct,
            )
          ).status,
          403,
        );
      },
    );
    await t.test(
      "Library edits preserve client snapshots and reject stale edits",
      async () => {
        const edit = {
          name: "Renamed shared task",
          categoryId: category.id,
          description: "New reusable wording",
          revision: shared.revision,
        };
        let r = await call(
          "put",
          `/api/task-library/tasks/${shared.id}`,
          edit,
          ct,
        );
        assert.equal(r.status, 200, JSON.stringify(r.body));
        shared = data(r);
        assert.equal(
          (await call("put", `/api/task-library/tasks/${shared.id}`, edit, ct))
            .status,
          409,
        );
        r = await call(
          "get",
          `/api/client-task-plan/getById/${plan.id}`,
          undefined,
          ct,
        );
        assert.equal(data(r).taskName, "Shared test task");
        assert.equal(data(r).categoryName, "Our routines");
        assert.equal(data(r).details, "Only this client: test instructions");
        r = await call(
          "put",
          `/api/client-task-plan/update/${plan.id}`,
          {
            ...schedule(shared.id),
            revision: plan.revision,
            details: "Updated for this client",
          },
          ct,
        );
        assert.equal(r.status, 200);
        assert.equal(data(r).taskName, "Shared test task");
        assert.equal(
          (
            await call(
              "put",
              `/api/client-task-plan/update/${plan.id}`,
              { ...schedule(shared.id), revision: plan.revision },
              ct,
            )
          ).status,
          409,
        );
      },
    );
    await t.test(
      "Archive hides reusable tasks without deleting existing schedules; restore works",
      async () => {
        let r = await call(
          "put",
          `/api/task-library/tasks/${shared.id}/archive`,
          { archived: true, revision: shared.revision },
          ct,
        );
        assert.equal(r.status, 200);
        shared = data(r);
        assert.equal(
          data(await call("get", "/api/task-library?search=Renamed"))
            .totalCount,
          0,
        );
        assert.equal(
          data(
            await call("get", "/api/task-library?search=Renamed&archived=true"),
          ).totalCount,
          1,
        );
        assert.equal(
          (
            await call(
              "post",
              "/api/client-task-plan/create",
              schedule(shared.id),
            )
          ).status,
          400,
        );
        assert.equal(
          (await call("get", `/api/client-task-plan/getById/${plan.id}`))
            .status,
          200,
        );
        r = await call("put", `/api/task-library/tasks/${shared.id}/archive`, {
          archived: false,
          revision: shared.revision,
        });
        assert.equal(r.status, 200);
        const builtin = data(
          await call("get", "/api/task-library?search=key%20safe"),
        ).tasks[0];
        assert.equal(
          (
            await call("put", `/api/task-library/tasks/${builtin.id}/archive`, {
              archived: true,
              revision: builtin.revision,
            })
          ).status,
          403,
        );
      },
    );
  } finally {
    await db.close();
  }
});
