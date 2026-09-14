import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { _get, _post, _put } from "../../utils/ApiService";
import InboxSettings from "./InboxSettings";
import AdvancedFilters from "./AdvancedFilters";
import { emptyFilters } from "./inbox-filter-options";
import MessagesInbox from "./MessagesInbox";
import "./inbox.css";
const statuses = { OPEN: "Action needed", IN_PROGRESS: "In progress", RESOLVED: "Resolved" },
    severities = ["UNDEFINED", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
const label = (s) => statuses[s] || s.charAt(0) + s.slice(1).toLowerCase();
const time = (v) =>
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(
        new Date(v),
    );
const errorText = (e) => e.response?.data?.message || "Unable to complete this request. Please retry.";
const fields = (i) => ({ state: i.state, severity: i.severity, assignedTo: i.assignedTo || "", dueDate: i.dueDate || "", archived: i.archived });
function Select({ title, value, onChange, items }) {
    return (
        <label>
            {title}
            <select
                aria-label={title}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {items.map(([v, n]) => (
                    <option
                        key={v}
                        value={v}
                    >
                        {n}
                    </option>
                ))}
            </select>
        </label>
    );
}
function Controls({ value, set, people, admin = true, creating = false }) {
    const update = (k, v) => set({ ...value, [k]: v, ...(k === "state" && v !== "RESOLVED" ? { archived: false } : {}) });
    return (
        <div className="ix-controls">
            {!creating && (
                <Select
                    title="Choose status"
                    value={value.state}
                    onChange={(v) => update("state", v)}
                    items={Object.entries(statuses)}
                />
            )}{" "}
            {admin && (
                <>
                    <Select
                        title="Severity"
                        value={value.severity}
                        onChange={(v) => update("severity", v)}
                        items={severities.map((v) => [v, label(v)])}
                    />
                    <Select
                        title="Assigned to"
                        value={value.assignedTo}
                        onChange={(v) => update("assignedTo", v)}
                        items={[["", "Unassigned"], ...people.map((p) => [p.id, p.name])]}
                    />
                    <label>
                        Due date
                        <input
                            type="date"
                            value={value.dueDate}
                            onChange={(e) => update("dueDate", e.target.value)}
                        />
                    </label>
                </>
            )}
        </div>
    );
}
export default function AlertInbox() {
    const [url, setUrl] = useSearchParams(),
        requested = useRef(url.get("item"));
    const [advanced, setAdvanced] = useState({ ...emptyFilters }),
        [filtersOpen, setFiltersOpen] = useState(false),
        [preferences, setPreferences] = useState({ showPreviews: true, sort: "NEWEST" }),
        [sort, setSort] = useState("NEWEST");
    const settingsOpen = url.get("settings") === "true";
    useEffect(() => {
        requested.current = url.get("item");
        if (requested.current) setSelected(requested.current);
    }, [url]);
    useEffect(() => {
        const c = new AbortController();
        _get("/api/inbox/preferences", { signal: c.signal })
            .then((r) => {
                if (c.signal.aborted) return;
                const p = r.data.results.data.preferences;
                setPreferences(p);
                setSort(p.sort);
                if (!requested.current) {
                    const [k, f] = p.folder.split(":");
                    setKind(k);
                    setFilter(f);
                }
            })
            .catch(() => {});
        return () => c.abort();
    }, []);
    const [messages, setMessages] = useState(false),
        [kind, setKind] = useState("ALERT"),
        [filter, setFilter] = useState("OPEN"),
        [search, setSearch] = useState(""),
        [severity, setSeverity] = useState(""),
        [page, setPage] = useState(1),
        [refresh, setRefresh] = useState(0),
        [data, setData] = useState(null),
        [options, setOptions] = useState({ clients: [], people: [], canManage: false }),
        [selected, setSelected] = useState(url.get("item")),
        [detail, setDetail] = useState(null),
        [draft, setDraft] = useState(null),
        [tab, setTab] = useState("Details"),
        [error, setError] = useState(""),
        [detailError, setDetailError] = useState(""),
        [loading, setLoading] = useState(false),
        [busy, setBusy] = useState(false),
        [comment, setComment] = useState(""),
        [multi, setMulti] = useState(false),
        [checked, setChecked] = useState([]),
        [compose, setCompose] = useState(null),
        [visits, setVisits] = useState([]),
        [bulk, setBulk] = useState(null),
        [notice, setNotice] = useState("");
    const reload = () => setRefresh((n) => n + 1);
    useEffect(() => {
        const c = new AbortController();
        _get("/api/inbox/items/options", { signal: c.signal })
            .then((r) => {
                if (!c.signal.aborted) setOptions(r.data.results.data);
            })
            .catch((e) => {
                if (!c.signal.aborted) setError(errorText(e));
            });
        return () => c.abort();
    }, []);
    useEffect(() => {
        if (messages) return;
        const c = new AbortController();
        setLoading(true);
        setError("");
        const timer = setTimeout(
            () =>
                _get("/api/inbox/items", { params: { kind, filter, search, severity, page, sort, ...advanced }, signal: c.signal })
                    .then((r) => {
                        if (c.signal.aborted) return;
                        setData(r.data.results.data);
                        setSelected(
                            (old) =>
                                requested.current ||
                                (r.data.results.data.items.some((x) => x.id === old) ? old : r.data.results.data.items[0]?.id || null),
                        );
                    })
                    .catch((e) => {
                        if (!c.signal.aborted) setError(errorText(e));
                    })
                    .finally(() => {
                        if (!c.signal.aborted) setLoading(false);
                    }),
            180,
        );
        return () => {
            clearTimeout(timer);
            c.abort();
        };
    }, [messages, kind, filter, search, severity, page, refresh, sort, advanced]);
    useEffect(() => {
        setChecked([]);
    }, [kind, filter, search, severity, page, refresh, advanced]);
    useEffect(() => {
        setDetail(null);
        setDraft(null);
        setDetailError("");
        setComment("");
        if (!selected || messages) return;
        const c = new AbortController();
        _get("/api/inbox/items/" + selected, { signal: c.signal })
            .then((r) => {
                if (c.signal.aborted) return;
                setDetail(r.data.results.data);
                setDraft(fields(r.data.results.data.item));
            })
            .catch((e) => {
                if (!c.signal.aborted) setDetailError(errorText(e));
            });
        return () => c.abort();
    }, [selected, refresh, messages]);
    useEffect(() => {
        setVisits([]);
        if (!compose?.clientId) return;
        const c = new AbortController(),
            today = new Date().toISOString().slice(0, 10),
            add = (n) => new Date(Date.parse(today) + n * 86400000).toISOString().slice(0, 10);
        _get("/api/roster/visits", { params: { from: add(-30), to: add(30) }, signal: c.signal })
            .then((r) => {
                if (!c.signal.aborted) setVisits(r.data.results.data.visits.filter((v) => v.clientId === compose.clientId));
            })
            .catch((e) => {
                if (!c.signal.aborted) setDetailError(errorText(e));
            });
        return () => c.abort();
    }, [compose?.clientId]);
    useEffect(() => {
        const key = (e) => {
            if (e.key === "Escape" && !busy) {
                setCompose(null);
                setBulk(null);
            }
        };
        document.addEventListener("keydown", key);
        return () => document.removeEventListener("keydown", key);
    }, [busy]);
    const act = async (fn) => {
        setBusy(true);
        setDetailError("");
        setNotice("");
        try {
            await fn();
            setNotice("Changes saved");
            reload();
        } catch (e) {
            setDetailError(errorText(e));
        } finally {
            setBusy(false);
        }
    };
    const choose = (k, f) => {
        requested.current = null;
        setUrl({});
        setAdvanced({ ...emptyFilters });
        setKind(k);
        setFilter(f);
        setPage(1);
        setSelected(null);
        setTab("Details");
        setMessages(false);
        setDetailError("");
    };
    const nav = (k, list) => (
        <section>
            <h2>{k === "ALERT" ? "Alerts" : "Actions"}</h2>
            {list.map(([f, n]) => (
                <button
                    key={f}
                    className={!messages && kind === k && filter === f ? "active" : ""}
                    onClick={() => choose(k, f)}
                >
                    {n}
                    <span>{data?.counts?.[k]?.[f] ?? 0}</span>
                </button>
            ))}
        </section>
    );
    const item = detail?.item,
        canSave = detail?.canEdit && draft && JSON.stringify(fields(item)) !== JSON.stringify(draft),
        selectedRows = (data?.items || []).filter((x) => checked.includes(x.id));
    return (
        <main className="inbox-workspace">
            {filtersOpen && (
                <AdvancedFilters
                    value={advanced}
                    options={options}
                    kind={kind}
                    filter={filter}
                    search={search}
                    severity={severity}
                    onClose={() => setFiltersOpen(false)}
                    onApply={(v) => {
                        setAdvanced(v);
                        setPage(1);
                        requested.current = null;
                        setUrl({});
                        setSelected(null);
                        setFiltersOpen(false);
                        setMessages(false);
                    }}
                />
            )}
            <aside
                className="ix-nav"
                aria-label="Inbox folders"
            >
                {nav("ALERT", [
                    ["ALL", "All"],
                    ["OPEN", "Action needed"],
                    ["IN_PROGRESS", "In progress"],
                    ["RESOLVED", "Resolved"],
                    ["ARCHIVED", "Archived"],
                ])}
                {nav("ACTION", [
                    ["ALL", "All"],
                    ["UNASSIGNED", "Unassigned"],
                    ["MINE", "My actions"],
                    ["TODAY", "Due today"],
                    ["WEEK", "Due this week"],
                    ["RESOLVED", "Done"],
                    ["ARCHIVED", "Archived"],
                ])}
                <button onClick={() => setFiltersOpen(true)}>
                    ＋ More filters <span>{Object.entries(advanced).filter(([, v]) => v && v !== "false").length}</span>
                </button>
                <button
                    className={settingsOpen ? "active" : ""}
                    onClick={() => setUrl({ settings: "true" })}
                >
                    ⚙ Settings
                </button>
                <button
                    onClick={() => {
                        setUrl({});
                        setMessages(true);
                    }}
                >
                    Messages
                </button>
            </aside>
            {settingsOpen ? (
                <InboxSettings
                    onBack={() => setUrl({})}
                    onSaved={(p) => {
                        setPreferences(p);
                        setSort(p.sort);
                    }}
                />
            ) : messages ? (
                <div className="ix-messages">
                    <MessagesInbox />
                </div>
            ) : (
                <>
                    <section
                        className="ix-feed"
                        aria-label="Inbox items"
                    >
                        <header>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={multi}
                                    disabled={!options.canManage}
                                    onChange={(e) => {
                                        setMulti(e.target.checked);
                                        setChecked([]);
                                    }}
                                />{" "}
                                Multi select
                            </label>
                            <button
                                disabled={!options.canManage}
                                onClick={() => {
                                    setDetailError("");
                                    setCompose({
                                        kind,
                                        clientId: "",
                                        visitId: "",
                                        title: "",
                                        body: "",
                                        severity: "UNDEFINED",
                                        assignedTo: "",
                                        dueDate: "",
                                    });
                                }}
                            >
                                Add new ＋
                            </button>
                        </header>
                        <div className="ix-search">
                            {advanced.recordKind && (
                                <p style={{ width: "100%" }}>
                                    Advanced results ·{" "}
                                    {advanced.recordKind === "ALL" ? "Alerts and actions" : advanced.recordKind === "ALERT" ? "Alerts" : "Actions"}
                                </p>
                            )}
                            <input
                                aria-label="Search alerts and actions"
                                placeholder="Search client or incident"
                                maxLength={200}
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                            />
                            <select
                                aria-label="Filter severity"
                                value={severity}
                                onChange={(e) => {
                                    setSeverity(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">All severities</option>
                                {severities.map((v) => (
                                    <option
                                        key={v}
                                        value={v}
                                    >
                                        {label(v)}
                                    </option>
                                ))}
                            </select>
                            <button onClick={reload}>Refresh</button>
                        </div>
                        {multi && (
                            <div className="ix-bulk-bar">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={!!data?.items.length && checked.length === data.items.length}
                                        onChange={(e) => setChecked(e.target.checked ? data.items.map((x) => x.id) : [])}
                                    />{" "}
                                    Select this page
                                </label>
                                <button
                                    disabled={!checked.length || busy}
                                    onClick={() => setBulk({ state: "RESOLVED" })}
                                >
                                    Update {checked.length} selected
                                </button>
                            </div>
                        )}
                        {error && (
                            <p
                                role="alert"
                                className="ix-error"
                            >
                                {error}
                            </p>
                        )}
                        <div className="ix-cards">
                            {loading ? (
                                <p role="status">Loading inbox…</p>
                            ) : !data?.items.length ? (
                                <p className="ix-empty">No {kind === "ALERT" ? "alerts" : "actions"} match these filters.</p>
                            ) : (
                                data.items.map((i) => (
                                    <article
                                        key={i.id}
                                        className={"ix-card " + (selected === i.id ? "selected" : "")}
                                    >
                                        {multi && (
                                            <label className="ix-select">
                                                <input
                                                    type="checkbox"
                                                    aria-label={"Select " + i.title}
                                                    checked={checked.includes(i.id)}
                                                    onChange={(e) =>
                                                        setChecked((x) => (e.target.checked ? [...x, i.id] : x.filter((v) => v !== i.id)))
                                                    }
                                                />
                                            </label>
                                        )}
                                        <button
                                            className="ix-card-main"
                                            aria-pressed={selected === i.id}
                                            onClick={() => {
                                                requested.current = i.id;
                                                setUrl({ item: i.id });
                                                setSelected(i.id);
                                                setTab("Details");
                                                setNotice("");
                                            }}
                                        >
                                            <div className="ix-card-heading">
                                                <span className="ix-avatar">
                                                    {i.clientName
                                                        .split(" ")
                                                        .map((s) => s[0])
                                                        .slice(0, 2)
                                                        .join("")}
                                                </span>
                                                <strong>{i.clientName}</strong>
                                                <time>{time(i.createdAt)}</time>
                                            </div>
                                            <h3>{i.title}</h3>
                                            {preferences.showPreviews && <p className="ix-excerpt">{i.body}</p>}
                                            <div className="ix-meta">
                                                <span>{i.commentCount} comments</span>
                                                {["HIGH", "CRITICAL"].includes(i.severity) && <span className="ix-overdue">{label(i.severity)}</span>}
                                                <span>{i.assigneeName || "Unassigned"}</span>
                                                {i.dueDate && (
                                                    <span className={i.dueDate < data.today && i.state !== "RESOLVED" ? "ix-overdue" : ""}>
                                                        Due {i.dueDate}
                                                    </span>
                                                )}
                                            </div>
                                            <footer className={"ix-" + i.state}>{i.archived ? "Archived" : label(i.state)}</footer>
                                        </button>
                                    </article>
                                ))
                            )}
                        </div>
                        <div className="ix-pagination">
                            <button
                                disabled={page === 1 || loading}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                Previous
                            </button>
                            <span>
                                Page {page} of {data?.pages || 1} · {data?.total || 0} items
                            </span>
                            <button
                                disabled={page >= (data?.pages || 1) || loading}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </section>
                    <section
                        className="ix-detail"
                        aria-label="Selected inbox item"
                    >
                        {detailError && !compose && !bulk && (
                            <p
                                role="alert"
                                className="ix-error"
                            >
                                {detailError} <button onClick={reload}>Reload item</button>
                            </p>
                        )}
                        {notice && (
                            <p
                                role="status"
                                className="ix-notice"
                            >
                                {notice}
                            </p>
                        )}
                        {!selected ? (
                            <p className="ix-empty">Select an alert or action to view its details.</p>
                        ) : !item ? (
                            <p className="ix-empty">{detailError ? "Unable to load item." : "Loading details…"}</p>
                        ) : (
                            <>
                                <header>
                                    <Link to={`/admin/clients/${item.clientId}/basic-info`}>{item.clientName}</Link>
                                    <p>{time(item.createdAt)} · UK time</p>
                                    <span className="ix-badge">{label(item.kind)}</span>
                                    <h2>{item.title}</h2>
                                </header>
                                <nav
                                    className="ix-tabs"
                                    aria-label="Incident tabs"
                                >
                                    {["Details", "Comments", "Timeline"].map((t) => (
                                        <button
                                            key={t}
                                            aria-pressed={tab === t}
                                            className={tab === t ? "active" : ""}
                                            onClick={() => setTab(t)}
                                        >
                                            {t}
                                            {t === "Comments" ? " " + detail.comments.length : ""}
                                        </button>
                                    ))}
                                </nav>
                                <div className="ix-detail-body">
                                    {tab === "Details" ? (
                                        <>
                                            <h2>Incident details</h2>
                                            <div className="ix-incident">
                                                <p>{item.body}</p>
                                                {item.visitId && (
                                                    <Link to={`/admin/clients/${item.clientId}/client-feed?visit=${item.visitId}`}>
                                                        View visit details →
                                                    </Link>
                                                )}
                                                <Link to={`/admin/clients/${item.clientId}/client-feed`}>View client care feed →</Link>
                                                {/medicat|\bmar\b/i.test(item.title + " " + item.category) && (
                                                    <Link
                                                        to={`/admin/clients/${item.clientId}/medication/monitoring?month=${new Intl.DateTimeFormat("en-US", { timeZone: "Europe/London", month: "long" }).format(new Date(item.createdAt))}_${new Date(item.createdAt).getUTCFullYear()}`}
                                                    >
                                                        View MAR chart →
                                                    </Link>
                                                )}
                                            </div>
                                            <form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    act(async () => {
                                                        const payload = options.canManage
                                                            ? { ...draft, assignedTo: draft.assignedTo || null, dueDate: draft.dueDate || null }
                                                            : { state: draft.state };
                                                        await _put("/api/inbox/items/" + item.id, { ...payload, revision: item.revision });
                                                    });
                                                }}
                                            >
                                                <fieldset disabled={!detail.canEdit || busy}>
                                                    <Controls
                                                        value={draft}
                                                        set={setDraft}
                                                        people={options.people}
                                                        admin={options.canManage}
                                                    />
                                                    {options.canManage && (
                                                        <label className="ix-archive">
                                                            <input
                                                                type="checkbox"
                                                                checked={draft.archived}
                                                                disabled={draft.state !== "RESOLVED"}
                                                                onChange={(e) => setDraft({ ...draft, archived: e.target.checked })}
                                                            />{" "}
                                                            Archive resolved item
                                                        </label>
                                                    )}
                                                    <button
                                                        className="ix-primary"
                                                        disabled={!canSave || busy}
                                                    >
                                                        Save changes
                                                    </button>
                                                </fieldset>
                                            </form>
                                        </>
                                    ) : tab === "Comments" ? (
                                        <>
                                            <h2>Comments</h2>
                                            {detail.comments.length ? (
                                                detail.comments.map((c) => (
                                                    <article
                                                        className="ix-comment"
                                                        key={c.id}
                                                    >
                                                        <strong>{c.author}</strong>
                                                        <time>{time(c.createdAt)}</time>
                                                        <p>{c.body}</p>
                                                    </article>
                                                ))
                                            ) : (
                                                <p>No comments yet.</p>
                                            )}
                                            <form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    act(async () => {
                                                        await _post("/api/inbox/items/" + item.id + "/comments", { body: comment });
                                                        setComment("");
                                                    });
                                                }}
                                            >
                                                <label>
                                                    Add a comment
                                                    <textarea
                                                        maxLength={6000}
                                                        rows={5}
                                                        value={comment}
                                                        onChange={(e) => setComment(e.target.value)}
                                                        required
                                                    />
                                                </label>
                                                <button
                                                    className="ix-primary"
                                                    disabled={busy || !comment.trim()}
                                                >
                                                    Add comment
                                                </button>
                                            </form>
                                        </>
                                    ) : (
                                        <>
                                            <h2>Timeline</h2>
                                            <ol className="ix-timeline">
                                                {[
                                                    { id: "created", description: "Record created", createdAt: item.createdAt },
                                                    ...detail.events,
                                                    ...detail.history.map((h) => ({
                                                        id: h.id,
                                                        description: `Care record version ${h.revision}: ${h.snapshot.title} — ${h.snapshot.status}`,
                                                        author: h.author,
                                                        createdAt: h.createdAt,
                                                    })),
                                                ]
                                                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                                                    .map((e) => (
                                                        <li key={e.id}>
                                                            <p>{e.description}</p>
                                                            <small>
                                                                {e.author ? e.author + " · " : ""}
                                                                {time(e.createdAt)}
                                                            </small>
                                                        </li>
                                                    ))}
                                            </ol>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </section>
                </>
            )}
            {compose && (
                <div className="ix-overlay">
                    <form
                        role="dialog"
                        aria-modal="true"
                        aria-label="Add inbox item"
                        className="ix-modal"
                        onSubmit={(e) => {
                            e.preventDefault();
                            act(async () => {
                                await _post("/api/inbox/items", {
                                    ...compose,
                                    visitId: compose.visitId || null,
                                    assignedTo: compose.assignedTo || null,
                                    dueDate: compose.dueDate || null,
                                });
                                choose(compose.kind, "OPEN");
                                setCompose(null);
                            });
                        }}
                    >
                        <header>
                            <h2>Add new {label(compose.kind).toLowerCase()}</h2>
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => setCompose(null)}
                            >
                                Cancel
                            </button>
                        </header>
                        {detailError && (
                            <p
                                role="alert"
                                className="ix-error"
                            >
                                {detailError}
                            </p>
                        )}
                        <fieldset disabled={busy}>
                            <div className="ix-form-grid">
                                <Select
                                    title="Type"
                                    value={compose.kind}
                                    onChange={(v) => setCompose({ ...compose, kind: v })}
                                    items={["ALERT", "ACTION"].map((v) => [v, label(v)])}
                                />
                                <Select
                                    title="Client"
                                    value={compose.clientId}
                                    onChange={(v) => setCompose({ ...compose, clientId: v, visitId: "" })}
                                    items={[["", "Choose client"], ...options.clients.map((c) => [c.id, c.name])]}
                                />
                            </div>
                            <Select
                                title="Related visit (optional)"
                                value={compose.visitId}
                                onChange={(v) => setCompose({ ...compose, visitId: v })}
                                items={[["", "No linked visit"], ...visits.map((v) => [v.id, `${v.date} ${v.startTime} · ${v.title}`])]}
                            />
                            <small>Visits within 30 days before or after today.</small>
                            <label>
                                Title
                                <input
                                    maxLength={200}
                                    required
                                    value={compose.title}
                                    onChange={(e) => setCompose({ ...compose, title: e.target.value })}
                                />
                            </label>
                            <label>
                                Incident details
                                <textarea
                                    required
                                    rows={5}
                                    maxLength={20000}
                                    value={compose.body}
                                    onChange={(e) => setCompose({ ...compose, body: e.target.value })}
                                />
                            </label>
                            <Controls
                                value={compose}
                                set={setCompose}
                                people={options.people}
                                creating
                            />
                            <button
                                className="ix-primary"
                                disabled={busy || !compose.clientId}
                            >
                                Create {label(compose.kind).toLowerCase()}
                            </button>
                        </fieldset>
                    </form>
                </div>
            )}
            {bulk && (
                <div className="ix-overlay">
                    <form
                        role="dialog"
                        aria-modal="true"
                        aria-label="Bulk inbox update"
                        className="ix-modal"
                        onSubmit={(e) => {
                            e.preventDefault();
                            act(async () => {
                                await _post("/api/inbox/items/bulk", {
                                    items: selectedRows.map((i) => ({ id: i.id, revision: i.revision })),
                                    changes: bulk,
                                });
                                setBulk(null);
                                setChecked([]);
                            });
                        }}
                    >
                        <header>
                            <h2>Update {selectedRows.length} selected items</h2>
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => setBulk(null)}
                            >
                                Cancel
                            </button>
                        </header>
                        <p>Review the selected items below. If any item has changed, nothing is applied.</p>
                        {detailError && (
                            <p
                                role="alert"
                                className="ix-error"
                            >
                                {detailError}
                            </p>
                        )}
                        <ul>
                            {selectedRows.map((i) => (
                                <li key={i.id}>
                                    {i.clientName} — {i.title}
                                </li>
                            ))}
                        </ul>
                        <Select
                            title="Change"
                            value={Object.keys(bulk)[0]}
                            onChange={(v) => setBulk({ [v]: { state: "RESOLVED", severity: "MEDIUM", assignedTo: null, archived: true }[v] })}
                            items={Object.entries({ state: "Status", severity: "Severity", assignedTo: "Assignment", archived: "Archive / restore" })}
                        />
                        {"state" in bulk ? (
                            <Select
                                title="New status"
                                value={bulk.state}
                                onChange={(v) => setBulk({ state: v })}
                                items={Object.entries(statuses)}
                            />
                        ) : "severity" in bulk ? (
                            <Select
                                title="New severity"
                                value={bulk.severity}
                                onChange={(v) => setBulk({ severity: v })}
                                items={severities.map((v) => [v, label(v)])}
                            />
                        ) : "assignedTo" in bulk ? (
                            <Select
                                title="Assign to"
                                value={bulk.assignedTo || ""}
                                onChange={(v) => setBulk({ assignedTo: v || null })}
                                items={[["", "Unassigned"], ...options.people.map((p) => [p.id, p.name])]}
                            />
                        ) : (
                            <Select
                                title="Archive action"
                                value={String(bulk.archived)}
                                onChange={(v) => setBulk({ archived: v === "true" })}
                                items={[
                                    ["true", "Archive resolved items"],
                                    ["false", "Restore items"],
                                ]}
                            />
                        )}
                        <button
                            className="ix-primary"
                            disabled={busy || !selectedRows.length}
                        >
                            Apply to selected items
                        </button>
                    </form>
                </div>
            )}
        </main>
    );
}
