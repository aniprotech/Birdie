import { useEffect, useState } from "react";
import { _get, _post } from "../../utils/ApiService";
import { Page, Field, ErrorBox, inputClass, buttonClass, londonToday, money, downloadCsv } from "../../components/Operations/common";
export default function FinanceWorkspace({ initialTab = "INVOICE" }) {
    const [tab, setTab] = useState(initialTab),
        [people, setPeople] = useState([]),
        [rates, setRates] = useState([]),
        [documents, setDocuments] = useState([]);
    const [from, setFrom] = useState(() => londonToday().slice(0, 8) + "01"),
        [to, setTo] = useState(londonToday),
        [recipient, setRecipient] = useState("");
    const [preview, setPreview] = useState(null),
        [detail, setDetail] = useState(null),
        [error, setError] = useState(""),
        [busy, setBusy] = useState(false),
        [reload, setReload] = useState(0);
    const [rate, setRate] = useState({ userId: "", kind: "BILLING", effectiveFrom: londonToday(), amount: "" });
    useEffect(() => {
        let active = true;
        setError("");
        Promise.all([
            _get("/api/finance/options"),
            _get("/api/finance/rates"),
            _get("/api/finance/documents", { params: { from, to, kind: tab === "RATES" ? "INVOICE" : tab } }),
        ])
            .then(([o, r, d]) => {
                if (active) {
                    setPeople(o.data.results.data.people);
                    setRates(r.data.results.data);
                    setDocuments(d.data.results.data);
                }
            })
            .catch((e) => {
                if (active) setError(e.response?.data?.message || "Unable to load finance");
            });
        return () => {
            active = false;
        };
    }, [tab, from, to, reload]);
    async function run(fn) {
        setBusy(true);
        setError("");
        try {
            await fn();
        } catch (e) {
            setError(e.response?.data?.message || "Unable to complete this action");
        } finally {
            setBusy(false);
        }
    }
    const show = (id) => run(async () => setDetail((await _get(`/api/finance/documents/${id}`)).data.results.data));
    async function saveRate(e) {
        e.preventDefault();
        await run(async () => {
            await _post("/api/finance/rates", { ...rate, hourlyPence: Math.round(Number(rate.amount) * 100) });
            setReload((n) => n + 1);
            setPreview(null);
        });
    }
    const calculate = () =>
        run(async () => {
            setDetail(null);
            setPreview((await _get("/api/finance/preview", { params: { kind: tab, recipientId: recipient, from, to } })).data.results.data);
        });
    const create = () =>
        run(async () => {
            const r = await _post("/api/finance/documents", { kind: tab, recipientId: recipient, from, to });
            setPreview(null);
            setDetail((await _get(`/api/finance/documents/${r.data.results.data.id}`)).data.results.data);
            setReload((n) => n + 1);
        });
    const transition = (status) =>
        run(async () => {
            if (!window.confirm(`Mark this document as ${status.toLowerCase()}?`)) return;
            await _post(`/api/finance/documents/${detail.id}/status`, { status, expectedStatus: detail.status });
            setDetail((await _get(`/api/finance/documents/${detail.id}`)).data.results.data);
            setReload((n) => n + 1);
        });
    const record = detail || preview;
    const documentName = (d) => `${d.kind === "INVOICE" ? "INV" : "PAY"}-${String(d.number).padStart(5, "0")}`;
    return (
        <Page
            title="Finance"
            description="GBP client invoices and gross staff pay. Amounts use separately confirmed visit durations; tax and payroll deductions are not included."
        >
            <ErrorBox error={error} />
            <div className="flex flex-wrap gap-2">
                {[
                    ["INVOICE", "Client invoices"],
                    ["PAYRUN", "Staff pay"],
                    ["RATES", "Hourly rates"],
                ].map(([k, n]) => (
                    <button
                        key={k}
                        className={tab === k ? buttonClass : "rounded-lg border px-4 py-2"}
                        onClick={() => {
                            setTab(k);
                            setRecipient("");
                            setPreview(null);
                            setDetail(null);
                        }}
                    >
                        {n}
                    </button>
                ))}
            </div>
            {tab === "RATES" ? (
                <>
                    <form
                        className="flex flex-wrap items-end gap-3 rounded-xl border bg-white p-5"
                        onSubmit={saveRate}
                    >
                        <Field label="Rate type">
                            <select
                                className={inputClass}
                                value={rate.kind}
                                onChange={(e) => setRate({ ...rate, kind: e.target.value, userId: "" })}
                            >
                                <option value="BILLING">Client billing</option>
                                <option value="PAY">Staff pay</option>
                            </select>
                        </Field>
                        <Field label="Person">
                            <select
                                required
                                className={inputClass}
                                value={rate.userId}
                                onChange={(e) => setRate({ ...rate, userId: e.target.value })}
                            >
                                <option value="">Select person</option>
                                {people
                                    .filter((p) => p.isClient === (rate.kind === "BILLING"))
                                    .map((p) => (
                                        <option
                                            key={p.id}
                                            value={p.id}
                                        >
                                            {p.name}
                                        </option>
                                    ))}
                            </select>
                        </Field>
                        <Field label="Effective from">
                            <input
                                required
                                type="date"
                                className={inputClass}
                                value={rate.effectiveFrom}
                                onChange={(e) => setRate({ ...rate, effectiveFrom: e.target.value })}
                            />
                        </Field>
                        <Field label="Hourly rate (GBP)">
                            <input
                                required
                                type="number"
                                min="0"
                                max="10000"
                                step="0.01"
                                className={inputClass}
                                value={rate.amount}
                                onChange={(e) => setRate({ ...rate, amount: e.target.value })}
                            />
                        </Field>
                        <button
                            disabled={busy}
                            className={buttonClass}
                        >
                            Save rate
                        </button>
                    </form>
                    <p className="text-xs text-gray-500">
                        A new effective date preserves earlier rates. Saving the same person, type and date updates that rate. Existing document
                        totals remain unchanged.
                    </p>
                    <div className="overflow-auto rounded-xl border bg-white">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr>
                                    {["Person", "Type", "Effective from", "Per hour"].map((h) => (
                                        <th
                                            className="p-3"
                                            key={h}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rates.map((r) => (
                                    <tr
                                        key={r.id}
                                        className="border-t"
                                    >
                                        <td className="p-3">{r.name}</td>
                                        <td className="p-3">{r.kind === "BILLING" ? "Client billing" : "Staff pay"}</td>
                                        <td className="p-3">{r.effectiveFrom}</td>
                                        <td className="p-3">{money(r.hourlyPence)}</td>
                                    </tr>
                                ))}
                                {!rates.length && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="p-8 text-center"
                                        >
                                            No rates set yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-white p-5">
                        <Field label="From">
                            <input
                                type="date"
                                className={inputClass}
                                value={from}
                                onChange={(e) => {
                                    setFrom(e.target.value);
                                    setPreview(null);
                                }}
                            />
                        </Field>
                        <Field label="To">
                            <input
                                type="date"
                                className={inputClass}
                                value={to}
                                onChange={(e) => {
                                    setTo(e.target.value);
                                    setPreview(null);
                                }}
                            />
                        </Field>
                        <Field label={tab === "INVOICE" ? "Client" : "Staff member"}>
                            <select
                                className={inputClass}
                                value={recipient}
                                onChange={(e) => {
                                    setRecipient(e.target.value);
                                    setPreview(null);
                                }}
                            >
                                <option value="">Choose person</option>
                                {people
                                    .filter((p) => p.isClient === (tab === "INVOICE"))
                                    .map((p) => (
                                        <option
                                            key={p.id}
                                            value={p.id}
                                        >
                                            {p.name}
                                        </option>
                                    ))}
                            </select>
                        </Field>
                        <button
                            disabled={busy || !recipient}
                            className={buttonClass}
                            onClick={calculate}
                        >
                            Preview completed visits
                        </button>
                    </div>
                    {record && (
                        <section
                            id="finance-document"
                            className="space-y-4 rounded-xl border bg-white p-6"
                        >
                            <h2 className="text-xl font-semibold">
                                {detail ? documentName(detail) : "Preview"} · {record.recipientName}
                            </h2>
                            <p className="text-sm">
                                {record.from} to {record.to}
                                {detail && ` · ${detail.status}`}
                            </p>
                            <div className="overflow-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr>
                                            {["Date", "Visit", "Hours", "Hourly rate", "Amount"].map((h) => (
                                                <th
                                                    className="p-2"
                                                    key={h}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {record.lines.map((l, i) => (
                                            <tr
                                                key={i}
                                                className="border-t"
                                            >
                                                <td className="p-2">{l.date}</td>
                                                <td className="p-2">{l.title}</td>
                                                <td className="p-2">{(l.minutes / 60).toFixed(2)}</td>
                                                <td className="p-2">{l.hourlyPence === null ? "Rate missing" : money(l.hourlyPence)}</td>
                                                <td className="p-2">{l.amountPence === null ? "-" : money(l.amountPence)}</td>
                                            </tr>
                                        ))}
                                        {!record.lines.length && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="p-5"
                                                >
                                                    No unprocessed completed visits in this period.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-right text-lg font-semibold">Total: {money(record.totalPence)}</p>
                            <p className="text-xs text-gray-500">
                                Currency GBP. Based on completed visits and their scheduled duration. No tax, payroll deductions or bank transfer is
                                applied by this document.
                            </p>
                            <div className="flex flex-wrap gap-3 print:hidden">
                                {preview && !detail && (
                                    <button
                                        disabled={busy || !preview.lines.length || preview.missingRates > 0}
                                        className={buttonClass}
                                        onClick={create}
                                    >
                                        Create draft
                                    </button>
                                )}
                                {detail && (
                                    <>
                                        <button
                                            className="rounded border px-3 py-2"
                                            onClick={() => window.print()}
                                        >
                                            Print / Save PDF
                                        </button>
                                        <button
                                            className="rounded border px-3 py-2"
                                            onClick={() =>
                                                downloadCsv(documentName(detail) + ".csv", [
                                                    ["Date", "Visit", "Minutes", "Hourly GBP", "Amount GBP"],
                                                    ...detail.lines.map((l) => [
                                                        l.date,
                                                        l.title,
                                                        l.minutes,
                                                        (l.hourlyPence / 100).toFixed(2),
                                                        (l.amountPence / 100).toFixed(2),
                                                    ]),
                                                ])
                                            }
                                        >
                                            Export CSV
                                        </button>
                                        {detail.status === "DRAFT" && (
                                            <button
                                                disabled={busy}
                                                className={buttonClass}
                                                onClick={() => transition(detail.kind === "INVOICE" ? "ISSUED" : "APPROVED")}
                                            >
                                                {detail.kind === "INVOICE" ? "Mark issued" : "Approve pay run"}
                                            </button>
                                        )}
                                        {["ISSUED", "APPROVED"].includes(detail.status) && (
                                            <button
                                                disabled={busy}
                                                className={buttonClass}
                                                onClick={() => transition("PAID")}
                                            >
                                                Record as paid
                                            </button>
                                        )}
                                        {["DRAFT", "ISSUED", "APPROVED"].includes(detail.status) && (
                                            <button
                                                disabled={busy}
                                                className="rounded border border-red-300 px-3 py-2 text-red-800"
                                                onClick={() => transition("VOID")}
                                            >
                                                Void document
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                            {detail && (
                                <style>{`@media print {body *{visibility:hidden} #finance-document,#finance-document *{visibility:visible} #finance-document{position:absolute;left:0;top:0;width:100%;border:0} #finance-document button{display:none}}`}</style>
                            )}
                        </section>
                    )}
                    <h2 className="text-lg font-semibold">Documents covering this period</h2>
                    <div className="overflow-auto rounded-xl border bg-white">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr>
                                    {["Number", "Person", "Period", "Total", "Status", ""].map((h, i) => (
                                        <th
                                            key={i}
                                            className="p-3"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((d) => (
                                    <tr
                                        key={d.id}
                                        className="border-t"
                                    >
                                        <td className="p-3">{documentName(d)}</td>
                                        <td className="p-3">{d.recipientName}</td>
                                        <td className="p-3">
                                            {d.from} to {d.to}
                                        </td>
                                        <td className="p-3">{money(d.totalPence)}</td>
                                        <td className="p-3">{d.status}</td>
                                        <td className="p-3">
                                            <button
                                                className="underline"
                                                onClick={() => {
                                                    setPreview(null);
                                                    show(d.id);
                                                }}
                                            >
                                                Open
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {!documents.length && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="p-8 text-center text-gray-500"
                                        >
                                            No documents in this period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </Page>
    );
}
