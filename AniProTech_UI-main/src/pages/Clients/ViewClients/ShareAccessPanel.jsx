import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { _get, _post } from "../../../utils/ApiService";
import "./share-access.css";
const scopes = { BASIC: "Basic information", MEDICAL: "Medical history and allergies", CARE_LOG: "Care notes, observations and activities" };
const date = (v) =>
    v ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" }).format(new Date(v)) : "Not enabled";
const actions = {
    SHARING_ENABLED: "Sharing enabled",
    CODE_REPLACED: "Code replaced; earlier access revoked",
    ACCESS_REVOKED: "All shared access revoked",
    CLIENT_EMAIL_QUEUED: "Client email queued",
    CLIENT_SIGNED_IN: "Client signed in by email link",
    CODE_SIGNED_IN: "Access code used (self-reported identity)",
    RECORD_VIEWED: "Shared record viewed",
    SIGNED_OUT: "Portal signed out",
};
export default function ShareAccessPanel() {
    const { id } = useParams(),
        [info, setInfo] = useState(null),
        [sections, setSections] = useState(["BASIC", "CARE_LOG"]),
        [days, setDays] = useState(7),
        [permission, setPermission] = useState(false),
        [busy, setBusy] = useState(false),
        [error, setError] = useState(""),
        [notice, setNotice] = useState(""),
        [confirm, setConfirm] = useState(null);
    const load = async () => {
        const data = (await _get(`/api/client-share-access/${id}`)).data.results.data;
        setInfo(data);
        return data;
    };
    useEffect(() => {
        const c = new AbortController();
        setInfo(null);
        setError("");
        setPermission(false);
        setConfirm(null);
        _get(`/api/client-share-access/${id}`, { signal: c.signal })
            .then((r) => {
                if (!c.signal.aborted) {
                    setInfo(r.data.results.data);
                    setSections(r.data.results.data.scopes);
                }
            })
            .catch((e) => {
                if (!c.signal.aborted) setError(e.response?.data?.message || "Unable to load sharing settings");
            });
        return () => c.abort();
    }, [id]);
    const copy = async (value) => {
        try {
            await navigator.clipboard.writeText(value);
            setNotice("Copied to clipboard.");
        } catch {
            setError("Clipboard is unavailable. Select and copy the displayed text.");
        }
    };
    const perform = async () => {
        setBusy(true);
        setError("");
        try {
            const endpoint = confirm === "generate" ? "generate" : confirm === "revoke" ? "revoke" : "send-magic-link";
            const r = await _post(`/api/client-share-access/${endpoint}`, {
                clientId: id,
                revision: info.revision,
                ...(confirm === "generate" ? { acknowledged: permission, days, scopes: sections } : {}),
            });
            setNotice(r.data.message);
            setConfirm(null);
            setPermission(false);
            await load();
        } catch (e) {
            setError(e.response?.data?.message || "Unable to update shared access");
        } finally {
            setBusy(false);
        }
    };
    return (
        <main className="share-access">
            <h1>Share access</h1>
            <p>Manage read-only access to {info?.clientName || "this client"}’s care record.</p>
            <p className="sa-info">Share only with authorised people. Choose which sections they can view and how long access lasts.</p>
            {error && (
                <p
                    role="alert"
                    className="sa-error"
                >
                    {error}
                </p>
            )}
            {notice && (
                <p
                    role="status"
                    className="sa-notice"
                >
                    {notice}
                </p>
            )}
            {!info ? (
                <button onClick={() => load().catch((e) => setError(e.response?.data?.message || "Unable to load"))}>Reload sharing settings</button>
            ) : (
                <>
                    <section>
                        <h2>Share with a third party</h2>
                        <p>Send the website link and access code to the recipient. Their entered name and email will appear in the access history.</p>
                        <p>
                            <span className={info.active ? "sa-active" : "sa-inactive"}>{info.active ? "Sharing active" : "Sharing inactive"}</span>
                            {info.active && <> · Expires {date(info.expiresAt)} (UK)</>}
                        </p>
                        <div className="sa-cards">
                            <article>
                                <h3>Website link</h3>
                                <a
                                    href={info.websiteUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {info.websiteUrl}
                                </a>
                                <button
                                    disabled={!info.active}
                                    onClick={() => copy(info.websiteUrl)}
                                >
                                    Copy weblink
                                </button>
                            </article>
                            <article>
                                <h3>Access code</h3>
                                <code>{info.accessCode || "Generate a code below"}</code>
                                <button
                                    disabled={!info.active || !info.accessCode}
                                    onClick={() => copy(info.accessCode)}
                                >
                                    Copy access code
                                </button>
                            </article>
                        </div>
                        {info.active && (
                            <>
                                <p>Currently shared: {info.scopes.map((s) => scopes[s]).join(" · ")}</p>
                                <button onClick={() => window.print()}>Print access details</button>
                            </>
                        )}
                        <details className="sa-local">
                            <summary>Opening the link on another device</summary>
                            <p>
                                A localhost or 127.0.0.1 link opens on this computer only. External recipients need the app and backend hosted at
                                accessible addresses.
                            </p>
                        </details>
                    </section>
                    <section>
                        <h2>{info.active ? "Replace access code" : "Enable shared access"}</h2>
                        <p>
                            These choices apply when you generate a code. Replacing a code immediately revokes previous codes, email links and portal
                            sessions.
                        </p>
                        <fieldset>
                            <legend>Sections to share</legend>
                            {Object.entries(scopes).map(([key, name]) => (
                                <label
                                    className="sa-check"
                                    key={key}
                                >
                                    <input
                                        type="checkbox"
                                        checked={sections.includes(key)}
                                        onChange={(e) => setSections((old) => (e.target.checked ? [...old, key] : old.filter((x) => x !== key)))}
                                    />
                                    {name}
                                </label>
                            ))}
                        </fieldset>
                        <label className="sa-expiry">
                            Access expires after
                            <select
                                aria-label="Access expires after"
                                value={days}
                                onChange={(e) => setDays(Number(e.target.value))}
                            >
                                {[1, 3, 7, 14, 30].map((d) => (
                                    <option
                                        key={d}
                                        value={d}
                                    >
                                        {d} day{d === 1 ? "" : "s"}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="sa-check">
                            <input
                                type="checkbox"
                                checked={permission}
                                onChange={(e) => setPermission(e.target.checked)}
                            />
                            I confirm that I am authorised to share the selected sections.
                        </label>
                        <button
                            className="sa-primary"
                            disabled={busy || !permission || !sections.length}
                            onClick={() => setConfirm("generate")}
                        >
                            {info.active ? "Generate new code" : "Generate access code"}
                        </button>
                    </section>
                    <section>
                        <h2>Share with client</h2>
                        <p>
                            Send a one-time sign-in link to the client’s saved email: <strong>{info.clientEmail || "No email saved"}</strong>. It
                            expires after 15 minutes and opens the same selected sections.
                        </p>
                        {!info.canSendMagicLink && (
                            <p className="sa-muted">
                                Enable sharing and save a real client email to use this option. Dummy .test addresses cannot receive email.
                            </p>
                        )}
                        <button
                            disabled={busy || !info.canSendMagicLink}
                            onClick={() => setConfirm("email")}
                        >
                            Send magic link
                        </button>
                    </section>
                    <section>
                        <h2>Revoke access anytime</h2>
                        <p>Stop all shared access now, including signed-in portal sessions. You can generate a new code later.</p>
                        <button
                            className="sa-danger"
                            disabled={!info.active || busy}
                            onClick={() => setConfirm("revoke")}
                        >
                            Revoke all access
                        </button>
                    </section>
                    <section>
                        <div className="sa-history-heading">
                            <h2>Access history</h2>
                            <button
                                disabled={busy}
                                onClick={() => load().catch((e) => setError(e.response?.data?.message || "Unable to refresh history"))}
                            >
                                Refresh history
                            </button>
                        </div>
                        <p className="sa-muted">Latest 100 events. Names and emails entered with an access code are self-reported.</p>
                        <div className="sa-history">
                            <table>
                                <thead>
                                    <tr>
                                        <th>When (UK)</th>
                                        <th>Event</th>
                                        <th>Who</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {info.history.length ? (
                                        info.history.map((e, i) => (
                                            <tr key={i}>
                                                <td>{date(e.createdAt)}</td>
                                                <td>{actions[e.action] || e.action}</td>
                                                <td>
                                                    {e.actorName}
                                                    <small>{e.actorEmail}</small>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3}>No shared access events yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                    <div className="sa-print">
                        <h1>AniProTech care record access</h1>
                        <p>{info.clientName}</p>
                        <p>{info.websiteUrl}</p>
                        <p>Access code: {info.accessCode}</p>
                        <p>Expires: {date(info.expiresAt)} UK</p>
                        <p>Shared sections: {info.scopes.map((s) => scopes[s]).join(", ")}</p>
                        <p>Keep these details private. Access can be revoked by your care provider.</p>
                    </div>
                    {confirm && (
                        <div className="sa-overlay">
                            <section
                                role="dialog"
                                aria-modal="true"
                                aria-label="Confirm sharing action"
                                className="sa-dialog"
                            >
                                <h2>
                                    {confirm === "generate"
                                        ? "Generate access code?"
                                        : confirm === "revoke"
                                          ? "Revoke all shared access?"
                                          : "Send client email?"}
                                </h2>
                                <p>
                                    {confirm === "generate"
                                        ? `Share ${sections.map((s) => scopes[s]).join(", ")} for ${days} days. Previous access will stop immediately.`
                                        : confirm === "revoke"
                                          ? "Existing codes, email links and signed-in portal sessions will stop working."
                                          : `Send a one-time login link to ${info.clientEmail}.`}
                                </p>
                                {error && (
                                    <p
                                        role="alert"
                                        className="sa-error"
                                    >
                                        {error}
                                    </p>
                                )}
                                <footer>
                                    <button
                                        disabled={busy}
                                        onClick={() => {
                                            setConfirm(null);
                                            setError("");
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="sa-primary"
                                        disabled={busy}
                                        onClick={perform}
                                    >
                                        {busy
                                            ? "Working…"
                                            : confirm === "generate"
                                              ? "Generate code"
                                              : confirm === "revoke"
                                                ? "Revoke access"
                                                : "Send email"}
                                    </button>
                                </footer>
                            </section>
                        </div>
                    )}
                </>
            )}
        </main>
    );
}
