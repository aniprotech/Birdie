import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { _get } from "../../utils/ApiService";
import { buttonClass, downloadCsv, inputClass } from "../../components/Operations/common";

const unwrap = (response) => response.data.results.data;
const ratio = (a, b) => b ? Math.round(100 * a / b) : 0;
const sum = (items, key) => items.reduce((total, item) => total + Number(item[key] || 0), 0);
const unique = (items, key) => new Set(items.map((item) => item[key]).filter(Boolean)).size;
const weekOf = (date) => {
    const day = new Date(`${date}T12:00:00Z`);
    day.setUTCDate(day.getUTCDate() - (day.getUTCDay() + 6) % 7);
    return day.toISOString().slice(0, 10);
};

const groups = [
    { title: "Care delivery", description: "Visits, time delivered and punctuality", reports: [
        ["reported", "Completed visit reports", "Completed visits recorded in Caremonitor"],
        ["punctual", "Visit punctuality", "Check-ins within the selected grace period"],
        ["fulfilled", "Visit fulfilment", "Completed visits lasting at least 75% of plan"],
        ["hours", "Hours delivered", "Recorded care time from check-in to check-out"],
        ["longer", "Longer planned visits", "Visits scheduled for 45 minutes or longer"],
        ["consistent", "Consistent care", "Clients seen by six or fewer carers"],
        ["people", "People with reported visits", "Clients and carers with completed visits"],
        ["secure", "Secure check-in and out", "Location-verified attendance events"],
    ] },
    { title: "Care records", description: "Activities, observations, notes and eMAR", reports: [
        ["activities", "Care activities completed", "Visit activities marked complete"],
        ["observations", "Client observations", "Average observations per completed visit"],
        ["notes", "Visit notes", "Completed visits with a linked note"],
        ["medication", "Medication administrations", "Visit eMAR records by outcome"],
        ["medicationExceptions", "Medication exceptions", "Refused, omitted or unavailable outcomes"],
    ] },
    { title: "Management", description: "Alerts and weekly service trends", reports: [
        ["alerts", "Alerts raised", "Client alerts raised in the selected period"],
        ["openAlerts", "Open alerts", "Raised alerts still open"],
        ["clients", "Care delivery by client", "Completed visits by client"],
        ["carers", "Care delivery by carer", "Completed visits by carer"],
        ["weekly", "Weekly care delivery", "Completed visits by week"],
    ] },
];

const pending = [
    ["Clinical history", "Risk and Waterlow score changes need versioned assessment records before trends can be calculated."],
    ["Quality score", "Birdie's Q-Score is proprietary. Caremonitor needs an approved scoring formula and auditable inputs."],
    ["Provider Information Return", "Regulatory return questions need verified eligibility, time periods and a review workflow."],
    ["Scheduled task completion", "The current visit activity records do not yet prove every expected task or medication dose."],
    ["Branch and region", "A verified organisation hierarchy is needed before branch or regional comparisons can be offered."],
];

function measure(key, visits, alerts, graceMinutes) {
    const eligible = visits.filter((v) => ["SCHEDULED", "IN_PROGRESS", "COMPLETED"].includes(v.status));
    const completed = eligible.filter((v) => v.status === "COMPLETED");
    const punctual = completed.filter((v) => v.actualStart && new Date(v.actualStart) - new Date(v.scheduledStart) <= graceMinutes * 60000);
    const fulfilled = completed.filter((v) => v.actualMinutes !== null && v.plannedMinutes > 0 && v.actualMinutes >= v.plannedMinutes * 0.75);
    switch (key) {
    case "reported": case "clients": case "carers": case "weekly": return { value: completed.length, unit: "visits", detail: `${ratio(completed.length, eligible.length)}% of scheduled visits` };
    case "punctual": return { value: completed.length ? ratio(punctual.length, completed.length) : "—", unit: completed.length ? "%" : "", detail: `${punctual.length} of ${completed.length} completed visits` };
    case "fulfilled": return { value: ratio(fulfilled.length, completed.length), unit: "%", detail: `${fulfilled.length} of ${completed.length} completed visits` };
    case "hours": return { value: (sum(completed, "actualMinutes") / 60).toFixed(1), unit: "hours", detail: `${(sum(eligible, "plannedMinutes") / 60).toFixed(1)} planned hours` };
    case "longer": return { value: ratio(eligible.filter((v) => v.plannedMinutes >= 45).length, eligible.length), unit: "%", detail: `${eligible.filter((v) => v.plannedMinutes >= 45).length} visits of at least 45 minutes` };
    case "consistent": {
        const carersByClient = new Map();
        for (const visit of completed) {
            if (!carersByClient.has(visit.clientId)) carersByClient.set(visit.clientId, new Set());
            if (visit.staffId) carersByClient.get(visit.clientId).add(visit.staffId);
        }
        const consistent = [...carersByClient.values()].filter((carers) => carers.size > 0 && carers.size <= 6).length;
        return { value: ratio(consistent, carersByClient.size), unit: "%", detail: `${consistent} of ${carersByClient.size} visited clients` };
    }
    case "people": return { value: unique(completed, "clientId"), unit: "clients", detail: `${unique(completed, "staffId")} carers recorded visits` };
    case "secure": {
        const verified = sum(eligible, "verifiedEvents"), outside = sum(eligible, "outsideEvents");
        return { value: verified + outside ? ratio(verified, verified + outside) : "—", unit: verified + outside ? "%" : "", detail: `${verified} in-radius; ${outside} outside; ${sum(eligible, "unverifiedEvents")} unknown` };
    }
    case "activities": return { value: sum(eligible, "completedActivities"), unit: "activities", detail: `${sum(eligible, "activities")} visit-linked activities recorded` };
    case "observations": return { value: completed.length ? (sum(completed, "observations") / completed.length).toFixed(1) : "0.0", unit: "per visit", detail: `${sum(completed, "observations")} observations` };
    case "notes": return { value: ratio(completed.filter((v) => v.notes > 0).length, completed.length), unit: "%", detail: `${completed.filter((v) => v.notes > 0).length} completed visits with notes` };
    case "medication": return { value: sum(eligible, "administrations"), unit: "records", detail: `${sum(eligible, "administered")} administered; ${sum(eligible, "medicationExceptions")} exceptions` };
    case "medicationExceptions": return { value: sum(eligible, "medicationExceptions"), unit: "records", detail: "Refused, omitted or unavailable eMAR outcomes" };
    case "alerts": return { value: alerts.length, unit: "alerts", detail: `${alerts.filter((a) => a.status === "OPEN").length} still open` };
    case "openAlerts": return { value: alerts.filter((a) => a.status === "OPEN").length, unit: "alerts", detail: `${alerts.length} raised in the selected period` };
    default: return { value: 0, unit: "", detail: "" };
    }
}

function Chart({ data }) {
    const max = Math.max(1, ...data.map((row) => Number(row.value) || 0));
    return <div className="space-y-3">{data.map((row) => <div key={row.label} className="grid grid-cols-[8rem_1fr_4rem] items-center gap-3 text-sm"><span className="truncate text-slate-600" title={row.label}>{row.label}</span><div className="h-5 rounded bg-slate-100"><div className="h-5 rounded bg-teal-600" style={{ width: `${Math.max(0, Number(row.value) || 0) / max * 100}%` }} /></div><strong className="text-right text-slate-900">{row.value}</strong></div>)}{!data.length && <p className="text-sm text-slate-500">No records in this period.</p>}</div>;
}

export default function ReportLibrary({ from, to, graceMinutes, reportId }) {
    const [data, setData] = useState(null), [error, setError] = useState(""), [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const selected = reportId || "reported";
    useEffect(() => {
        if (!reportId) return undefined;
        let active = true;
        setLoading(true); setError("");
        _get("/api/reports/library", { params: { from, to } }).then((response) => { if (active) setData(unwrap(response)); })
            .catch((reason) => { if (active) setError(reason.response?.data?.message || "Unable to load report library"); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [from, to, reportId]);
    const reports = groups.flatMap((group) => group.reports);
    const report = reports.find(([key]) => key === selected);
    const visits = useMemo(() => (data?.visits || []).filter((v) => `${v.clientName} ${v.staffName}`.toLowerCase().includes(search.toLowerCase())), [data, search]);
    const alerts = useMemo(() => (data?.alerts || []).filter((a) => `${a.clientName} ${a.title}`.toLowerCase().includes(search.toLowerCase())), [data, search]);
    const isAlertReport = ["alerts", "openAlerts"].includes(selected);
    const detailVisits = useMemo(() => visits.filter((v) => {
        if (selected === "reported" || selected === "clients" || selected === "carers" || selected === "weekly" || selected === "people" || selected === "consistent" || selected === "fulfilled" || selected === "punctual") return v.status === "COMPLETED";
        if (selected === "longer") return v.plannedMinutes >= 45;
        if (selected === "hours") return v.status === "COMPLETED" && v.actualMinutes !== null;
        if (selected === "secure") return v.verifiedEvents + v.outsideEvents + v.unverifiedEvents > 0;
        if (selected === "activities") return v.activities > 0;
        if (selected === "observations") return v.observations > 0;
        if (selected === "notes") return v.notes > 0;
        if (selected === "medication") return v.administrations > 0;
        if (selected === "medicationExceptions") return v.medicationExceptions > 0;
        return true;
    }), [visits, selected]);
    const detailAlerts = selected === "openAlerts" ? alerts.filter((a) => a.status === "OPEN") : alerts;
    const current = measure(selected, visits, alerts, graceMinutes);
    const weekly = useMemo(() => {
        const buckets = new Map();
        for (const visit of visits) {
            const key = weekOf(visit.date);
            if (!buckets.has(key)) buckets.set(key, []);
            buckets.get(key).push(visit);
        }
        const alertBuckets = new Map();
        for (const alert of alerts) {
            const londonDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(alert.createdAt));
            const key = weekOf(londonDate);
            if (!alertBuckets.has(key)) alertBuckets.set(key, []);
            alertBuckets.get(key).push(alert);
        }
        return [...new Set([...buckets.keys(), ...alertBuckets.keys()])].sort().map((key) => ({ label: key, value: measure(selected, buckets.get(key) || [], alertBuckets.get(key) || [], graceMinutes).value }));
    }, [visits, alerts, selected, graceMinutes]);
    const breakdown = useMemo(() => {
        if (selected === "alerts" || selected === "openAlerts") {
            const byClient = new Map();
            for (const alert of alerts) {
                if (!byClient.has(alert.clientId)) byClient.set(alert.clientId, { label: alert.clientName || "Unknown", alerts: [] });
                byClient.get(alert.clientId).alerts.push(alert);
            }
            return [...byClient.values()].map((item) => ({ ...item, result: measure(selected, [], item.alerts, graceMinutes) }))
                .sort((a, b) => Number(b.result.value) - Number(a.result.value) || a.label.localeCompare(b.label)).slice(0, 25);
        }
        const key = selected === "carers" ? "staffId" : "clientId";
        const label = selected === "carers" ? "staffName" : "clientName";
        const map = new Map();
        for (const visit of visits) {
            if (!visit[key]) continue;
            if (!map.has(visit[key])) map.set(visit[key], { id: visit[key], label: visit[label] || "Unknown", visits: [] });
            map.get(visit[key]).visits.push(visit);
        }
        return [...map.values()].map((item) => ({ ...item, result: measure(selected, item.visits, alerts.filter((a) => a.clientId === item.id), graceMinutes) }))
            .sort((a, b) => Number(b.result.value) - Number(a.result.value) || a.label.localeCompare(b.label)).slice(0, 25);
    }, [visits, alerts, selected, graceMinutes]);
    const exportRows = () => isAlertReport
        ? downloadCsv(`caremonitor-${selected}-${from}-${to}.csv`, [["Raised", "Client", "Alert", "Category", "Status"], ...detailAlerts.map((a) => [a.createdAt, a.clientName, a.title, a.category, a.status])])
        : downloadCsv(`caremonitor-${selected}-${from}-${to}.csv`, [["Date", "Client", "Carer", "Visit", "Status", "Planned minutes", "Actual minutes", "Activities completed", "Observations", "Notes", "Medication administrations"], ...detailVisits.map((v) => [v.date, v.clientName, v.staffName, v.title, v.status, v.plannedMinutes, v.actualMinutes ?? "", v.completedActivities, v.observations, v.notes, v.administrations])]);
    if (!reportId) return <div className="space-y-6">
        <div className="rounded-xl border border-teal-100 bg-teal-50 p-5"><h2 className="text-xl font-semibold text-slate-900">Caremonitor report library</h2><p className="mt-1 text-sm text-slate-600">Care delivery and quality reports calculated from your organisation’s own records. Open a card for its charts, records and export. All figures use the date range above.</p></div>
        {groups.map((group) => <section key={group.title}><h3 className="text-lg font-semibold text-slate-900">{group.title}</h3><p className="mb-3 text-sm text-slate-500">{group.description}</p><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{group.reports.map(([key, title, description]) => <Link key={key} to={`/admin/reports/${key}?${new URLSearchParams({ from, to, graceMinutes: String(graceMinutes) })}`} className="rounded-xl border bg-white p-4 text-left transition-colors hover:border-teal-500 hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"><span className="text-sm font-semibold text-slate-900">{title}</span><span className="mt-2 block text-xs text-slate-500">{description}</span><span className="mt-3 block text-xs font-medium text-teal-800">Open report →</span></Link>)}</div></section>)}
        <section className="rounded-xl border bg-slate-50 p-5"><h3 className="font-semibold text-slate-900">Reports needing additional source data or approved definitions</h3><div className="mt-3 grid gap-3 md:grid-cols-2">{pending.map(([title, reason]) => <div key={title} className="rounded-lg border bg-white p-3"><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs text-slate-600">{reason}</p></div>)}</div></section>
    </div>;
    if (!report) return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-900">Report not found. <Link className="underline" to="/admin/reports">Return to all reports</Link>.</div>;
    return <div className="space-y-6">
        <section className="space-y-5 rounded-xl border bg-white p-5" aria-live="polite"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Live report</p><h2 className="text-xl font-semibold text-slate-900">{report[1]}</h2><p className="mt-1 text-sm text-slate-600">{report[2]}</p></div><button className={buttonClass} disabled={!data || data.truncated} onClick={exportRows}>Export {isAlertReport ? "alerts" : "visit details"}</button></div>
            {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}{loading && <p className="text-sm text-slate-600">Loading report…</p>}
            {data && !loading && !error && <><div className="flex flex-wrap items-center gap-4"><div className="min-w-52 rounded-xl bg-slate-50 p-4"><p className="text-3xl font-semibold text-slate-900">{current.value}<span className="ml-2 text-sm font-normal text-slate-500">{current.unit}</span></p><p className="mt-1 text-xs text-slate-600">{current.detail}</p></div><label className="text-sm text-slate-700">Find client or carer<input className={`${inputClass} mt-1`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this report" /></label></div>
                {data.truncated && <p className="rounded bg-amber-50 p-3 text-sm text-amber-900">More than 10,000 source records match this period. Figures are incomplete; choose a shorter date range before using or exporting this report.</p>}
                <div className="grid gap-5 lg:grid-cols-2"><div className="rounded-xl border p-4"><h4 className="mb-4 font-semibold">By week</h4><Chart data={weekly} /></div><div className="rounded-xl border p-4"><h4 className="mb-4 font-semibold">{selected === "carers" ? "By carer" : "By client"}</h4><Chart data={breakdown.map((item) => ({ label: item.label, value: item.result.value }))} /></div></div>
                {isAlertReport ? <div className="overflow-x-auto rounded-xl border"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{["Raised", "Client", "Alert", "Category", "Status", "Record"].map((header) => <th key={header} className="p-3">{header}</th>)}</tr></thead><tbody>{detailAlerts.slice(0, 250).map((a) => <tr key={a.id} className="border-t"><td className="p-3">{new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", dateStyle: "medium", timeStyle: "short" }).format(new Date(a.createdAt))}</td><td className="p-3">{a.clientName}</td><td className="p-3">{a.title}</td><td className="p-3">{a.category || "—"}</td><td className="p-3">{a.status}</td><td className="p-3"><Link className="font-medium text-teal-700 underline" to="/admin/inbox">Open</Link></td></tr>)}</tbody></table>{!detailAlerts.length && <p className="p-4 text-sm text-slate-500">No alerts match this period and search.</p>}{detailAlerts.length > 250 && <p className="border-t p-3 text-xs text-slate-500">Showing the first 250 alerts. Export for the full detail.</p>}</div> : <div className="overflow-x-auto rounded-xl border"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{["Date", "Client", "Carer", "Visit", "Status", "Planned", "Actual", "Activities", "Observations", "Notes", "eMAR", "Record"].map((header) => <th key={header} className="whitespace-nowrap p-3">{header}</th>)}</tr></thead><tbody>{detailVisits.slice(0, 250).map((v) => <tr key={v.id} className="border-t"><td className="p-3">{v.date}</td><td className="p-3">{v.clientName}</td><td className="p-3">{v.staffName || "Unassigned"}</td><td className="p-3">{v.title}</td><td className="p-3">{v.status.replaceAll("_", " ")}</td><td className="p-3">{v.plannedMinutes}m</td><td className="p-3">{v.actualMinutes === null ? "—" : `${v.actualMinutes}m`}</td><td className="p-3">{v.completedActivities}</td><td className="p-3">{v.observations}</td><td className="p-3">{v.notes}</td><td className="p-3">{v.administrations}</td><td className="p-3"><Link className="font-medium text-teal-700 underline" to={`/admin/clients/${v.clientId}/visits?date=${v.date}&visit=${v.id}`}>Open</Link></td></tr>)}</tbody></table>{!detailVisits.length && <p className="p-4 text-sm text-slate-500">No visits match this report and search.</p>}{detailVisits.length > 250 && <p className="border-t p-3 text-xs text-slate-500">Showing the first 250 visits. Export the full selected period for detail.</p>}</div>}
                <p className="text-xs text-slate-500">Definitions: {Object.values(data.definitions).join(" · ")}</p></>}
        </section>
    </div>;
}
