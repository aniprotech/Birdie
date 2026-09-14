import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { _get, _post, _put, _delete } from "../../../../utils/ApiService";
import "./time-off.css";
import HolidayYearPicker from "./HolidayYearPicker";
const types = [
    "ANNUAL_LEAVE",
    "APPOINTMENT",
    "COMPASSIONATE_LEAVE",
    "DEPENDENT_LEAVE",
    "JURY_DUTY",
    "MATERNITY_PATERNITY_LEAVE",
    "SELF_ISOLATIONG",
    "SICK_LEAVE",
    "OTHERS",
];
const label = (v) =>
    v === "SELF_ISOLATIONG"
        ? "Self isolation"
        : v
              .toLowerCase()
              .replaceAll("_", " ")
              .replace(/^./, (c) => c.toUpperCase());
const today = () =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const date = (v) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(v));
export default function TimeOff() {
    const { id } = useParams(),
        current = Number(today().slice(0, 4));
    const [year, setYear] = useState(current),
        [data, setData] = useState(null),
        [error, setError] = useState(""),
        [notice, setNotice] = useState(""),
        [refresh, setRefresh] = useState(0),
        [dialog, setDialog] = useState(null),
        [busy, setBusy] = useState(false),
        [draft, setDraft] = useState({}),
        [cancel, setCancel] = useState(null);
    const [yearSettings, setYearSettings] = useState(null);
    useEffect(() => {
        const c = new AbortController();
        setData(null);
        setError("");
        _get("/api/team/" + id + "/time-off", { params: { year }, signal: c.signal })
            .then((r) => {
                if (!c.signal.aborted) {
                    setData(r.data.results.data);
                    setYearSettings(r.data.results.data.settings);
                }
            })
            .catch((e) => {
                if (!c.signal.aborted) setError(e.response?.data?.message || "Unable to load time off");
            });
        return () => c.abort();
    }, [id, year, refresh]);
    useEffect(() => {
        setDialog(null);
        setCancel(null);
        setNotice("");
        setYear(current);
        setYearSettings(null);
    }, [id, current]);
    const close = () => {
        setDialog(null);
        setCancel(null);
        setError("");
    };
    const open = (key) => {
        setError("");
        setDialog(key);
        setDraft(
            key === "settings"
                ? { month: data.settings?.month || 1, day: data.settings?.day || 1 }
                : { startDate: today(), endDate: today(), startTime: "09:00", endTime: "17:00", allDay: true, type: "ANNUAL_LEAVE", reason: "" },
        );
    };
    const update = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
    const save = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
            if (cancel) {
                await _delete("/api/team-absence/delete/" + cancel.id);
                setNotice("Time off cancelled. The record remains in history.");
            } else if (dialog === "settings") {
                await _put("/api/team/holiday-year", draft);
                setNotice("Holiday year saved for the agency.");
            } else {
                await _post("/api/team-absence/create/" + id, {
                    startDate: draft.startDate,
                    endDate: draft.endDate,
                    startTime: draft.allDay ? "00:00:00" : draft.startTime + ":00",
                    endTime: draft.allDay ? "23:59:59" : draft.endTime + ":00",
                    type: draft.type,
                    reason: draft.reason,
                });
                setNotice("Time off booked.");
                const suffix = String(data.settings?.month || 1).padStart(2, "0") + "-" + String(data.settings?.day || 1).padStart(2, "0");
                setYear(Number(draft.startDate.slice(0, 4)) - (draft.startDate.slice(5) < suffix ? 1 : 0));
            }
            close();
            setRefresh((x) => x + 1);
        } catch (e) {
            setError(e.response?.data?.message || "Unable to save time off");
        } finally {
            setBusy(false);
        }
    };
    return (
        <main className="time-off">
            <div className="to-content">
                <header>
                    <h1>Time off</h1>
                    <HolidayYearPicker
                        year={year}
                        onChange={setYear}
                        settings={yearSettings}
                        today={today()}
                        disabled={!data}
                    />
                </header>
                {error && (
                    <p
                        role="alert"
                        className="to-error"
                    >
                        {error}
                    </p>
                )}
                {notice && (
                    <p
                        role="status"
                        className="to-notice"
                    >
                        {notice}
                    </p>
                )}
                {!data ? (
                    <button onClick={() => setRefresh((x) => x + 1)}>Reload time off</button>
                ) : (
                    <>
                        {!data.settings && (
                            <div className="to-warning">
                                No holiday year has been set for your agency.{" "}
                                {data.canManage ? (
                                    <button onClick={() => open("settings")}>Set holiday year</button>
                                ) : (
                                    "Ask an administrator to set the holiday year."
                                )}
                            </div>
                        )}
                        <div className="to-toolbar">
                            {data.canManage && <button onClick={() => open("book")}>Book time off</button>}
                            {data.canManage && data.settings && <button onClick={() => open("settings")}>Holiday year settings</button>}
                            <span>Europe/London</span>
                        </div>
                        <section>
                            <h2>
                                {date(data.start)} – {date(data.end)}
                            </h2>
                        </section>
                        {[
                            ["UPCOMING", "Upcoming time off", "No upcoming time off"],
                            ["TAKEN", "Days taken", "No days taken"],
                            ["CANCELLED", "Cancelled time off", "No cancelled time off"],
                        ].map(([status, title, empty]) => (
                            <section key={status}>
                                <h2>
                                    {title}{" "}
                                    <span
                                        className="to-count"
                                        aria-label="Booking count"
                                    >
                                        {data.entries.filter((x) => x.status === status).length}
                                    </span>
                                </h2>
                                {data.entries.filter((x) => x.status === status).length ? (
                                    data.entries
                                        .filter((x) => x.status === status)
                                        .map((x) => (
                                            <article key={x.id}>
                                                <strong>{label(x.type || "OTHERS")}</strong>
                                                <p>
                                                    {date(x.startDate)} – {date(x.endDate)}
                                                </p>
                                                <p>
                                                    {x.startTime?.slice(0, 5)} – {x.endTime?.slice(0, 5)} (UK)
                                                </p>
                                                {x.reason && <p className="to-reason">{x.reason}</p>}
                                                {x.cancelledAt && <small>Cancelled {date(x.cancelledAt)}</small>}
                                                {data.canManage && status !== "CANCELLED" && (
                                                    <button
                                                        onClick={() => {
                                                            setCancel(x);
                                                            setError("");
                                                        }}
                                                    >
                                                        Cancel time off
                                                    </button>
                                                )}
                                            </article>
                                        ))
                                ) : (
                                    <p>{empty}</p>
                                )}
                            </section>
                        ))}
                    </>
                )}
                {(dialog || cancel) && (
                    <div className="to-overlay">
                        <form
                            onSubmit={save}
                            role="dialog"
                            aria-modal="true"
                            aria-label={cancel ? "Cancel time off" : dialog === "settings" ? "Holiday year settings" : "Book time off"}
                        >
                            <h2>{cancel ? "Cancel time off" : dialog === "settings" ? "Holiday year settings" : "Book time off"}</h2>
                            {cancel ? (
                                <p>
                                    Cancel {label(cancel.type || "OTHERS")} from {date(cancel.startDate)} to {date(cancel.endDate)}? This releases the
                                    absence from roster checks and retains its history.
                                </p>
                            ) : dialog === "settings" ? (
                                <>
                                    <p>Applies to every team member in this agency. Existing bookings stay on their original dates.</p>
                                    <label>
                                        Start month
                                        <select
                                            aria-label="Start month"
                                            value={draft.month}
                                            onChange={(e) => update("month", Number(e.target.value))}
                                        >
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <option
                                                    key={i}
                                                    value={i + 1}
                                                >
                                                    {new Intl.DateTimeFormat("en-GB", { month: "long" }).format(new Date(2025, i, 1))}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label>
                                        Start day
                                        <input
                                            type="number"
                                            min="1"
                                            max="31"
                                            required
                                            value={draft.day}
                                            onChange={(e) => update("day", Number(e.target.value))}
                                        />
                                    </label>
                                </>
                            ) : (
                                <>
                                    <label>
                                        Time-off type
                                        <select
                                            aria-label="Time-off type"
                                            value={draft.type}
                                            onChange={(e) => update("type", e.target.value)}
                                        >
                                            {types.map((t) => (
                                                <option
                                                    key={t}
                                                    value={t}
                                                >
                                                    {label(t)}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label>
                                        Start date
                                        <input
                                            required
                                            type="date"
                                            value={draft.startDate}
                                            onChange={(e) => update("startDate", e.target.value)}
                                        />
                                    </label>
                                    <label>
                                        End date
                                        <input
                                            required
                                            type="date"
                                            min={draft.startDate}
                                            value={draft.endDate}
                                            onChange={(e) => update("endDate", e.target.value)}
                                        />
                                    </label>
                                    <label className="to-check">
                                        <input
                                            type="checkbox"
                                            checked={draft.allDay}
                                            onChange={(e) => update("allDay", e.target.checked)}
                                        />
                                        All day
                                    </label>
                                    {!draft.allDay && (
                                        <>
                                            <label>
                                                Start time (UK)
                                                <input
                                                    type="time"
                                                    required
                                                    value={draft.startTime}
                                                    onChange={(e) => update("startTime", e.target.value)}
                                                />
                                            </label>
                                            <label>
                                                End time (UK)
                                                <input
                                                    type="time"
                                                    required
                                                    value={draft.endTime}
                                                    onChange={(e) => update("endTime", e.target.value)}
                                                />
                                            </label>
                                        </>
                                    )}
                                    <label>
                                        Reason (optional)
                                        <textarea
                                            maxLength={4000}
                                            value={draft.reason}
                                            onChange={(e) => update("reason", e.target.value)}
                                        />
                                    </label>
                                    <p>Reassign or cancel conflicting roster visits before booking time off.</p>
                                </>
                            )}
                            {error && (
                                <p
                                    role="alert"
                                    className="to-error"
                                >
                                    {error}
                                </p>
                            )}
                            <footer>
                                <button
                                    type="button"
                                    disabled={busy}
                                    onClick={close}
                                >
                                    Back
                                </button>
                                <button
                                    className="to-primary"
                                    disabled={busy}
                                >
                                    {busy ? "Saving…" : cancel ? "Confirm cancellation" : dialog === "settings" ? "Save settings" : "Book time off"}
                                </button>
                            </footer>
                        </form>
                    </div>
                )}
            </div>
        </main>
    );
}
