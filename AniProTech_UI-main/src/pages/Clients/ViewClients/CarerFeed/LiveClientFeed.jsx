import { useEffect, useState, useRef } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { _get, _post, _put } from "../../../../utils/ApiService";
import "./client-feed.css";
const label = (s) =>
    (s || "")
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/^./, (c) => c.toUpperCase());
const time = (v) =>
    v && !isNaN(new Date(v))
        ? new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", dateStyle: "medium", timeStyle: "short" }).format(new Date(v))
        : "Not recorded";
const message = (e) => e.response?.data?.message || e.message || "Unable to save";
const statusOptions = {
    NOTE: ["RECORDED"],
    ALERT: ["OPEN", "RESOLVED"],
    ACTION: ["OPEN", "RESOLVED"],
    ACTIVITY: ["PENDING", "COMPLETED", "NOT_COMPLETED"],
    OBSERVATION: ["RECORDED"],
};
const Badge = ({ value }) => <span className={`cf-badge cf-${value}`}>{label(value)}</span>;
const toLocal = (v) => {
    if (!v || isNaN(new Date(v))) return "";
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(new Date(v));
    const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
    return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
};
const toInstant = (v) => {
    const candidates = [0, 60].map((offset) => new Date(Date.parse(v + "Z") - offset * 60000)).filter((d) => !isNaN(d) && toLocal(d) === v);
    if (candidates.length !== 1)
        throw Error("This time is ambiguous or does not exist during a London clock change. Choose a time outside the clock-change hour.");
    return candidates[0].toISOString();
};

function EntryForm({ initial, onSave, onClose }) {
    const [v, set] = useState(initial),
        [busy, setBusy] = useState(false),
        [error, setError] = useState("");
    const update = (k, value) => set((x) => ({ ...x, [k]: value }));
    return (
        <div className="cf-overlay">
            <form
                className="cf-modal"
                onSubmit={async (e) => {
                    e.preventDefault();
                    setBusy(true);
                    try {
                        await onSave(v);
                    } catch (e) {
                        setError(message(e));
                    } finally {
                        setBusy(false);
                    }
                }}
            >
                <h2>
                    {v.id ? "Edit" : "Add"} {label(v.kind)}
                </h2>
                {!v.id && (
                    <label>
                        Type
                        <select
                            value={v.kind}
                            onChange={(e) => set({ ...v, kind: e.target.value, status: statusOptions[e.target.value][0] })}
                        >
                            {(v.teamEntry ? ["NOTE", "ALERT", "ACTION"] : Object.keys(statusOptions))
                                .filter((k) => v.visitId || !["ACTIVITY", "OBSERVATION"].includes(k))
                                .map((k) => (
                                    <option key={k}>{k}</option>
                                ))}
                        </select>
                    </label>
                )}
                <label>
                    Title
                    <input
                        autoFocus
                        required
                        maxLength={200}
                        value={v.title}
                        onChange={(e) => update("title", e.target.value)}
                    />
                </label>
                <label>
                    Category
                    <input
                        placeholder={v.kind === "OBSERVATION" ? "e.g. Wellbeing, nutrition, fluids, toileting" : "Optional category"}
                        maxLength={100}
                        value={v.category || ""}
                        onChange={(e) => update("category", e.target.value)}
                    />
                </label>
                <label>
                    {v.kind === "OBSERVATION" ? "Observation / value and notes" : "Details"}
                    <textarea
                        rows={8}
                        maxLength={20000}
                        value={v.body || ""}
                        onChange={(e) => update("body", e.target.value)}
                    />
                </label>
                <label>
                    Status
                    <select
                        value={v.status}
                        onChange={(e) => update("status", e.target.value)}
                    >
                        {statusOptions[v.kind].map((s) => (
                            <option
                                value={s}
                                key={s}
                            >
                                {label(s)}
                            </option>
                        ))}
                    </select>
                </label>
                {error && (
                    <p
                        role="alert"
                        className="cf-error"
                    >
                        {error}
                    </p>
                )}
                <footer>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={busy}
                    >
                        Cancel
                    </button>
                    <button
                        className="cf-primary"
                        disabled={busy}
                    >
                        {busy ? "Saving…" : "Save"}
                    </button>
                </footer>
            </form>
        </div>
    );
}
function AttendanceForm({ visit, onSave, onClose }) {
    const [start, setStart] = useState(toLocal(visit.actual_start)),
        [end, setEnd] = useState(toLocal(visit.actual_end)),
        [reason, setReason] = useState(""),
        [error, setError] = useState(""),
        [busy, setBusy] = useState(false);
    return (
        <div className="cf-overlay">
            <form
                className="cf-modal"
                onSubmit={async (e) => {
                    e.preventDefault();
                    setBusy(true);
                    try {
                        await onSave({ start: toInstant(start), end: end ? toInstant(end) : null, reason, revision: visit.revision });
                    } catch (e) {
                        setError(message(e));
                    } finally {
                        setBusy(false);
                    }
                }}
            >
                <h2>Manual attendance correction</h2>
                <p>All entered times use Europe/London. The previous times and reason remain in the timeline.</p>
                <label>
                    Check in
                    <input
                        type="datetime-local"
                        required
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                    />
                </label>
                <label>
                    Check out
                    <input
                        type="datetime-local"
                        required={visit.status === "COMPLETED"}
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                    />
                </label>
                <label>
                    Reason
                    <textarea
                        required
                        minLength={5}
                        maxLength={1000}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </label>
                {error && (
                    <p
                        className="cf-error"
                        role="alert"
                    >
                        {error}
                    </p>
                )}
                <footer>
                    <button
                        type="button"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        disabled={busy}
                        className="cf-primary"
                    >
                        {busy ? "Saving…" : "Save times"}
                    </button>
                </footer>
            </form>
        </div>
    );
}
export default function LiveClientFeed({ team = false, visitRecord = null, onVisitChange }) {
    const { id: routeId } = useParams();
    const [searchParams] = useSearchParams();
    const requestedVisit = team ? null : searchParams.get('visit');
    const pendingVisit = useRef(requestedVisit);
    const detailRef = useRef(null);
    const [detailError, setDetailError] = useState("");
    const [feed, setFeed] = useState(null),
        [selected, setSelected] = useState(null),
        [detail, setDetail] = useState(null),
        [kind, setKind] = useState("ALL"),
        [page, setPage] = useState(1),
        [filters, setFilters] = useState({ from: "", to: "", search: "" }),
        [filterDraft, setFilterDraft] = useState({ from: "", to: "", search: "" }),
        [tab, setTab] = useState("Details"),
        [error, setError] = useState(""),
        [loading, setLoading] = useState(false),
        [editor, setEditor] = useState(null),
        [history, setHistory] = useState(null),
        [attendance, setAttendance] = useState(false),
        [refresh, setRefresh] = useState(0),
        [options, setOptions] = useState(null),
        [staffId, setStaffId] = useState(""),
        [busy, setBusy] = useState(false);
    const id = visitRecord?.clientId || (team ? selected?.clientId : routeId);
    const base = `/api/clients/${id}`;
    const feedBase = team ? `/api/team/${routeId}/activity-feed` : `/api/clients/${routeId}/feed`;
    const [moreFilters, setMoreFilters] = useState(false);
    useEffect(() => {
        if (visitRecord) { setSelected({...visitRecord, kind: "VISIT"}); setTab("Details"); return; }
        pendingVisit.current = requestedVisit;
        setSelected(null);
        setDetail(null);
        setPage(1);
        setKind("ALL");
        setEditor(null);
        setHistory(null);
    }, [routeId, requestedVisit, visitRecord]);
    useEffect(() => {
        if (visitRecord) return;
        const c = new AbortController();
        setLoading(true);
        setError("");
        _get(feedBase, { params: { kind, page, ...filters }, signal: c.signal })
            .then((r) => {
                if (c.signal.aborted) return;
                const result = r.data.results.data;
                setFeed(result);
                const requested = pendingVisit.current;
                pendingVisit.current = null;
                setSelected((current) => requested ? { id: requested, kind: 'VISIT', clientId: routeId, linkedVisit: true } : result.items.find((x) => x.id === current?.id) || (current?.linkedVisit ? current : result.items[0] || null));
            })
            .catch((e) => {
                if (!c.signal.aborted) setError(message(e));
            })
            .finally(() => {
                if (!c.signal.aborted) setLoading(false);
            });
        return () => c.abort();
    }, [feedBase, routeId, requestedVisit, kind, page, filters, refresh, visitRecord]);
    useEffect(() => {
        if (!selected) {
            setDetail(null);
            return;
        }
        const c = new AbortController();
        setDetail(null);
        setDetailError("");
        if (detailRef.current) detailRef.current.scrollTop = 0;
        const path = selected.kind === "VISIT" ? `visits/${selected.id}` : `entries/${selected.id}`;
        _get(selected.teamEntry ? `/api/team/${routeId}/activity-entry/${selected.id}` : `${base}/${path}`, { signal: c.signal })
            .then((r) => {
                if (c.signal.aborted) return;
                setDetail(r.data.results.data);
                setStaffId(r.data.results.data.visit?.staff_id || "");
            })
            .catch((e) => {
                if (!c.signal.aborted) setDetailError(message(e));
            });
        return () => c.abort();
    }, [base, routeId, selected, refresh]);
    const reload = () => { setRefresh((n) => n + 1); onVisitChange?.(); };
    const openEntry = (k = "NOTE", entry = null) =>
        setEditor(
            entry
                ? { ...entry, visitId: entry.visit_id }
                : {
                      kind: k,
                      title: "",
                      body: "",
                      category: "",
                      status: statusOptions[k][0],
                      visitId: selected?.kind === "VISIT" ? selected.id : null,
                  },
        );
    const showHistory = async (entry) => {
        try {
            const r = await _get(`${base}/entries/${entry.id}`);
            setHistory(r.data.results.data);
        } catch (e) {
            setError(message(e));
        }
    };
    const saveEntry = async (value) => {
        if (value.teamEntry) {
            await _post(`/api/team/${routeId}/feed`, {kind: value.kind === "ALERT" ? "CONCERN" : value.kind, body: [value.title, value.body].filter(Boolean).join("\n\n")});
            setEditor(null); setKind("ALL"); setPage(1); setSelected(null); reload(); return;
        }
        const payload = {
            kind: value.kind,
            title: value.title,
            body: value.body,
            category: value.category,
            status: value.status,
            visitId: value.visitId,
            revision: value.revision,
        };
        await (value.id ? _put(`${base}/entries/${value.id}`, payload) : _post(`${base}/entries`, payload));
        setEditor(null);
        reload();
    };
    const act = async (work) => {
        setBusy(true);
        setError("");
        try {
            await work();
            reload();
        } catch (e) {
            setError(message(e));
        } finally {
            setBusy(false);
        }
    };
    const v = detail?.visit,
        entries = detail?.entries || [],
        counts = feed?.counts || {},
        total = kind === "ALL" ? Object.values(counts).reduce((a, b) => a + b, 0) : counts[kind] || 0;
    const renderEntry = (e) => (
        <article
            className="cf-entry"
            key={e.id}
        >
            <div className="cf-row">
                <h3>{e.title}</h3>
                <Badge value={e.status} />
            </div>
            <p className="cf-muted">
                {e.category && `${e.category} · `}
                {e.author} · {time(e.created_at)}
            </p>
            <p className="cf-text">{e.body || "No additional details"}</p>
            <footer>
                {selected?.teamEntry ? (detail.canManage && e.kind !== "NOTE" && e.status === "OPEN" && <button disabled={busy} onClick={() => act(() => _post(`/api/team/${routeId}/feed/${e.id}/resolve`))}>Mark resolved</button>) : <>
                <button onClick={() => openEntry(e.kind, e)}>Edit {label(e.kind)}</button>
                <button onClick={() => showHistory(e)}>See history</button>
                </>}
            </footer>
        </article>
    );
    return (
        <div className={`client-live-feed ${visitRecord ? "log-embedded" : ""} ${team ? "team-live-feed" : ""}`}>
            <header className="cf-header">
                <h1>{team ? "Carer feed" : "Client feed"}{feed?.client ? ` · ${feed.client.firstName} ${feed.client.lastName}` : ""}</h1>
                <div className="cf-row">
                    <span className="cf-muted">Europe/London</span>
                    <button onClick={reload}>Refresh</button>
                    <button
                        className="cf-primary"
                        onClick={() => team ? setEditor({teamEntry: true, kind: "NOTE",title:"",body:"",status:"RECORDED",visitId:null}) : openEntry("NOTE")}
                    >
                        Add new +
                    </button>
                </div>
            </header>
            {error && (
                <p
                    role="alert"
                    className="cf-error"
                >
                    {error}
                </p>
            )}
            {(!team || moreFilters) && <form
                className="cf-filters"
                onSubmit={(e) => {
                    e.preventDefault();
                    setFilters({ ...filterDraft });
                    setPage(1);
                    setSelected(null);
                }}
            >
                <label>
                    From
                    <input
                        type="date"
                        value={filterDraft.from}
                        onChange={(e) => setFilterDraft({ ...filterDraft, from: e.target.value })}
                    />
                </label>
                <label>
                    To
                    <input
                        type="date"
                        min={filterDraft.from}
                        value={filterDraft.to}
                        onChange={(e) => setFilterDraft({ ...filterDraft, to: e.target.value })}
                    />
                </label>
                <label>
                    Search
                    <input
                        placeholder="Search titles and notes"
                        value={filterDraft.search}
                        onChange={(e) => setFilterDraft({ ...filterDraft, search: e.target.value })}
                    />
                </label>
                <button>Apply filters</button>
                <button
                    type="button"
                    onClick={() => {
                        setFilterDraft({ from: "", to: "", search: "" });
                        setFilters({ from: "", to: "", search: "" });
                        setPage(1);
                    }}
                >
                    Clear
                </button>
            </form>}
            <div className="cf-columns">
                <nav className="cf-types">
                    {team && <p className="tf-name">{feed?.client?.firstName} {feed?.client?.lastName}</p>}
                    {[
                        ["ALL", "All"],
                        ["ALERT", "Alerts"],
                        ["VISIT", "Visits"],
                        ["NOTE", "Notes"],
                        ["ACTION", "Actions"],
                    ].map(([key, name]) => (
                        <button
                            key={key}
                            className={kind === key ? "active" : ""}
                            onClick={() => {
                                setKind(key);
                                setPage(1);
                                setSelected(null);
                            }}
                        >
                            {name}
                            <span>{key === "ALL" ? Object.values(counts).reduce((a, b) => a + b, 0) : counts[key] || 0}</span>
                        </button>
                    ))}
                    {team && <button onClick={() => setMoreFilters((x) => !x)} aria-expanded={moreFilters}>+ More filters</button>}
                </nav>
                <section
                    className="cf-list"
                    aria-label="Feed records"
                >
                    {loading ? (
                        <p>Loading feed…</p>
                    ) : !feed?.items.length ? (
                        <p>
                            No matching records. Add a note or schedule a visit from{" "}
                            <Link
                                className="underline"
                                to="/admin/rosters"
                            >
                                Roster
                            </Link>
                            .
                        </p>
                    ) : (
                        feed.items.map((item) => (
                            <button
                                key={item.id}
                                aria-pressed={selected?.id === item.id}
                                aria-controls="client-selected-record"
                                data-record-id={item.id}
                                className={`cf-feed-card ${selected?.id === item.id ? "selected" : ""}`}
                                onClick={() => {
                                    setDetail(null);
                                    setDetailError("");
                                    setEditor(null);
                                    setHistory(null);
                                    setAttendance(false);
                                    setSelected(item);
                                    if (window.innerWidth <= 800) detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                                    setTab("Details");
                                    setOptions(null);
                                }}
                            >
                                <div className="cf-row">
                                    <strong>{item.kind === "VISIT" ? "Visit" : label(item.kind)}</strong>
                                    <small>{time(item.occurred_at)}</small>
                                </div>
                                <p>{team && item.clientName ? item.clientName : item.title}</p>
                                {item.kind === "VISIT" && (
                                    <small>
                                        {item.alerts} open alerts · {item.observations} observations · {item.activities} activities completed
                                    </small>
                                )}
                                <div className={`cf-row tf-status tf-${item.status}`}>
                                    <Badge value={item.status} />
                                    {item.kind === "VISIT" && (
                                        <small>
                                            {item.actualMinutes == null ? "Actuals not recorded" : `${item.actualMinutes} mins`} /{" "}
                                            {item.plannedMinutes} mins planned
                                        </small>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                    <footer>
                        <button
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            Previous
                        </button>
                        <span>
                            {page} / {Math.max(1, Math.ceil(total / 30))}
                        </span>
                        <button
                            disabled={page * 30 >= total}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Next
                        </button>
                    </footer>
                </section>
                <section
                    id="client-selected-record"
                    ref={detailRef}
                    data-visit-id={detail?.visit?.id || ""}
                    className="cf-detail"
                    aria-label="Selected record details"
                >
                    {!selected ? (
                        <p className="cf-empty">Select a record to see details.</p>
                    ) : detailError ? (
                        <div
                            role="alert"
                            className="cf-error"
                        >
                            <p>{detailError}</p>
                            <button onClick={reload}>Retry loading details</button>
                        </div>
                    ) : !detail ? (
                        <p role="status">Loading selected record…</p>
                    ) : v ? (
                        <>
                            <header>
                                <Link
                                    className="underline"
                                    to={`/admin/clients/${id}/basic-info`}
                                >
                                    {v.clientName}
                                </Link>
                                <h2>{v.title}</h2>
                                <p>
                                    {v.date} · {v.startTime}–{v.endTime}
                                </p>
                                <Badge value={v.status} />
                            </header>
                            <nav
                                className="cf-tabs"
                                aria-label="Visit tabs"
                            >
                                {["Details", "Alerts", "Activities", "Observations", "Care team", "Timeline"].map((t) => (
                                    <button
                                        className={tab === t ? "active" : ""}
                                        key={t}
                                        onClick={() => setTab(t)}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </nav>
                            {tab === "Details" && (
                                <>
                                    <div className="cf-grid">
                                        <article>
                                            <h3>Planned</h3>
                                            <p>
                                                {v.startTime}–{v.endTime}
                                            </p>
                                            <h3>Actuals</h3>
                                            <p>Check in: {time(v.actual_start)}</p>
                                            <p>Check out: {time(v.actual_end)}</p>
                                            {v.actual_start && v.actual_end && (
                                                <p>Total: {Math.round((new Date(v.actual_end) - new Date(v.actual_start)) / 60000)} minutes</p>
                                            )}
                                            {detail.canManage && ["IN_PROGRESS", "COMPLETED"].includes(v.status) && (
                                                <button onClick={() => setAttendance(true)}>Correct actual times</button>
                                            )}
                                        </article>
                                        <article>
                                            <h3>Client location</h3>
                                            {(() => {
                                                const a = detail.addresses.find((a) => a.isPrimary) || detail.addresses[0];
                                                const address = a
                                                    ? [a.addressLine1, a.addressLine2, a.city, a.county, a.postalCode, a.country]
                                                          .filter(Boolean)
                                                          .join(", ")
                                                    : "";
                                                return (
                                                    <>
                                                        <p>{address || "No address recorded"}</p>
                                                        {address && (
                                                            <a
                                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="underline"
                                                            >
                                                                Show map
                                                            </a>
                                                        )}
                                                        <p>Access: {a?.accessDetails || "No access details recorded"}</p>
                                                    </>
                                                );
                                            })()}
                                        </article>
                                        <article>
                                            <h3>Alerts</h3>
                                            <p>{entries.filter((e) => e.kind === "ALERT" && e.status === "OPEN").length} open alerts</p>
                                            <button onClick={() => setTab("Alerts")}>View alerts</button>
                                        </article>
                                        <article>
                                            <h3>Care team</h3>
                                            <p>{v.staffName || "Unassigned"}</p>
                                            <button onClick={() => setTab("Care team")}>View care team</button>
                                        </article>
                                        <article>
                                            <h3>Check in</h3>
                                            <p>{time(v.actual_start)}</p>
                                            <p className="cf-muted">
                                                {v.actual_start ? "Recorded attendance" : "This visit has not recorded a check-in."}
                                            </p>
                                            {v.status === "SCHEDULED" && (
                                                <button
                                                    disabled={busy}
                                                    onClick={() =>
                                                        act(() =>
                                                            _post(`/api/roster/visits/${v.id}/status`, {
                                                                status: "IN_PROGRESS",
                                                                revision: v.revision,
                                                            }),
                                                        )
                                                    }
                                                >
                                                    Manual check in
                                                </button>
                                            )}
                                            {detail.canManage && ["IN_PROGRESS", "COMPLETED"].includes(v.status) && (
                                                <button onClick={() => setAttendance(true)}>Correct check-in time</button>
                                            )}
                                        </article>
                                        <article>
                                            <h3>Check out</h3>
                                            <p>{time(v.actual_end)}</p>
                                            <p className="cf-muted">
                                                {v.actual_end ? "Recorded attendance" : "This visit has not recorded a check-out."}
                                            </p>
                                            {v.status === "IN_PROGRESS" && (
                                                <button
                                                    disabled={busy}
                                                    onClick={() =>
                                                        act(() =>
                                                            _post(`/api/roster/visits/${v.id}/status`, { status: "COMPLETED", revision: v.revision }),
                                                        )
                                                    }
                                                >
                                                    Manual check out
                                                </button>
                                            )}
                                            {detail.canManage && v.status === "COMPLETED" && (
                                                <button onClick={() => setAttendance(true)}>Correct check-out time</button>
                                            )}
                                        </article>
                                        <article>
                                            <h3>Mobile location audit</h3>
                                            <p>{detail.locationTrail?.length || 0} active-visit samples</p>
                                            {detail.locationTrail?.length > 0 && (() => {
                                                const latest = detail.locationTrail[detail.locationTrail.length - 1];
                                                return <><p className="cf-muted">Latest: {time(latest.recordedAt)} · accuracy {Math.round(latest.accuracy || 0)} m</p><a className="underline" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${latest.latitude},${latest.longitude}`}>View latest verified position</a></>;
                                            })()}
                                            {!detail.locationTrail?.length && <p className="cf-muted">No active-visit trail recorded.</p>}
                                        </article>
                                        <article>
                                            <h3>Mobile photo evidence</h3>
                                            <p>{detail.attachments?.length || 0} photos</p>
                                            {detail.attachments?.slice(-3).map((photo) => <p key={photo.id} className="cf-muted">{photo.caption || photo.name}{photo.latitude != null ? " · location recorded" : ""}</p>)}
                                        </article>
                                    </div>
                                    <article className="cf-entry">
                                        <h3>Visit instructions</h3>
                                        <p className="cf-text">{v.notes || "No instructions recorded"}</p>
                                    </article>
                                    <div className="cf-row">
                                        {v.status === "SCHEDULED" && (
                                            <button
                                                disabled={busy}
                                                onClick={() =>
                                                    act(() =>
                                                        _post(`/api/roster/visits/${v.id}/status`, { status: "IN_PROGRESS", revision: v.revision }),
                                                    )
                                                }
                                            >
                                                Start visit / check in
                                            </button>
                                        )}
                                        {v.status === "IN_PROGRESS" && (
                                            <button
                                                disabled={busy}
                                                onClick={() =>
                                                    act(() =>
                                                        _post(`/api/roster/visits/${v.id}/status`, { status: "COMPLETED", revision: v.revision }),
                                                    )
                                                }
                                            >
                                                Complete visit / check out
                                            </button>
                                        )}
                                        {detail.canManage && ["DRAFT", "SCHEDULED"].includes(v.status) && (
                                            <Link
                                                to="/admin/rosters"
                                                className="underline"
                                            >
                                                Edit schedule in Roster
                                            </Link>
                                        )}
                                    </div>
                                </>
                            )}
                            {["Alerts", "Activities", "Observations"].includes(tab) && (
                                <>
                                    <div className="cf-row">
                                        <h2>{tab}</h2>
                                        <button
                                            onClick={() => openEntry({ Alerts: "ALERT", Activities: "ACTIVITY", Observations: "OBSERVATION" }[tab])}
                                        >
                                            Add {tab === "Activities" ? "activity" : tab === "Alerts" ? "alert" : "observation"} +
                                        </button>
                                    </div>
                                    {tab === "Observations" && (
                                        <>
                                            <div className="cf-row">
                                                <h3>General notes</h3>
                                                <button onClick={() => openEntry("NOTE")}>Add a note</button>
                                            </div>
                                            {entries.filter((e) => e.kind === "NOTE").map(renderEntry)}
                                        </>
                                    )}
                                    {entries
                                        .filter((e) => e.kind === { Alerts: "ALERT", Activities: "ACTIVITY", Observations: "OBSERVATION" }[tab])
                                        .map(renderEntry)}
                                    {!entries.some(
                                        (e) => e.kind === { Alerts: "ALERT", Activities: "ACTIVITY", Observations: "OBSERVATION" }[tab],
                                    ) && <p className="cf-empty">No {tab.toLowerCase()} recorded for this visit.</p>}
                                </>
                            )}
                            {tab === "Care team" && (
                                <>
                                    <h2>Assigned</h2>
                                    <article className="cf-entry">
                                        <h3>{v.staffName || "No carer assigned"}</h3>
                                        <p>{v.staffPhone || "No phone number recorded"}</p>
                                    </article>
                                    {detail.canManage && ["DRAFT", "SCHEDULED"].includes(v.status) && (
                                        <>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        setOptions((await _get("/api/roster/options")).data.results.data);
                                                    } catch (e) {
                                                        setError(message(e));
                                                    }
                                                }}
                                            >
                                                Find alternative
                                            </button>
                                            {options && (
                                                <div className="cf-row">
                                                    <label>
                                                        Carer
                                                        <select
                                                            value={staffId}
                                                            onChange={(e) => setStaffId(e.target.value)}
                                                        >
                                                            <option value="">Unassigned (draft only)</option>
                                                            {options.staff.map((s) => (
                                                                <option
                                                                    key={s.id}
                                                                    value={s.id}
                                                                >
                                                                    {s.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </label>
                                                    <button
                                                        disabled={busy}
                                                        onClick={() =>
                                                            act(() =>
                                                                _put(`/api/roster/visits/${v.id}`, {
                                                                    clientId: id,
                                                                    staffId: staffId || null,
                                                                    date: v.date,
                                                                    startTime: v.startTime,
                                                                    endTime: v.endTime,
                                                                    title: v.title,
                                                                    notes: v.notes,
                                                                    status: v.status,
                                                                    revision: v.revision,
                                                                    repeatWeeks: 1,
                                                                }),
                                                            )
                                                        }
                                                    >
                                                        Assign carer
                                                    </button>
                                                </div>
                                            )}
                                            <p className="cf-muted">Availability, absences and overlapping visits are checked when assigning.</p>
                                        </>
                                    )}
                                    <h2>Client’s care team</h2>
                                    {detail.careTeam.length ? (
                                        detail.careTeam.map((c) => (
                                            <article
                                                className="cf-entry"
                                                key={c.id}
                                            >
                                                <h3>
                                                    {c.firstName} {c.lastName}
                                                </h3>
                                                <p>{c.primaryPhone || "No phone number recorded"}</p>
                                            </article>
                                        ))
                                    ) : (
                                        <p>No client care-team links recorded.</p>
                                    )}
                                    <Link
                                        to={`/admin/clients/${id}/care-team`}
                                        className="underline"
                                    >
                                        Manage client care team
                                    </Link>
                                </>
                            )}
                            {tab === "Timeline" && (
                                <>
                                    <h2>Visit timeline</h2>
                                    {!detail.events.length ? (
                                        <p>No detailed timeline was recorded for this older visit.</p>
                                    ) : (
                                        <ol className="cf-timeline">
                                            {detail.events.map((e) => (
                                                <li key={e.id}>
                                                    <p className="cf-text">{e.description}</p>
                                                    <small>
                                                        {e.author} · {time(e.created_at)}
                                                    </small>
                                                </li>
                                            ))}
                                        </ol>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <>{renderEntry(detail.entry)}</>
                    )}
                </section>
            </div>
            {editor && (
                <EntryForm
                    initial={editor}
                    onSave={saveEntry}
                    onClose={() => setEditor(null)}
                />
            )}
            {attendance && v && (
                <AttendanceForm
                    visit={v}
                    onClose={() => setAttendance(false)}
                    onSave={async (b) => {
                        await _put(`${base}/visits/${v.id}/actuals`, b);
                        setAttendance(false);
                        reload();
                    }}
                />
            )}
            {history && (
                <div className="cf-overlay">
                    <section className="cf-modal">
                        <div className="cf-row">
                            <h2>Record history</h2>
                            <button onClick={() => setHistory(null)}>Close</button>
                        </div>
                        {history.history.map((h) => (
                            <article
                                className="cf-entry"
                                key={h.revision}
                            >
                                <h3>
                                    Version {h.revision} · {h.snapshot.title}
                                </h3>
                                <p>
                                    {h.author} · {time(h.created_at)}
                                </p>
                                <Badge value={h.snapshot.status} />
                                <p className="cf-text">{h.snapshot.body}</p>
                            </article>
                        ))}
                    </section>
                </div>
            )}
        </div>
    );
}
