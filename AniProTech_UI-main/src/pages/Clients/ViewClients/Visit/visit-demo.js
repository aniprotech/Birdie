export const addDays = (d, n) => new Date(Date.parse(d) + n * 86400000).toISOString().slice(0, 10);
export const londonToday = () =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
export const monday = (d) => addDays(d, -((new Date(d).getUTCDay() + 6) % 7));
export const bands = [
    ["ANYTIME", "Anytime", ""],
    ["MORNING", "Morning", "06:00 – 11:00"],
    ["LUNCH", "Lunchtime", "11:00 – 14:00"],
    ["AFTERNOON", "Afternoon", "14:00 – 18:00"],
    ["EVENING", "Evening", "18:00 – 22:00"],
    ["NIGHT", "Night", "22:00 – 06:00"],
];
export const bandFor = (t) =>
    t < "06:00" || t >= "22:00" ? "NIGHT" : t < "11:00" ? "MORNING" : t < "14:00" ? "LUNCH" : t < "18:00" ? "AFTERNOON" : "EVENING";
export function demoSchedule(week) {
    const visits = [],
        plannedTasks = [];
    for (let i = 0; i < 7; i++) {
        const date = addDays(week, i);
        for (const [j, startTime, endTime, title] of [
            [0, "07:00", "08:00", "Morning support"],
            [1, "16:00", "16:30", "Afternoon check-in"],
            [2, "19:30", "20:30", "Evening support"],
        ]) {
            const completed = i === 0 || (i === 1 && j === 0),
                draft = i === 4 && j === 1;
            visits.push({
                id: `demo-${i}-${j}`,
                date,
                startTime,
                endTime,
                title,
                notes: "Fictional demonstration visit. No care has been delivered.",
                status: completed ? "COMPLETED" : draft ? "DRAFT" : "SCHEDULED",
                staffId: draft ? null : i % 2 ? "demo-maya" : "demo-alex",
                staffName: draft ? null : i % 2 ? "Maya Taylor (demo)" : "Alex Morgan (demo)",
                plannedMinutes: j === 1 ? 30 : 60,
                actualMinutes: completed ? (j === 1 ? 32 : 61) : null,
                taskTotal: j === 1 ? 3 : 5,
                taskDone: completed ? (j === 1 ? 3 : 5) : 0,
                alerts: i === 2 && j === 0 ? 1 : 0,
                overdue: false,
                revision: 1,
                demo: true,
            });
        }
        for (const [j, name] of ["Assist with light cleaning duties", "Check on wellbeing", "Offer a drink"].entries())
            plannedTasks.push({
                id: `demo-task-${i}-${j}`,
                date,
                name,
                details: "Example task instructions for the demonstration schedule.",
                sessions: ["LUNCH"],
                timesPerDay: 1,
                essential: j === 1,
            });
    }
    return { visits, plannedTasks, canManage: false };
}
export function demoDetail(v) {
    return {
        visit: v,
        entries: [
            ...Array.from({ length: v.taskTotal }, (_, i) => ({
                id: `${v.id}-task-${i}`,
                kind: "ACTIVITY",
                title: ["Check on wellbeing", "Support the morning routine", "Offer a drink", "Check the environment", "Record visit notes"][i],
                body: "Fictional activity example.",
                status: i < v.taskDone ? "COMPLETED" : "PENDING",
                author: v.staffName || "Demo coordinator",
            })),
            ...(v.alerts
                ? [
                      {
                          id: v.id + "-alert",
                          kind: "ALERT",
                          title: "Review visit instructions",
                          body: "Demonstration alert for the office team.",
                          status: "OPEN",
                          author: "Demo coordinator",
                      },
                  ]
                : []),
            {
                id: v.id + "-note",
                kind: "NOTE",
                title: "General notes",
                body: "This is a fictional visit note for exploring the screen.",
                author: v.staffName || "Demo coordinator",
                status: "RECORDED",
            },
            {
                id: v.id + "-obs",
                kind: "OBSERVATION",
                title: "Wellbeing",
                body: "Example observation, not a real clinical record.",
                author: v.staffName || "Demo coordinator",
                status: "RECORDED",
            },
        ],
        events: [
            { id: v.id + "-event", description: "Demo visit schedule created", author: "Demo coordinator", created_at: dateInstant(v.date, "06:00") },
        ],
        addresses: [{ addressLine1: "Example address (demo)", city: "London" }],
        careTeam: [],
    };
}
const dateInstant = (date, time) => `${date}T${time}:00Z`;
