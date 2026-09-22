import { useEffect, useState } from "react";
import "./client-portal.css";
const base = (
    import.meta.env.VITE_APP_BASE_LIVE_URL || "https://backend.aniprotech.com"
).replace(/\/$/, "");
const storage = "aniprotech_portal_session";
const date = (v) =>
    v ? new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", dateStyle: "medium", timeStyle: "short" }).format(new Date(v)) : "Not recorded";
const text = (v) => (Array.isArray(v) ? v.join("\n") : v || "Not recorded");
async function api(path, token, body) {
    const r = await fetch(`${base}/api/portal${path}`, {
        method: body ? "POST" : "GET",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await r.json();
    if (!r.ok) {
        const error = Error(data.message || "Unable to open the shared record");
        error.status = r.status;
        throw error;
    }
    return data.results.data;
}
export default function ClientPortal() {
    const [link] = useState(() => {
        const p = new URLSearchParams(window.location.hash.slice(1));
        return { shareId: p.get("share") || "", token: p.get("token") || "" };
    });
    const [shareId, setShareId] = useState(link.shareId),
        [code, setCode] = useState(""),
        [name, setName] = useState(""),
        [email, setEmail] = useState(""),
        [token, setToken] = useState(() => {
            try {
                if (link.token) return "";
                const saved = JSON.parse(sessionStorage.getItem(storage) || "null");
                return saved && (!link.shareId || saved.shareId === link.shareId) ? saved.token : "";
            } catch {
                return "";
            }
        }),
        [record, setRecord] = useState(null),
        [error, setError] = useState(""),
        [busy, setBusy] = useState(false),
        [page, setPage] = useState(1),
        [messages,setMessages]=useState([]),
        [message,setMessage]=useState(""),
        [rating,setRating]=useState(5),
        [feedbackKind,setFeedbackKind]=useState("QUALITY_FEEDBACK"),
        [feedback,setFeedback]=useState("");
    useEffect(() => {
        document.title = "AniProTech | Shared care record";
        if (link.token) {
            sessionStorage.removeItem(storage);
            setToken("");
            window.history.replaceState(null, "", window.location.pathname + "#" + new URLSearchParams({ share: link.shareId }));
        }
    }, [link]);
    useEffect(() => {
        if (!token) {
            setRecord(null);
            return;
        }
        let active = true;
        const load = () =>
            api(`/record?page=${page}`, token)
                .then((data) => {
                    if (active) {
                        setRecord(data);
                        setError("");
                    }
                })
                .catch((e) => {
                    if (active) {
                        setRecord(null);
                        setError(e.message);
                        if (e.status === 401) {
                            sessionStorage.removeItem(storage);
                            setToken("");
                        }
                    }
                });
        load();
        const timer = setInterval(load, 60000);
        return () => {
            active = false;
            clearInterval(timer);
        };
    }, [token, page]);
    useEffect(()=>{if(token&&record?.scopes.includes("MESSAGES")) api("/messages",token).then(x=>setMessages(x.messages)).catch(e=>setError(e.message))},[token,record]);
    const signIn = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
            const result = await api("/exchange", null, link.token ? { shareId: link.shareId, token: link.token } : { shareId, code, name, email });
            sessionStorage.setItem(storage, JSON.stringify({ token: result.token, shareId: link.shareId || shareId }));
            setToken(result.token);
            setPage(1);
            setCode("");
        } catch (e) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    };
    const logout = async () => {
        try {
            await api("/logout", token, {});
        } finally {
            sessionStorage.removeItem(storage);
            setToken("");
            setRecord(null);
        }
    };
    return (
        <div className="client-portal">
            <header>
                <strong>AniProTech</strong>
                <span>Shared care record · read only</span>
                {token && <button onClick={() => logout().catch(() => setError("Signed out locally."))}>Sign out</button>}
            </header>
            <main>
                {error && (
                    <p
                        role="alert"
                        className="cp-error"
                    >
                        {error}
                    </p>
                )}
                {!token ? (
                    <form
                        onSubmit={signIn}
                        className="cp-login"
                    >
                        <h1>View a shared care record</h1>
                        <p>
                            {link.token
                                ? "Your care provider sent you a one-time email link. Select Open care record to sign in."
                                : "Use the website link and access code provided by the care team."}
                        </p>
                        {!link.token && (
                            <>
                                <label>
                                    Sharing reference
                                    <input
                                        required
                                        value={shareId}
                                        onChange={(e) => setShareId(e.target.value)}
                                        readOnly={!!link.shareId}
                                    />
                                </label>
                                <label>
                                    Access code
                                    <input
                                        required
                                        autoComplete="off"
                                        maxLength={64}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                    />
                                </label>
                                <label>
                                    Your name
                                    <input
                                        required
                                        minLength={2}
                                        maxLength={100}
                                        autoComplete="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </label>
                                <label>
                                    Your email
                                    <input
                                        required
                                        type="email"
                                        maxLength={254}
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </label>
                                <p className="cp-muted">
                                    Your entered name, email and record views are recorded for the care provider’s access history.
                                </p>
                            </>
                        )}
                        <button disabled={busy}>{busy ? "Opening…" : "Open care record"}</button>
                    </form>
                ) : !record ? (
                    <p>Loading shared record…</p>
                ) : (
                    <>
                        <h1>{record.clientName}</h1>
                        <p className="cp-muted">
                            Read-only access expires {date(record.expiresAt)} (UK). Access may be revoked by the care provider.
                        </p>
                        {record.basic && (
                            <section>
                                <h2>Basic information</h2>
                                <dl>
                                    {[
                                        ["Name", [record.basic.firstName, record.basic.middleName, record.basic.lastName].filter(Boolean).join(" ")],
                                        ["Preferred name", record.basic.preferredName],
                                        ["Date of birth", record.basic.dateOfBirth],
                                        ["Phone", record.basic.primaryPhone],
                                        ["Email", record.basic.email],
                                    ].map(([key, value]) => (
                                        <div key={key}>
                                            <dt>{key}</dt>
                                            <dd>{text(value)}</dd>
                                        </div>
                                    ))}
                                </dl>
                                {record.basic.addresses.map((a, i) => (
                                    <p key={i}>{Object.values(a).filter(Boolean).join(", ")}</p>
                                ))}
                                <h3>Highlights</h3>
                                <p className="cp-pre">{text(record.basic.highlights)}</p>
                            </section>
                        )}
                        {record.medical && (
                            <section>
                                <h2>Medical history and allergies</h2>
                                <h3>Medical history</h3>
                                <p className="cp-pre">{text(record.medical.medicalHistory)}</p>
                                <h3>Allergies and intolerances</h3>
                                <p className="cp-pre">{text(record.medical.allergiesIntolerances)}</p>
                            </section>
                        )}
                        {record.careLog && (
                            <section>
                                <h2>Care log</h2>
                                {record.careLog.length ? (
                                    record.careLog.map((e) => (
                                        <article key={e.id}>
                                            <h3>{e.title}</h3>
                                            <small>
                                                {e.kind} · {e.status.replaceAll("_", " ")} · {date(e.createdAt)}
                                            </small>
                                            <p className="cp-pre">{text(e.body)}</p>
                                        </article>
                                    ))
                                ) : (
                                    <p>No care entries recorded.</p>
                                )}
                                <footer>
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage((p) => p - 1)}
                                    >
                                        Previous
                                    </button>
                                    <span>
                                        Page {page} of {Math.max(1, Math.ceil(record.totalEntries / 20))}
                                    </span>
                                    <button
                                        disabled={page * 20 >= record.totalEntries}
                                        onClick={() => setPage((p) => p + 1)}
                                    >
                                        Next
                                    </button>
                                </footer>
                            </section>
                        )}
                        {record.upcomingVisits && <section><h2>Upcoming visits</h2>{record.upcomingVisits.length ? record.upcomingVisits.map(v=><article key={v.id}><h3>{v.title}</h3><p>{v.visitDate} · {String(v.startTime).slice(0,5)}–{String(v.endTime).slice(0,5)}</p><small>{v.caregiverName || "Caregiver to be confirmed"} · {v.status.replaceAll("_"," ")}</small></article>) : <p>No upcoming visits currently scheduled.</p>}</section>}
                        {record.carePlans && <section><h2>Care plan overview</h2>{record.carePlans.length ? record.carePlans.map(p=><article key={p.type}><h3>{p.type}</h3><small>{p.updatedAt ? `Last updated ${date(p.updatedAt)}` : "Available"}</small></article>) : <p>No care plans are currently available.</p>}</section>}
                        {record.scopes.includes("MESSAGES")&&<section><h2>Secure messages</h2>{messages.map(m=><article key={m.id}><strong>{m.senderName}</strong><small> · {m.senderType} · {date(m.createdAt)}</small><p className="cp-pre">{m.body}</p></article>)}{!messages.length&&<p>No messages yet.</p>}<form onSubmit={async e=>{e.preventDefault();setBusy(true);try{await api("/messages",token,{body:message});setMessage("");setMessages((await api("/messages",token)).messages)}catch(e){setError(e.message)}finally{setBusy(false)}}}><label>Your message<textarea required maxLength={2000} value={message} onChange={e=>setMessage(e.target.value)}/></label><button disabled={busy}>Send securely</button></form></section>}
                        {record.scopes.includes("FEEDBACK")&&<section><h2>Feedback and concerns</h2><p className="cp-muted">Send quality feedback, a concern, complaint or compliment directly to the care provider.</p><form onSubmit={async e=>{e.preventDefault();setBusy(true);try{await api("/feedback",token,{kind:feedbackKind,rating:Number(rating),comment:feedback,consent:true});setFeedback("");setError("Your submission was sent successfully.")}catch(e){setError(e.message)}finally{setBusy(false)}}}><label>Type<select value={feedbackKind} onChange={e=>setFeedbackKind(e.target.value)}><option value="QUALITY_FEEDBACK">Quality feedback</option><option value="CONCERN">Concern</option><option value="COMPLAINT">Complaint</option><option value="COMPLIMENT">Compliment</option></select></label><label>Rating<select value={rating} onChange={e=>setRating(e.target.value)}>{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} / 5</option>)}</select></label><label>Details<textarea required minLength={1} maxLength={2000} value={feedback} onChange={e=>setFeedback(e.target.value)}/></label><button disabled={busy}>I consent and submit</button></form></section>}
                    </>
                )}
            </main>
        </div>
    );
}
