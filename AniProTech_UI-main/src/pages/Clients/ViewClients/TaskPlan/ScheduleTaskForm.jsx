import { useEffect, useRef, useState } from "react";

const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const sessions = ["NIGHT", "MORNING", "LUNCH", "AFTERNOON", "EVENING"];
const pretty = (value) => value.charAt(0) + value.slice(1).toLowerCase();

export default function ScheduleTaskForm({ initial, onClose, onSave }) {
    const [v, set] = useState(initial);
    const [endsOn, setEndsOn] = useState(Boolean(initial.endDate));
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const formRef = useRef(null);
    const change = (key, value) => {
        setError("");
        set((current) => ({ ...current, [key]: value }));
    };
    const toggle = (key, value) => {
        setError("");
        set((current) => ({
            ...current,
            [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value],
        }));
    };
    const weekly = v.frequency === "WEEKLY" || (v.frequency === "CUSTOM" && v.repeatUnit === "WEEKS");

    useEffect(() => {
        const previous = document.activeElement;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        formRef.current?.focus();
        return () => {
            document.body.style.overflow = overflow;
            previous?.focus?.();
        };
    }, []);

    return (
        <div className="tp-overlay tp-schedule-overlay">
            <form
                ref={formRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="tp-schedule-title"
                className="tp-schedule-drawer"
                onKeyDown={(event) => {
                    if (event.key === "Escape" && !busy) {
                        event.preventDefault();
                        onClose();
                    }
                    if (event.key === "Tab") {
                        const controls = [
                            ...formRef.current.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea, select, [tabindex="0"]'),
                        ];
                        const first = controls[0],
                            last = controls.at(-1);
                        if (event.shiftKey && (document.activeElement === first || document.activeElement === formRef.current)) {
                            event.preventDefault();
                            last?.focus();
                        } else if (!event.shiftKey && document.activeElement === last) {
                            event.preventDefault();
                            first?.focus();
                        }
                    }
                }}
                onSubmit={async (event) => {
                    event.preventDefault();
                    setError("");
                    if (weekly && !v.selectedDays.length) return setError("Select at least one weekday.");
                    if (!v.isAnyTime && !v.sessions.length) return setError("Select at least one session.");
                    if (endsOn && (!v.endDate || v.endDate < v.startDate)) return setError("Choose an end date on or after the start date.");
                    setBusy(true);
                    try {
                        await onSave({ ...v, endDate: endsOn ? v.endDate : null });
                    } catch (e) {
                        setError(e.response?.data?.message || "Unable to save. Please try again.");
                    } finally {
                        setBusy(false);
                    }
                }}
            >
                <header>
                    <h2 id="tp-schedule-title">{v.id ? "Edit task" : "Add a new task"}</h2>
                    <button
                        type="button"
                        disabled={busy}
                        onClick={onClose}
                        aria-label="Close schedule"
                    >
                        ×
                    </button>
                </header>
                <div className="tp-schedule-body">
                    <h3>{v.taskName}</h3>
                    <label className="tp-schedule-notes">
                        Add details <span className="tp-optional">(optional)</span>
                        <small>Carers will see this each time the task is viewed</small>
                        <textarea
                            aria-label="Client-specific instructions"
                            rows={5}
                            maxLength={20000}
                            placeholder="Add your notes here"
                            value={v.details || ""}
                            onChange={(event) => change("details", event.target.value)}
                        />
                    </label>
                    <label className="tp-check tp-essential">
                        <input
                            type="checkbox"
                            checked={v.isEssential}
                            onChange={(event) => change("isEssential", event.target.checked)}
                        />
                        <span>
                            Mark as essential<small>Highlight this task as essential for carers.</small>
                        </span>
                    </label>
                    <fieldset>
                        <legend>
                            Select frequency <span className="tp-required">*</span>
                        </legend>
                        <div
                            className="tp-segments"
                            role="group"
                            aria-label="Select frequency"
                        >
                            {["DAILY", "WEEKLY", "CUSTOM"].map((frequency) => (
                                <button
                                    type="button"
                                    key={frequency}
                                    aria-pressed={v.frequency === frequency}
                                    onClick={() => change("frequency", frequency)}
                                >
                                    {pretty(frequency)}
                                </button>
                            ))}
                        </div>
                    </fieldset>
                    {v.frequency === "CUSTOM" && (
                        <div className="tp-form-grid">
                            <label>
                                Repeat every
                                <input
                                    type="number"
                                    min={1}
                                    max={365}
                                    required
                                    value={v.repeatEvery}
                                    onChange={(event) => change("repeatEvery", Number(event.target.value))}
                                />
                            </label>
                            <label>
                                Unit
                                <select
                                    aria-label="Unit"
                                    value={v.repeatUnit}
                                    onChange={(event) => change("repeatUnit", event.target.value)}
                                >
                                    <option value="DAYS">Days</option>
                                    <option value="WEEKS">Weeks</option>
                                </select>
                            </label>
                        </div>
                    )}
                    {weekly && (
                        <fieldset>
                            <legend>
                                Weekdays <span className="tp-required">*</span>
                            </legend>
                            <div
                                className="tp-segments tp-weekdays"
                                role="group"
                                aria-label="Weekdays"
                            >
                                {days.map((day) => (
                                    <button
                                        type="button"
                                        key={day}
                                        aria-label={pretty(day)}
                                        aria-pressed={v.selectedDays.includes(day)}
                                        onClick={() => toggle("selectedDays", day)}
                                    >
                                        {pretty(day).slice(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </fieldset>
                    )}
                    <fieldset>
                        <legend>
                            Select time <span className="tp-required">*</span>
                        </legend>
                        <label className="tp-check">
                            <input
                                type="radio"
                                name="task-time"
                                checked={v.isAnyTime}
                                onChange={() => change("isAnyTime", true)}
                            />
                            Anytime
                        </label>
                        <label className="tp-check">
                            <input
                                type="radio"
                                name="task-time"
                                checked={!v.isAnyTime}
                                onChange={() => change("isAnyTime", false)}
                            />
                            Sessions
                        </label>
                        {!v.isAnyTime && (
                            <div
                                className="tp-segments"
                                role="group"
                                aria-label="Sessions"
                            >
                                {sessions.map((session) => (
                                    <button
                                        type="button"
                                        key={session}
                                        aria-pressed={v.sessions.includes(session)}
                                        onClick={() => toggle("sessions", session)}
                                    >
                                        {pretty(session)}
                                    </button>
                                ))}
                            </div>
                        )}
                        {v.isAnyTime && (
                            <label className="tp-occurrences">
                                Times per day
                                <input
                                    type="number"
                                    required
                                    min={1}
                                    max={24}
                                    value={v.timesPerDay}
                                    onChange={(event) => change("timesPerDay", Number(event.target.value))}
                                />
                            </label>
                        )}
                    </fieldset>
                    <label className="tp-starts">
                        Starts <span className="tp-required">*</span>
                        <input
                            aria-label="Starts"
                            type="date"
                            required
                            value={v.startDate}
                            onChange={(event) => change("startDate", event.target.value)}
                        />
                    </label>
                    <fieldset>
                        <legend>
                            Ends <span className="tp-required">*</span>
                        </legend>
                        <p className="tp-schedule-help">To add a one-off task, set the end date to be the same as the start date.</p>
                        <label className="tp-check">
                            <input
                                type="radio"
                                name="task-end"
                                checked={!endsOn}
                                onChange={() => setEndsOn(false)}
                            />
                            Never
                        </label>
                        <div className="tp-end-date">
                            <label className="tp-check">
                                <input
                                    type="radio"
                                    name="task-end"
                                    checked={endsOn}
                                    onChange={() => {
                                        setEndsOn(true);
                                        if (!v.endDate) change("endDate", v.startDate);
                                    }}
                                />
                                On
                            </label>
                            <input
                                aria-label="End date"
                                type="date"
                                disabled={!endsOn}
                                required={endsOn}
                                min={v.startDate}
                                value={v.endDate || v.startDate}
                                onChange={(event) => change("endDate", event.target.value)}
                            />
                        </div>
                    </fieldset>
                    {error && (
                        <p
                            role="alert"
                            className="tp-error"
                        >
                            {error}
                        </p>
                    )}
                </div>
                <footer>
                    <button
                        type="button"
                        disabled={busy}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="tp-primary"
                        disabled={busy}
                    >
                        {busy ? "Saving…" : "Save task"}
                    </button>
                </footer>
            </form>
        </div>
    );
}
