import { configuration } from "../src/config.js";
import { openDatabase, initializeSchema } from "../src/db.js";
import { Repository } from "../src/repository.js";
const config = configuration();
if (config.production || config.driver !== "pglite")
  throw new Error(
    "Demo seeding is restricted to local PGlite development databases.",
  );
const db = await openDatabase(config),
  repo = new Repository(db);
try {
  await initializeSchema(db);
  await db.transaction(async () => {
    const agencyId = "10000000-0000-4000-8000-000000000001";
    for (const [id, firstName, lastName, email, role] of [
      [
        "10000000-0000-4000-8000-000000000002",
        "Demo",
        "Administrator",
        "admin@example.test",
        "ADMIN",
      ],
      [
        "10000000-0000-4000-8000-000000000003",
        "Demo",
        "Carer",
        "carer@example.test",
        "CAREGIVER",
      ],
      [
        "10000000-0000-4000-8000-000000000004",
        "Demo",
        "Client",
        "client@example.test",
        "USER",
      ],
    ])
      if (!(await repo.get("UserEntity", id)))
        await repo.save("UserEntity", {
          id,
          agencyId,
          firstName,
          lastName,
          email,
          role,
          isActive: true,
        });
    const categoryId = "10000000-0000-4000-8000-000000000005",
      taskId = "10000000-0000-4000-8000-000000000006";
    if (!(await repo.get("ClientTaskCategoryEntity", categoryId)))
      await repo.save("ClientTaskCategoryEntity", {
        id: categoryId,
        name: "Demo daily support",
        description: "Demonstration category only",
      });
    if (!(await repo.get("ClientTaskEntity", taskId)))
      await repo.save("ClientTaskEntity", {
        id: taskId,
        name: "Demo wellbeing check",
        description: "Example task for testing",
        clientTaskCategory: categoryId,
      });
    const visitId = "10000000-0000-4000-8000-000000000007";
    const addressId = "10000000-0000-4000-8000-000000000008";
    if (!(await repo.get("UserPrimaryAddressEntity", addressId)))
      await repo.save("UserPrimaryAddressEntity", {
        id: addressId,
        user: "10000000-0000-4000-8000-000000000004",
        addressType: "PERMANENT_RESIDENCE",
        addressLine1: "24 Demo Care Avenue",
        city: "Birmingham",
        postalCode: "B1 1AA",
        country: "United Kingdom",
        isPrimary: true,
        accessDetails: "Demo record only - no real door code",
        latitude: 52.4862,
        longitude: -1.8904,
        checkinRadius: 150,
      });
    const taskPlanId = "10000000-0000-4000-8000-000000000009";
    if (!(await repo.get("ClientTaskPlanEntity", taskPlanId)))
      await repo.save("ClientTaskPlanEntity", {
        id: taskPlanId,
        task: taskId,
        taskNameSnapshot: "Demo wellbeing check",
        categoryNameSnapshot: "Demo daily support",
        user: "10000000-0000-4000-8000-000000000004",
        details: "Confirm comfort, hydration and that the call bell is within reach.",
        isEssential: true,
        isAnyTime: true,
        sessions: [],
        frequency: "DAILY",
        selectedDays: [],
        startDate: "2026-01-01",
        timesPerDay: 1,
        revision: 1,
      });
    const medicationId = "10000000-0000-4000-8000-000000000010";
    if (!(await repo.get("ClientMedicationSchedulingEntity", medicationId)))
      await repo.save("ClientMedicationSchedulingEntity", {
        id: medicationId,
        user: "10000000-0000-4000-8000-000000000004",
        clientFirstName: "Demo",
        clientLastName: "Client",
        medicationName: "Demo medication - training only",
        medicationDescription: "Non-clinical dummy record",
        dose: "1 demo unit",
        route: "Follow the training MAR",
        additionalInstructions: "Do not use this record for real medication administration.",
        frequencyType: "DAILY",
        firstDoseDate: "2026-01-01",
        isStopped: false,
      });
    if (!(await db.query("SELECT id FROM node_roster_visits WHERE id=$1", [visitId])).rows.length) {
      const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
      await db.query(`INSERT INTO node_roster_visits(id,agency_id,client_id,staff_id,visit_date,start_time,end_time,title,notes,status,revision,created_by,updated_by)
        VALUES($1,$2,$3,$4,$5,'09:00','10:00','Morning wellbeing visit','Review wellbeing, hydration and the care task checklist.','SCHEDULED',1,$4,$4)`,
        [visitId, agencyId, "10000000-0000-4000-8000-000000000004", "10000000-0000-4000-8000-000000000003", date]);
    }
  });
  console.log(
    "Local demo records ready. Login email: admin@example.test. Emails are saved in the local outbox.",
  );
} finally {
  await db.close();
}
