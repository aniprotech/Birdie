import ScheduleForm from "./ScheduleTaskForm";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { _get, _post, _put, _delete } from "../../../../utils/ApiService";
import { useGlobalStore } from "../../../../stores/useGlobalStore";
import "./task-planner.css";
const pretty = (value) =>
    String(value || "")
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/^./, (c) => c.toUpperCase());
const message = (e) => e.response?.data?.message || "Unable to save. Please try again.";
const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const londonToday = () =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const date = (value) =>
    value
        ? new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" }).format(new Date(value))
        : "No end date";
const cadence = (t) => (t.frequency === "CUSTOM" ? `Every ${t.repeatEvery} ${pretty(t.repeatUnit)}` : pretty(t.frequency));

function TemplateForm({ initial, categories, onClose, onSave, onCategory }) {
    const [v, set] = useState(initial),
        [busy, setBusy] = useState(false),
        [error, setError] = useState(""),
        [newCategory, setNewCategory] = useState(""),
        [useNow, setUseNow] = useState(!initial.id);
    return (
        <div className="tp-overlay tp-front">
            <form
                className="tp-modal"
                onSubmit={async (e) => {
                    e.preventDefault();
                    setError("");
                    setBusy(true);
                    try {
                        await onSave(v, useNow);
                    } catch (e) {
                        setError(message(e));
                    } finally {
                        setBusy(false);
                    }
                }}
            >
                <header>
                    <h2>{v.id ? "Edit shared task" : "Create reusable task"}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close shared task"
                    >
                        ×
                    </button>
                </header>
                <p className="tp-muted">
                    Available to staff in your organisation. Use general wording here; keep client names, access codes and personal details in the
                    client-specific instructions.
                </p>
                <label>
                    Task name
                    <input
                        autoFocus
                        required
                        minLength={2}
                        maxLength={200}
                        value={v.name}
                        onChange={(e) => set({ ...v, name: e.target.value })}
                    />
                </label>
                <label>
                    Category
                    <select
                        aria-label="Category"
                        required
                        value={v.categoryId}
                        onChange={(e) => set({ ...v, categoryId: e.target.value })}
                    >
                        <option value="">Choose a category</option>
                        {categories.map((c) => (
                            <option
                                key={c.id}
                                value={c.id}
                            >
                                {c.name}
                            </option>
                        ))}
                    </select>
                </label>
                <details>
                    <summary>Add your own category</summary>
                    <label>
                        New category name
                        <input
                            maxLength={100}
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                        />
                    </label>
                    <button
                        type="button"
                        disabled={busy || newCategory.trim().length < 2}
                        onClick={async () => {
                            setBusy(true);
                            setError("");
                            try {
                                const c = await onCategory(newCategory);
                                set({ ...v, categoryId: c.id });
                                setNewCategory("");
                            } catch (e) {
                                setError(message(e));
                            } finally {
                                setBusy(false);
                            }
                        }}
                    >
                        Save category
                    </button>
                </details>
                <label>
                    Reusable instructions (optional)
                    <textarea
                        rows={6}
                        maxLength={8000}
                        value={v.description}
                        onChange={(e) => set({ ...v, description: e.target.value })}
                    />
                </label>
                <label className="tp-check">
                    <input
                        type="checkbox"
                        checked={useNow}
                        onChange={(e) => setUseNow(e.target.checked)}
                    />
                    Schedule this task for the current client after saving
                </label>
                <p className="tp-muted">Updating the library will not change tasks already scheduled for clients.</p>
                {error && (
                    <p
                        role="alert"
                        className="tp-error"
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
                        className="tp-primary"
                        disabled={busy}
                    >
                        {busy ? "Saving…" : "Save shared task"}
                    </button>
                </footer>
            </form>
        </div>
    );
}
export default function SharedTaskPlanner() {
    const { id } = useParams(),
        { clientsPersonalDetailData } = useGlobalStore();
    const [plans, setPlans] = useState([]),
        [total, setTotal] = useState(0),
        [page, setPage] = useState(1),
        [sort, setSort] = useState("ASC"),
        [query, setQuery] = useState(""),
        [loading, setLoading] = useState(false),
        [error, setError] = useState(""),
        [version, setVersion] = useState(0),
        [drawer, setDrawer] = useState(false),
        [library, setLibrary] = useState({ categories: [], tasks: [], totalCount: 0, totalLibraryCount: 0 }),
        [libraryPage, setLibraryPage] = useState(1),
        [category, setCategory] = useState(""),
        [search, setSearch] = useState(""),
        [archived, setArchived] = useState(false),
        [libraryLoading, setLibraryLoading] = useState(false),
        [libraryError, setLibraryError] = useState(""),
        [template, setTemplate] = useState(null),
        [schedule, setSchedule] = useState(null),
        [pendingDelete, setPendingDelete] = useState(null),
        [busy, setBusy] = useState(false),
        [notice, setNotice] = useState("");
    useEffect(() => {
        setPage(1);
        setDrawer(false);
        setSchedule(null);
        setTemplate(null);
        setPendingDelete(null);
    }, [id]);
    useEffect(() => {
        const c = new AbortController();
        setLoading(true);
        setError("");
        const timer = setTimeout(
            () =>
                _get(`/api/client-task-plan/getByClient/${id}`, { params: { page, size: 20, search: query, task: sort }, signal: c.signal })
                    .then((r) => {
                        if (!c.signal.aborted) {
                            setPlans(r.data.results.data.taskPlans);
                            setTotal(r.data.results.data.totalCount);
                        }
                    })
                    .catch((e) => {
                        if (!c.signal.aborted) setError(message(e));
                    })
                    .finally(() => {
                        if (!c.signal.aborted) setLoading(false);
                    }),
            200,
        );
        return () => {
            clearTimeout(timer);
            c.abort();
        };
    }, [id, page, query, sort, version]);
    useEffect(() => {
        if (!drawer) return;
        const c = new AbortController();
        setLibraryLoading(true);
        setLibraryError("");
        const timer = setTimeout(
            () =>
                _get("/api/task-library", { params: { page: libraryPage, category: category || undefined, search, archived }, signal: c.signal })
                    .then((r) => {
                        if (!c.signal.aborted) setLibrary(r.data.results.data);
                    })
                    .catch((e) => {
                        if (!c.signal.aborted) setLibraryError(message(e));
                    })
                    .finally(() => {
                        if (!c.signal.aborted) setLibraryLoading(false);
                    }),
            200,
        );
        return () => {
            clearTimeout(timer);
            c.abort();
        };
    }, [drawer, libraryPage, category, search, archived, version]);
    const reload = () => setVersion((v) => v + 1);
    const selectTask = (t) => {
        setSchedule({
            taskId: t.id,
            taskName: t.name,
            details: t.description || "",
            isEssential: false,
            frequency: "DAILY",
            selectedDays: [],
            sessions: [],
            isAnyTime: true,
            timesPerDay: 1,
            repeatEvery: 1,
            repeatUnit: "WEEKS",
            startDate: londonToday(),
            endDate: "",
        });
        setDrawer(false);
    };
    const saveSchedule = async (v) => {
        const body = {
            userId: id,
            taskId: v.taskId,
            details: v.details,
            isEssential: v.isEssential,
            frequency: v.frequency,
            selectedDays: v.frequency === "DAILY" ? [] : v.selectedDays,
            repeatEvery: v.repeatEvery,
            repeatUnit: v.repeatUnit,
            isAnyTime: v.isAnyTime,
            sessions: v.isAnyTime ? [] : v.sessions,
            timesPerDay: v.timesPerDay,
            startDate: v.startDate,
            endDate: v.endDate || null,
            revision: v.revision,
        };
        await (v.id ? _put(`/api/client-task-plan/update/${v.id}`, body) : _post("/api/client-task-plan/create", body));
        setSchedule(null);
        setNotice("Client task saved.");
        reload();
    };
    return (
        <div className="task-planner">
            <header className="tp-header">
                <div>
                    <h1>Manage {clientsPersonalDetailData?.firstName || "client"}’s tasks</h1>
                    <p>Choose a preset or create a reusable task for your organisation.</p>
                </div>
                <button
                    className="tp-primary"
                    onClick={() => {
                        setDrawer(true);
                        setNotice("");
                    }}
                >
                    Add task
                </button>
            </header>
            {notice && (
                <p
                    role="status"
                    className="tp-notice"
                >
                    {notice}
                </p>
            )}
            {error && (
                <p
                    role="alert"
                    className="tp-error"
                >
                    {error} <button onClick={reload}>Retry</button>
                </p>
            )}
            <div className="tp-toolbar">
                <label>
                    Search client tasks
                    <input
                        placeholder="Search tasks and instructions"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setPage(1);
                        }}
                    />
                </label>
                <span>{total} tasks added</span>
            </div>
            <div className="tp-table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>
                                <button
                                    onClick={() => {
                                        setSort((s) => (s === "ASC" ? "DESC" : "ASC"));
                                        setPage(1);
                                    }}
                                >
                                    Task {sort === "ASC" ? "↑" : "↓"}
                                </button>
                            </th>
                            <th>Cadence</th>
                            <th>When</th>
                            <th>Frequency</th>
                            <th>From → Until</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6}>Loading tasks…</td>
                            </tr>
                        ) : plans.length ? (
                            plans.map((t) => (
                                <tr key={t.id}>
                                    <td>
                                        <strong>{t.taskName}</strong>
                                        {t.isEssential && <span className="tp-tag">Essential</span>}
                                        <small>{t.categoryName}</small>
                                        {t.details && (
                                            <details>
                                                <summary>Client instructions</summary>
                                                <p className="tp-text">{t.details}</p>
                                            </details>
                                        )}
                                    </td>
                                    <td>
                                        {cadence(t)}
                                        {t.selectedDays?.length > 0 && (
                                            <small>
                                                {days
                                                    .filter((d) => t.selectedDays.includes(d))
                                                    .map(pretty)
                                                    .join(", ")}
                                            </small>
                                        )}
                                    </td>
                                    <td>{t.isAnyTime ? "Any time" : t.sessions?.map(pretty).join(", ")}</td>
                                    <td>
                                        {t.timesPerDay || t.sessions?.length || 1} time{(t.timesPerDay || t.sessions?.length || 1) !== 1 ? "s" : ""}{" "}
                                        per day
                                    </td>
                                    <td>
                                        {date(t.startDate)}
                                        <small>→ {date(t.endDate)}</small>
                                    </td>
                                    <td>
                                        {t.canEdit ? (
                                            <div className="tp-actions">
                                                <button
                                                    onClick={() =>
                                                        setSchedule({
                                                            ...t,
                                                            taskName: t.taskName,
                                                            repeatEvery: t.repeatEvery || 1,
                                                            repeatUnit: t.repeatUnit || "WEEKS",
                                                            timesPerDay: t.timesPerDay || 1,
                                                            sessions: t.sessions || [],
                                                            selectedDays: t.selectedDays || [],
                                                            isEssential: !!t.isEssential,
                                                        })
                                                    }
                                                >
                                                    Edit
                                                </button>
                                                <button onClick={() => setPendingDelete(t)}>Remove</button>
                                            </div>
                                        ) : (
                                            <span>View only</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6}>No tasks found. Choose Add task to get started.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <footer>
                <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                >
                    Previous
                </button>
                <span>
                    Page {page} of {Math.max(1, Math.ceil(total / 20))}
                </span>
                <button
                    disabled={page * 20 >= total}
                    onClick={() => setPage((p) => p + 1)}
                >
                    Next
                </button>
            </footer>
            {drawer && (
                <div className="tp-overlay">
                    <aside
                        className="tp-drawer"
                        aria-label="Task library"
                    >
                        <header>
                            <h2>Add a new task</h2>
                            <button
                                onClick={() => setDrawer(false)}
                                aria-label="Close task library"
                            >
                                ×
                            </button>
                        </header>
                        <div className="tp-library-controls">
                            <label>
                                Search shared tasks
                                <input
                                    autoFocus
                                    placeholder={`Search ${library.totalLibraryCount} task options`}
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setLibraryPage(1);
                                    }}
                                />
                            </label>
                            <div className="tp-chips">
                                <button
                                    aria-pressed={!category}
                                    onClick={() => {
                                        setCategory("");
                                        setLibraryPage(1);
                                    }}
                                >
                                    All categories
                                </button>
                                {library.categories.map((c) => (
                                    <button
                                        className={category === c.id ? "selected" : ""}
                                        aria-pressed={category === c.id}
                                        key={c.id}
                                        onClick={() => {
                                            setCategory(category === c.id ? "" : c.id);
                                            setLibraryPage(1);
                                        }}
                                    >
                                        {c.name} <span>{c.count}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="tp-toolbar">
                                <button
                                    className="tp-primary"
                                    onClick={() => setTemplate({ name: "", description: "", categoryId: category })}
                                >
                                    Create reusable task
                                </button>
                                <label className="tp-check">
                                    <input
                                        type="checkbox"
                                        checked={archived}
                                        onChange={(e) => {
                                            setArchived(e.target.checked);
                                            setLibraryPage(1);
                                        }}
                                    />
                                    Include archived
                                </label>
                            </div>
                            <p className="tp-muted">{library.totalCount} matching options · shared within your organisation</p>
                        </div>
                        <div className="tp-library-list">
                            {libraryError && (
                                <p
                                    role="alert"
                                    className="tp-error"
                                >
                                    {libraryError}
                                </p>
                            )}
                            {libraryLoading ? (
                                <p>Loading task options…</p>
                            ) : library.tasks.length ? (
                                library.tasks.map((t) => (
                                    <article key={t.id}>
                                        <div>
                                            <h3>{t.name}</h3>
                                            <small>
                                                {library.categories.find((c) => c.id === t.clientTaskCategory)?.name} · {t.source}
                                                {t.archived ? " · Archived" : ""}
                                            </small>
                                            {t.description && <p className="tp-text">{t.description}</p>}
                                        </div>
                                        <div className="tp-actions">
                                            {!t.archived && (
                                                <button
                                                    aria-label={`Use ${t.name}`}
                                                    onClick={() => selectTask(t)}
                                                >
                                                    Use +
                                                </button>
                                            )}
                                            {t.canEdit && (
                                                <>
                                                    <button
                                                        aria-label={`Edit ${t.name}`}
                                                        onClick={() =>
                                                            setTemplate({ ...t, categoryId: t.clientTaskCategory, description: t.description || "" })
                                                        }
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        disabled={busy}
                                                        onClick={async () => {
                                                            setBusy(true);
                                                            setLibraryError("");
                                                            try {
                                                                await _put(`/api/task-library/tasks/${t.id}/archive`, {
                                                                    archived: !t.archived,
                                                                    revision: t.revision,
                                                                });
                                                                reload();
                                                            } catch (e) {
                                                                setLibraryError(message(e));
                                                            } finally {
                                                                setBusy(false);
                                                            }
                                                        }}
                                                    >
                                                        {t.archived ? "Restore" : "Archive"}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <p>No matching options. Create a reusable task to add one.</p>
                            )}
                        </div>
                        <footer>
                            <button
                                disabled={libraryPage === 1}
                                onClick={() => setLibraryPage((p) => p - 1)}
                            >
                                Previous
                            </button>
                            <span>
                                {libraryPage} / {Math.max(1, Math.ceil(library.totalCount / 40))}
                            </span>
                            <button
                                disabled={libraryPage * 40 >= library.totalCount}
                                onClick={() => setLibraryPage((p) => p + 1)}
                            >
                                Next
                            </button>
                        </footer>
                    </aside>
                </div>
            )}
            {template && (
                <TemplateForm
                    initial={template}
                    categories={library.categories}
                    onClose={() => setTemplate(null)}
                    onCategory={async (name) => {
                        const c = (await _post("/api/task-library/categories", { name })).data.results.data;
                        setLibrary((l) => ({ ...l, categories: [...l.categories, c] }));
                        return c;
                    }}
                    onSave={async (v, useNow) => {
                        const body = { name: v.name, description: v.description, categoryId: v.categoryId, revision: v.revision };
                        const t = (await (v.id ? _put(`/api/task-library/tasks/${v.id}`, body) : _post("/api/task-library/tasks", body))).data.results
                            .data;
                        setTemplate(null);
                        reload();
                        if (useNow) selectTask(t);
                        else setNotice("Shared task saved for staff to reuse.");
                    }}
                />
            )}
            {schedule && (
                <ScheduleForm
                    initial={schedule}
                    onClose={() => setSchedule(null)}
                    onSave={saveSchedule}
                />
            )}
            {pendingDelete && (
                <div className="tp-overlay">
                    <section
                        className="tp-modal"
                        role="dialog"
                        aria-label="Remove client task"
                    >
                        <h2>Remove {pendingDelete.taskName} from this client?</h2>
                        <p>The shared task remains available to everyone in the organisation.</p>
                        <footer>
                            <button
                                disabled={busy}
                                onClick={() => setPendingDelete(null)}
                            >
                                Cancel
                            </button>
                            <button
                                disabled={busy}
                                onClick={async () => {
                                    setBusy(true);
                                    try {
                                        await _delete(`/api/client-task-plan/delete/${pendingDelete.id}`);
                                        setPendingDelete(null);
                                        setNotice("Client task removed. The shared task is still available.");
                                        reload();
                                    } catch (e) {
                                        setError(message(e));
                                        setPendingDelete(null);
                                    } finally {
                                        setBusy(false);
                                    }
                                }}
                            >
                                Remove client task
                            </button>
                        </footer>
                    </section>
                </div>
            )}
        </div>
    );
}
