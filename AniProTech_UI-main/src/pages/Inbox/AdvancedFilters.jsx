import { useEffect, useRef, useState } from "react";
import { _get } from "../../utils/ApiService";
import { emptyFilters, alertTypes } from "./inbox-filter-options";
export default function AdvancedFilters({ value, options, kind, filter, search, severity, onApply, onClose }) {
    const [draft, setDraft] = useState({
            ...value,
            recordKind: value.recordKind || kind,
            states: value.recordKind
                ? value.states
                : value.states || (kind === "ALERT" && ["OPEN", "IN_PROGRESS", "RESOLVED", "ARCHIVED"].includes(filter) ? filter : ""),
            actionStates: value.recordKind
                ? value.actionStates
                : value.actionStates || (kind === "ACTION" && ["OPEN", "IN_PROGRESS", "RESOLVED", "ARCHIVED"].includes(filter) ? filter : ""),
        }),
        [total, setTotal] = useState(null),
        [error, setError] = useState("");
    const dialog = useRef(null);
    const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
    useEffect(() => {
        const before = document.activeElement;
        dialog.current.showModal();
        return () => before?.focus();
    }, []);
    useEffect(() => {
        const c = new AbortController();
        setTotal(null);
        setError("");
        const timer = setTimeout(
            () =>
                _get("/api/inbox/items", { params: { kind, filter, search, severity, ...draft }, signal: c.signal })
                    .then((r) => {
                        if (!c.signal.aborted) setTotal(r.data.results.data.total);
                    })
                    .catch((e) => {
                        if (!c.signal.aborted) setError(e.response?.data?.message || "Unable to preview results");
                    }),
            250,
        );
        return () => {
            clearTimeout(timer);
            c.abort();
        };
    }, [draft, kind, filter, search, severity]);
    const checks = (key, items) => {
        const values = draft[key] ? draft[key].split("|") : [];
        return items.map(([v, n]) => (
            <label
                className="ix-checkbox"
                key={v}
            >
                <input
                    type="checkbox"
                    checked={values.includes(v)}
                    onChange={(e) => set(key, (e.target.checked ? [...values, v] : values.filter((x) => x !== v)).join("|"))}
                />
                {n}
            </label>
        ));
    };
    const dropdown = (key, title, items) => (
        <label>
            {title}
            <select
                aria-label={title}
                value={draft[key]}
                onChange={(e) => set(key, e.target.value)}
            >
                <option value="">All</option>
                {items.map((p) => (
                    <option
                        key={p.id}
                        value={p.id}
                    >
                        {p.name}
                    </option>
                ))}
            </select>
        </label>
    );
    const dates = (a, b, title) => (
        <fieldset>
            <legend>{title}</legend>
            <div className="ix-form-grid">
                <label>
                    From
                    <input
                        aria-label={title + " from"}
                        type="date"
                        value={draft[a]}
                        onChange={(e) => set(a, e.target.value)}
                    />
                </label>
                <label>
                    Until
                    <input
                        aria-label={title + " until"}
                        type="date"
                        value={draft[b]}
                        min={draft[a]}
                        onChange={(e) => set(b, e.target.value)}
                    />
                </label>
            </div>
        </fieldset>
    );
    return (
        <dialog
            ref={dialog}
            className="ix-modal ix-filters"
            onCancel={onClose}
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (total !== null) onApply(draft);
                }}
            >
                <header>
                    <h2>Advanced filters</h2>
                    <button
                        type="button"
                        aria-label="Close filters"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </header>
                <div className="ix-filter-body">
                    <label>
                        Show
                        <select
                            aria-label="Show"
                            value={draft.recordKind}
                            onChange={(e) => set("recordKind", e.target.value)}
                        >
                            <option value="ALERT">Alerts</option>
                            <option value="ACTION">Actions</option>
                            <option value="ALL">Alerts and actions</option>
                        </select>
                    </label>
                    {dates("from", "to", "Date range")}
                    <div className="ix-form-grid">
                        {dropdown(
                            "group",
                            "Groups",
                            (options.groups || []).map((g) => ({ id: g, name: g })),
                        )}
                        {dropdown("clientId", "Clients", options.clients)}
                        {dropdown("carerId", "Carers", options.people)}
                    </div>
                    {draft.recordKind !== "ACTION" && (
                        <section>
                            <h3>Alerts</h3>
                            <p>
                                Choose multiple options. Empty status selections include all active records. Select Archived to include archived
                                records.
                            </p>
                            <button
                                type="button"
                                onClick={() => setDraft((d) => ({ ...d, states: "", levels: "", types: "" }))}
                            >
                                All alerts
                            </button>
                            <div className="ix-form-grid">
                                <fieldset>
                                    <legend>Alert status</legend>
                                    {checks("states", [
                                        ["OPEN", "Action needed"],
                                        ["IN_PROGRESS", "In progress"],
                                        ["RESOLVED", "Resolved"],
                                        ["ARCHIVED", "Archived"],
                                    ])}
                                </fieldset>
                                <fieldset>
                                    <legend>Severity</legend>
                                    {checks(
                                        "levels",
                                        ["UNDEFINED", "LOW", "MEDIUM", "HIGH", "CRITICAL"].map((v) => [v, v[0] + v.slice(1).toLowerCase()]),
                                    )}
                                </fieldset>
                            </div>
                            {draft.recordKind !== "ACTION" && (
                                <div className="ix-form-grid">
                                    {Object.entries(alertTypes).map(([title, items]) => (
                                        <fieldset key={title}>
                                            <legend>{title}</legend>
                                            {checks(
                                                "types",
                                                items.map((v) => [v, v]),
                                            )}
                                        </fieldset>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}
                    <section>
                        <h3>Actions and assignment</h3>
                        {draft.recordKind !== "ALERT" && (
                            <fieldset>
                                <legend>Action status</legend>
                                {checks("actionStates", [
                                    ["OPEN", "To do"],
                                    ["IN_PROGRESS", "In progress"],
                                    ["RESOLVED", "Completed"],
                                    ["ARCHIVED", "Archived"],
                                ])}
                            </fieldset>
                        )}
                        <p>Assignee and due dates apply to all selected records.</p>
                        {dropdown("assignedTo", "Assignee", [{ id: "UNASSIGNED", name: "Unassigned" }, ...options.people])}
                        {dates("dueFrom", "dueTo", "Due date")}
                        <label className="ix-checkbox">
                            <input
                                type="checkbox"
                                checked={draft.overdue === "true"}
                                onChange={(e) => set("overdue", String(e.target.checked))}
                            />
                            Overdue only
                        </label>
                    </section>
                    {error && (
                        <p
                            role="alert"
                            className="ix-error"
                        >
                            {error}
                        </p>
                    )}
                </div>
                <footer>
                    <button
                        type="button"
                        onClick={() => setDraft({ ...emptyFilters, recordKind: "ALL", actionStates: "" })}
                    >
                        Clear all
                    </button>
                    <button
                        className="ix-primary"
                        disabled={total === null}
                    >
                        Show {total === null ? "…" : total} results
                    </button>
                </footer>
            </form>
        </dialog>
    );
}
