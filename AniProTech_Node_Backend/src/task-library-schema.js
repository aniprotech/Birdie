import { createHash } from "node:crypto";
export const taskPresets = {
  Environmental: [
    "12-hour sit-in support",
    "Access building entrance",
    "Access house via key safe",
    "Apply carbon dioxide (CO2) sensor",
    "Arrange transport",
    "Ask if further assistance is required",
    "Assist making phone calls",
    "Assist to cover/uncover mobility scooter",
    "Assist to empty / load dishwasher",
    "Assist to empty the vacuum",
    "Assist to evacuate the building in case of emergency",
    "Assist to feed the birds",
    "Assist to feed the dog",
    "Assist to fill kettle",
    "Assist to light fire",
    "Assist to open windows",
    "Assist to prepare hospital bag",
    "Assist to set alarm",
    "Assist to take item off charge",
    "Assist with cleaning / unblocking drains",
    "Assist with cleaning windows",
    "Assist with drying laundry",
    "Assist with gardening",
    "Assist with laundry",
    "Assist with light cleaning duties",
    "Assist with pet care",
    "Assist with plant care",
    "Assist with reading letters",
    "Assist with special request",
    "Assist with specialist equipment",
    "Assist with using tablet",
    "Assist with washing dishes",
    "Blinds up/down",
    "Bring bins in",
    "Bumpers on bedrails to be secured",
    "Change bedding",
    "Change towels and flannels",
    "Charge hearing aid",
    "Charge hoist batteries",
    "Charge mobility scooter",
    "Charge smart home device",
    "Check and empty moisture traps in the home",
    "Check call",
    "Check cigarettes are fully extinguished",
    "Check condition of bed rails",
    "Check door sensor",
    "Check electric heater",
    "Check emergency equipment",
    "Check equipment has been safety checked",
    "Check equipment service date",
    "Check lighting",
    "Clear walkways",
    "Close and secure windows",
    "Dispose of PPE",
    "Ensure moving and handling equipment is to hand",
    "Lock property on leaving",
    "Put on PPE according to guidelines",
    "Take rubbish out",
  ],
  "Social support": [
    "Offer companionship",
    "Support a conversation",
    "Support contact with family",
    "Support community activities",
    "Accompany to an appointment",
    "Support religious or cultural activities",
    "Read together",
    "Support a chosen hobby",
    "Assist with video calls",
    "Support correspondence",
  ],
  "Personal care": [
    "Assist with washing",
    "Assist with showering",
    "Assist with dressing",
    "Assist with removing footwear",
    "Assist with mouth care",
    "Assist with hair care",
    "Assist with shaving",
    "Assist with toileting",
    "Check and change nappy",
    "Support changing continence pads",
    "Support hand hygiene",
    "Support skin care according to the care plan",
  ],
  Administrative: [
    "Record visit notes",
    "Write in your notes who is present during the visit",
    "Review client instructions",
    "Complete a handover",
    "Report a concern",
    "Check appointment details",
    "Record a change in needs",
    "Update contact details with permission",
  ],
  "Everyday activities": [
    "Assist with shopping",
    "Assist with preparing clothes",
    "Assist with using the telephone",
    "Support getting ready for the day",
    "Support bedtime routine",
    "Assist with reading",
    "Support use of television or radio",
    "Assist with household organisation",
    "Support a chosen daily activity",
    "Support use of mobility equipment according to the care plan",
  ],
  "Nutrition and hydration": [
    "Prepare breakfast",
    "Prepare lunch",
    "Prepare evening meal",
    "Prepare a snack",
    "Offer a drink",
    "Record fluid intake",
    "Record food intake",
    "Support eating according to the care plan",
    "Check food dates",
    "Assist with a food shopping list",
  ],
  Medical: [
    "Assist to change PEG feeding syringe",
    "Change bacterial filter",
    "Change giving set",
    "Change inner tube",
    "Change tubing on cough assist machine",
    "Change ventilator circuit",
    "Check and record ventilator settings",
    "Check catheter bag supplies",
    "Check contents of emergency tracheostomy box",
    "Record an observation according to the care plan",
    "Support a healthcare appointment",
    "Check prescribed equipment supplies",
  ],
  Psychological: [
    "Check on wellbeing",
    "Offer reassurance",
    "Support orientation",
    "Support a calming activity",
    "Record mood observations",
    "Support with cognitive needs",
    "Support a preferred routine",
    "Record changes in behaviour",
  ],
  Other: [
    "Check client vehicle",
    "Complete the vehicle checklist",
    "Escort to / from alternative location",
    "Escort to/from place of work",
    "Return parking permit",
    "Support client during transport",
    "Transport to/from activities",
  ],
};
const stableId = (value) => {
  const h = createHash("sha256")
    .update("aniprotech-task-library:" + value)
    .digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
};
export async function initializeTaskLibrary(db) {
  await db.query(
    `ALTER TABLE client_task_categories ADD COLUMN IF NOT EXISTS agency_id uuid, ADD COLUMN IF NOT EXISTS created_by uuid`,
  );
  await db.query(`ALTER TABLE client_tasks ADD COLUMN IF NOT EXISTS agency_id uuid, ADD COLUMN IF NOT EXISTS created_by uuid,
    ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false, ADD COLUMN IF NOT EXISTS revision integer NOT NULL DEFAULT 1`);
  await db.query(`ALTER TABLE client_task_plans ADD COLUMN IF NOT EXISTS task_name_snapshot text, ADD COLUMN IF NOT EXISTS category_name_snapshot text,
    ADD COLUMN IF NOT EXISTS times_per_day integer NOT NULL DEFAULT 1, ADD COLUMN IF NOT EXISTS revision integer NOT NULL DEFAULT 1`);
  await db.query(
    "CREATE INDEX IF NOT EXISTS node_task_library_agency ON client_tasks(agency_id,archived)",
  );
  await db.query(
    "ALTER TABLE client_tasks ALTER COLUMN archived SET DEFAULT false, ALTER COLUMN revision SET DEFAULT 1",
  );
  await db.query(
    "UPDATE client_tasks SET archived=COALESCE(archived,false),revision=COALESCE(revision,1) WHERE archived IS NULL OR revision IS NULL",
  );
  await db.query(
    "ALTER TABLE client_task_plans ALTER COLUMN times_per_day SET DEFAULT 1, ALTER COLUMN revision SET DEFAULT 1",
  );
  await db.query(
    "UPDATE client_task_plans SET times_per_day=COALESCE(times_per_day,1),revision=COALESCE(revision,1) WHERE times_per_day IS NULL OR revision IS NULL",
  );
  // Serialize seeding with custom library writes, including when no tasks exist yet.
  await db.query(
    "LOCK TABLE client_task_categories IN SHARE ROW EXCLUSIVE MODE",
  );
  for (const [name, titles] of Object.entries(taskPresets)) {
    let category = (
      await db.query(
        "SELECT id FROM client_task_categories WHERE agency_id IS NULL AND lower(name)=lower($1) LIMIT 1",
        [name],
      )
    ).rows[0];
    if (!category) {
      category = { id: stableId("category:" + name) };
      await db.query(
        "INSERT INTO client_task_categories(id,name,description) VALUES($1,$2,$3)",
        [category.id, name, "Built-in task category"],
      );
    }
    for (const title of titles) {
      if (
        (
          await db.query(
            "SELECT id FROM client_tasks WHERE agency_id IS NULL AND category_id=$1 AND lower(name)=lower($2) LIMIT 1",
            [category.id, title],
          )
        ).rows.length
      )
        continue;
      await db.query(
        "INSERT INTO client_tasks(id,category_id,name,description) VALUES($1,$2,$3,$4)",
        [stableId(name + ":" + title), category.id, title, ""],
      );
    }
  }
}
