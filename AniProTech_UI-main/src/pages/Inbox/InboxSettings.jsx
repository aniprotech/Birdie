import { useEffect, useState } from "react";
import { _get, _put } from "../../utils/ApiService";
import NotificationDelivery from "./NotificationDelivery";
const notificationGroups = {
    Concerns: ["Severe", "Medium", "Low"],
    Medication: ["Medication not taken", "Medication partially taken", "No medication report received"],
    Visits: ["Visit not started in time", "Visit plan not completed", "Care professional did not check in to visit on time"],
    "Third party access": ["Third party access requested"],
    "Forced check in/out": ["Forced check-in or check-out"],
    Observations: ["Coronavirus symptoms"],
    Other: ["Other alerts"],
};
export default function InboxSettings({ onSaved, onBack }) {
    const [delivery, setDelivery] = useState(null);
    const [record, setRecord] = useState(null),
        [draft, setDraft] = useState(null),
        [error, setError] = useState(""),
        [busy, setBusy] = useState(false),
        [notice, setNotice] = useState(""),
        [reload, setReload] = useState(0);
    useEffect(() => {
        const c = new AbortController();
        Promise.all([_get("/api/inbox/preferences", { signal: c.signal }), _get("/api/inbox/notifications", { signal: c.signal })])
            .then(([r, status]) => {
                if (!c.signal.aborted) {
                    setDelivery(status.data.results.data);
                    setRecord(r.data.results.data);
                    setDraft(r.data.results.data.preferences);
                }
            })
            .catch((e) => {
                if (!c.signal.aborted) setError(e.response?.data?.message || "Unable to load settings");
            });
        return () => c.abort();
    }, [reload]);
    return (
        <section className="ix-settings">
            <header>
                <h1>Notification settings</h1>
                <button onClick={onBack}>Back to Inbox</button>
            </header>
            <p>These preferences apply to your account and are saved for your next visit.</p>
            {error && (
                <p
                    role="alert"
                    className="ix-error"
                >
                    {error}{" "}
                    <button
                        onClick={() => {
                            setError("");
                            setReload((n) => n + 1);
                        }}
                    >
                        Reload settings
                    </button>
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
            {draft ? (
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        setBusy(true);
                        setError("");
                        setNotice("");
                        try {
                            const r = await _put("/api/inbox/preferences", { preferences: draft, revision: record.revision });
                            setRecord(r.data.results.data);
                            onSaved(draft);
                            setNotice("Inbox settings saved");
                        } catch (e) {
                            setError(e.response?.data?.message || "Unable to save settings");
                        } finally {
                            setBusy(false);
                        }
                    }}
                >
                    <fieldset disabled={busy}>
                        <p className="ix-settings-note">
                            {delivery?.channels.enabled && delivery?.channels.email
                                ? "Email delivery is available. Enable notifications and choose the alert types you want to receive."
                                : "Email delivery is currently unavailable. Your preferences can still be saved."}{" "}
                            SMS is disabled.
                        </p>
                        <label className="ix-checkbox">
                            <input
                                type="checkbox"
                                aria-label="Enable email notifications"
                                disabled={!delivery?.channels.enabled || !delivery?.channels.email}
                                checked={draft.deliveryEnabled || false}
                                onChange={(e) => setDraft({ ...draft, deliveryEnabled: e.target.checked })}
                            />
                            Enable email notifications
                        </label>
                        <p>
                            Emails go to {delivery?.recipientEmail || "your account email address"}. They contain a sign-in link, without client or
                            medication details. Existing alerts are not emailed retrospectively.
                        </p>
                        {Object.entries(notificationGroups).map(([group, types]) => (
                            <section
                                className="ix-notification-group"
                                key={group}
                            >
                                <h2>{group}</h2>
                                {types.map((type) => (
                                    <div
                                        className="ix-notification-row"
                                        key={type}
                                    >
                                        <span>{type}</span>
                                        {(group === "Forced check in/out" ? ["email"] : ["email", "sms"]).map((channel) => (
                                            <label
                                                className="ix-checkbox"
                                                key={channel}
                                            >
                                                <input
                                                    aria-label={type + " " + channel}
                                                    type="checkbox"
                                                    disabled={channel === "sms"}
                                                    checked={channel === "sms" ? false : draft.notifications?.[type]?.[channel] || false}
                                                    onChange={(e) =>
                                                        setDraft({
                                                            ...draft,
                                                            notifications: {
                                                                ...draft.notifications,
                                                                [type]: {
                                                                    email: false,
                                                                    sms: false,
                                                                    ...draft.notifications?.[type],
                                                                    [channel]: e.target.checked,
                                                                },
                                                            },
                                                        })
                                                    }
                                                />
                                                {channel === "email" ? "Email" : "SMS"}
                                            </label>
                                        ))}
                                    </div>
                                ))}
                            </section>
                        ))}
                        <h2>Inbox display</h2>
                        <label>
                            Default folder
                            <select
                                value={draft.folder}
                                onChange={(e) => setDraft({ ...draft, folder: e.target.value })}
                            >
                                {Object.entries({
                                    "ALERT:OPEN": "Alerts · Action needed",
                                    "ALERT:ALL": "Alerts · All",
                                    "ALERT:IN_PROGRESS": "Alerts · In progress",
                                    "ACTION:ALL": "Actions · All",
                                    "ACTION:MINE": "Actions · My actions",
                                    "ACTION:TODAY": "Actions · Due today",
                                }).map(([v, n]) => (
                                    <option
                                        key={v}
                                        value={v}
                                    >
                                        {n}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Default sorting
                            <select
                                value={draft.sort}
                                onChange={(e) => setDraft({ ...draft, sort: e.target.value })}
                            >
                                {Object.entries({
                                    NEWEST: "Newest first",
                                    OLDEST: "Oldest first",
                                    SEVERITY: "Highest severity first",
                                    DUE: "Earliest due date first",
                                }).map(([v, n]) => (
                                    <option
                                        key={v}
                                        value={v}
                                    >
                                        {n}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="ix-checkbox">
                            <input
                                type="checkbox"
                                checked={draft.showPreviews}
                                onChange={(e) => setDraft({ ...draft, showPreviews: e.target.checked })}
                            />
                            Show incident previews on cards
                        </label>
                        <button
                            className="ix-primary"
                            disabled={busy || JSON.stringify(draft) === JSON.stringify(record.preferences)}
                        >
                            Save settings
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                setDraft({ folder: "ALERT:OPEN", sort: "NEWEST", showPreviews: true, notifications: {}, deliveryEnabled: false })
                            }
                        >
                            Restore defaults
                        </button>
                    </fieldset>
                </form>
            ) : (
                <p>Loading settings…</p>
            )}
            <p className="ix-settings-note">Notification preferences apply only to your account. Existing alerts remain visible in the Inbox.</p>
            <NotificationDelivery />
        </section>
    );
}
