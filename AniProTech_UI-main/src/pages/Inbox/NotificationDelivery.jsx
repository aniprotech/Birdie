import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { _get, _post } from "../../utils/ApiService";
const labels = {
    PENDING: "Queued",
    PROCESSING: "Sending",
    ACCEPTED: "Accepted by email provider",
    DELIVERED: "Delivered",
    FAILED: "Failed",
    UNKNOWN: "Outcome uncertain",
    CANCELLED: "Cancelled",
};
export default function NotificationDelivery() {
    const [data, setData] = useState(null),
        [error, setError] = useState(""),
        [revision, setRevision] = useState(0),
        [busy, setBusy] = useState(null);
    useEffect(() => {
        const c = new AbortController();
        _get("/api/inbox/notifications", { signal: c.signal })
            .then((r) => {
                if (!c.signal.aborted) {
                    setData(r.data.results.data);
                    setError("");
                }
            })
            .catch((e) => {
                if (!c.signal.aborted) setError(e.response?.data?.message || "Unable to load delivery history");
            });
        return () => c.abort();
    }, [revision]);
    return (
        <section className="ix-delivery">
            <header>
                <h2>Email delivery history</h2>
                <button onClick={() => setRevision((n) => n + 1)}>Refresh deliveries</button>
            </header>
            <p>Your latest 50 notifications. Provider acceptance does not confirm that an email reached the recipient’s inbox.</p>
            {error && (
                <p
                    className="ix-error"
                    role="alert"
                >
                    {error}
                </p>
            )}
            {!data ? (
                <p>Loading delivery history…</p>
            ) : !data.deliveries.length ? (
                <p>No emails queued yet. Only new or reopened recorded alerts after you enable notifications are eligible.</p>
            ) : (
                data.deliveries.map((d) => (
                    <article key={d.id}>
                        <div className="ix-delivery-title">
                            <strong>{d.alertType}</strong>
                            <span className="ix-badge">{labels[d.status]}</span>
                        </div>
                        <p>
                            {new Date(d.createdAt).toLocaleString("en-GB")} · {d.attempts} attempt(s)
                        </p>
                        <Link to={"/admin/inbox?item=" + d.entryId}>View alert</Link>
                        {d.status === "UNKNOWN" && <p>Delivery could not be confirmed. Automatic resend is blocked to prevent duplicate emails.</p>}
                        {d.status === "FAILED" && d.safeRetry && d.attempts < 8 && (
                            <button
                                disabled={busy !== null || !data.channels.enabled || !data.channels.email}
                                onClick={async () => {
                                    setBusy(d.id);
                                    setError("");
                                    try {
                                        await _post("/api/inbox/notifications/" + d.id + "/retry", {});
                                        setRevision((n) => n + 1);
                                    } catch (e) {
                                        setError(e.response?.data?.message || "Unable to retry");
                                    } finally {
                                        setBusy(null);
                                    }
                                }}
                            >
                                Retry email
                            </button>
                        )}
                        <details>
                            <summary>Delivery history</summary>
                            <ol>
                                {d.history.map((h, i) => (
                                    <li key={i}>
                                        {new Date(h.createdAt).toLocaleString("en-GB")} — {h.description}
                                    </li>
                                ))}
                            </ol>
                        </details>
                    </article>
                ))
            )}
        </section>
    );
}
