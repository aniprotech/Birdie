import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const colors = ["#0f766e", "#2563eb", "#d97706", "#be123c", "#64748b", "#7c3aed"];
const validRows = (rows) => rows.map((row) => ({ label: String(row.label), value: Math.max(0, Number(row.value) || 0) }));

export function ReportDonut({ title, rows, note }) {
    const data = validRows(rows).filter((row) => row.value > 0);
    return <figure className="rounded-xl border bg-white p-4"><figcaption className="font-semibold text-slate-900">{title}</figcaption>{note && <p className="mt-1 text-xs text-slate-600">{note}</p>}
        {data.length ? <><div className="h-64" role="img" aria-label={`${title}: ${data.map((row) => `${row.label} ${row.value}`).join(", ")}`}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="label" innerRadius={62} outerRadius={92} paddingAngle={2} isAnimationActive={false}>{data.map((row, index) => <Cell key={row.label} fill={colors[index % colors.length]} />)}</Pie><Tooltip formatter={(value, label) => [value, label]} /></PieChart></ResponsiveContainer></div><ul className="space-y-1 text-sm">{data.map((row, index) => <li className="flex items-center justify-between gap-3" key={row.label}><span className="flex min-w-0 items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} /><span className="truncate" title={row.label}>{row.label}</span></span><strong>{row.value}</strong></li>)}</ul></> : <p className="py-12 text-sm text-slate-500">No recorded data in this period.</p>}
    </figure>;
}

export function ReportBars({ title, rows, note, limit = 12 }) {
    const data = validRows(rows).slice(0, limit);
    const height = Math.max(230, Math.min(620, data.length * 38 + 70));
    return <figure className="rounded-xl border bg-white p-4"><figcaption className="font-semibold text-slate-900">{title}</figcaption>{note && <p className="mt-1 text-xs text-slate-600">{note}</p>}
        {data.length ? <div style={{ height }} role="img" aria-label={`${title}: ${data.map((row) => `${row.label} ${row.value}`).join(", ")}`}><ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout="vertical" margin={{ top: 12, right: 24, bottom: 8, left: 8 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" tick={{ fontSize: 11 }} /><YAxis type="category" dataKey="label" width={110} tick={{ fontSize: 11 }} tickFormatter={(label) => label.length > 17 ? `${label.slice(0, 16)}…` : label} /><Tooltip formatter={(value) => [value, "Recorded"]} /><Bar dataKey="value" fill="#0f766e" radius={[0, 4, 4, 0]} isAnimationActive={false} /></BarChart></ResponsiveContainer></div> : <p className="py-12 text-sm text-slate-500">No recorded data in this period.</p>}
    </figure>;
}
