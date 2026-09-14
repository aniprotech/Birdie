# Task Planner update

The client Task Planner now provides a searchable shared task library, with 135 starter options across Environmental, Social support, Personal care, Administrative, Everyday activities, Nutrition and hydration, Medical, Psychological and Other.

## Using it

Open the app at http://127.0.0.1:5173, select a client, then Task Planner → Add task. Search or select a category, then choose Use +. Set client instructions, essential status, cadence, sessions or daily occurrence count, and start/end dates.

The selected task opens in a right-side drawer matching the supplied reference: notes, essential checkbox, Daily/Weekly/Custom buttons, Anytime/Sessions choices, session buttons, Starts, and Never/On end-date choices. Cancel and Save task stay in a fixed footer. For a one-off task, choose On and use the start date as the end date. The essential checkbox marks the task; automatic alerts for uncompleted tasks are not part of this update.

Choose Create reusable task to add a task name, category and general instructions. Staff can also create a new category. Saved organisation tasks become available to other staff in the same organisation. Personal information belongs in the client-specific instructions rather than the shared library.

## Permissions and persistence

- Admins and carers can create reusable library tasks. Admins can manage organisation tasks; carers can edit/archive tasks they created. Built-in presets cannot be changed or archived.
- Carers can add schedules to clients they are assigned to view, and manage schedules they created. Admins can manage all client schedules in their organisation.
- Existing client task names, categories and instructions are preserved when a reusable library task changes.
- Archiving hides a reusable task from new selections. Existing schedules remain. Restore makes it selectable again.
- Changes persist in PostgreSQL, with stale-edit protection and the existing request audit log.
- Daily, weekly and custom day/week recurrence are supported. Any-time tasks allow 1–24 daily occurrences; specific sessions run once per selected session. Scheduling uses UK dates.

## Verification

The existing backend suite passed (41 checks), plus six new task-library checks covering presets, category/task sharing, organisation isolation, carer permissions, scheduling validation, snapshots, stale edits, archive and restore. The frontend production build and targeted planner lint passed.

Browser verification screenshots are saved in `task-planner-checks`. A clearly labelled dummy task is retained for reviewing the flow without copying personal details from the supplied reference screenshots.

## Scope

The starter list includes visible reference task names and additional general options; it is not a copy of Birdie's full 1,153-item catalogue. The organisation can extend it through the app. Clinical task titles do not include treatment or device procedure instructions.

This update manages task templates and client schedules. Automatic generation of per-visit activity records from recurring task schedules remains a separate integration.
