import { useEffect, useState } from "react";
import { _get } from "../../utils/ApiService";
import { Page, Field, ErrorBox, inputClass, buttonClass, londonToday, money, downloadCsv } from "../../components/Operations/common";
export default function ReportIndex() {
    const [from, setFrom] = useState(() => londonToday().slice(0, 8) + "01"),
        [to, setTo] = useState(londonToday),
        [data, setData] = useState(null),
        [error, setError] = useState(""),
        [loading, setLoading] = useState(false);
    useEffect(() => {
        let active = true;
        setLoading(true);
        setError("");
        _get("/api/reports/summary", { params: { from, to } })
            .then((r) => {
                if (active) setData(r.data.results.data);
            })
            .catch((e) => {
                if (active) setError(e.response?.data?.message || "Unable to load reports");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [from, to]);
    const completed = data?.byStatus.find((s) => s.status === "COMPLETED") || { visits: 0, minutes: 0 };
    const total = data?.byStatus.filter((s) => s.status !== "CANCELLED").reduce((n, s) => n + s.visits, 0) || 0;
    return (
        <Page
            title="Reporting"
            description="Visit delivery, staff workload and financial document summaries. Schedule dates use Europe/London."
        >
            <div className="flex flex-wrap items-end gap-3">
                <Field label="From">
                    <input
                        className={inputClass}
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                    />
                </Field>
                <Field label="To">
                    <input
                        className={inputClass}
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                    />
                </Field>
                {data && (
                    <button
                        className={buttonClass}
                        onClick={() =>
                            downloadCsv(`staff-report-${from}-${to}.csv`, [
                                ["Staff", "Visits", "Completed", "Completed scheduled hours"],
                                ...data.staff.map((s) => [s.name, s.visits, s.completed, (s.completedMinutes / 60).toFixed(2)]),
                            ])
                        }
                    >
                        Export staff report
                    </button>
                )}
            </div>
            <ErrorBox error={error} />
            {loading ? (
                <p>Loading reports...</p>
            ) : (
                data &&
                !error && (
                    <>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {[
                                ["Visits (excluding cancelled)", total],
                                ["Completed visits", completed.visits],
                                ["Completed scheduled hours", (completed.minutes / 60).toFixed(1)],
                                ["Completion rate", total ? Math.round((completed.visits / total) * 100) + "%" : "0%"],
                            ].map(([k, v]) => (
                                <div
                                    className="rounded-xl border bg-white p-4"
                                    key={k}
                                >
                                    <p className="text-xs text-gray-500">{k}</p>
                                    <p className="mt-2 text-2xl font-semibold">{v}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-gray-500">
                            Current active people: {data.people.clients} clients and {data.people.staff} staff. These counts reflect current status,
                            not historical headcount.
                        </p>
                        <div className="grid gap-5 lg:grid-cols-2">
                            <section className="space-y-4 rounded-xl border bg-white p-5">
                                <h2 className="font-semibold">Visits by status</h2>
                                {data.byStatus.map((s) => (
                                    <div key={s.status}>
                                        <div className="flex justify-between text-sm">
                                            <span>{s.status.replaceAll("_", " ")}</span>
                                            <span>{s.visits}</span>
                                        </div>
                                        <div className="mt-1 h-3 rounded bg-gray-100">
                                            <div
                                                className="h-3 rounded bg-cyan-600"
                                                style={{ width: (s.visits / Math.max(1, ...data.byStatus.map((s) => s.visits))) * 100 + "%" }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {!data.byStatus.length && <p className="text-sm text-gray-500">No visits in this period.</p>}
                            </section>
                            <section className="rounded-xl border bg-white p-5">
                                <h2 className="mb-4 font-semibold">Financial documents covering this period</h2>
                                <p className="mb-3 text-xs text-gray-500">
                                    Full document totals where the billing period overlaps these dates. Drafts and voided documents are shown
                                    separately; these are not bank balances.
                                </p>
                                {data.money.map((m, i) => (
                                    <div
                                        key={i}
                                        className="flex justify-between border-t py-3 text-sm"
                                    >
                                        <span>
                                            {m.kind === "INVOICE" ? "Invoices" : "Staff pay"} · {m.status} ({m.documents})
                                        </span>
                                        <strong>{money(m.totalPence)}</strong>
                                    </div>
                                ))}
                                {!data.money.length && <p className="text-sm text-gray-500">No financial documents yet.</p>}
                            </section>
                        </div>
                        <section className="overflow-auto rounded-xl border bg-white p-5">
                            <h2 className="mb-3 font-semibold">Staff workload</h2>
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr>
                                        {["Staff", "Visits", "Completed", "Completed scheduled hours"].map((h) => (
                                            <th
                                                key={h}
                                                className="p-3"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.staff.map((s) => (
                                        <tr
                                            className="border-t"
                                            key={s.id}
                                        >
                                            <td className="p-3">{s.name}</td>
                                            <td className="p-3">{s.visits}</td>
                                            <td className="p-3">{s.completed}</td>
                                            <td className="p-3">{(s.completedMinutes / 60).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {!data.staff.length && <p className="p-5 text-gray-500">No assigned visits in this period.</p>}
                        </section>
                        <section className="overflow-auto rounded-xl border bg-white p-5">
                            <h2 className="mb-3 font-semibold">Daily delivery</h2>
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr>
                                        <th className="p-3">Date</th>
                                        <th className="p-3">Visits</th>
                                        <th className="p-3">Completed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.daily.map((d) => (
                                        <tr
                                            key={d.date}
                                            className="border-t"
                                        >
                                            <td className="p-3">{d.date}</td>
                                            <td className="p-3">{d.visits}</td>
                                            <td className="p-3">{d.completed}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {!data.daily.length && <p className="p-5 text-gray-500">No daily data in this period.</p>}
                        </section>
                    </>
                )
            )}
        </Page>
    );
}
