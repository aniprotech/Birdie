import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { _get, _put } from "../../../../utils/ApiService";
import useAuthStore from "../../../../stores/authStore";
import "./operations.css";
const names = { CAR: "Car", BICYCLE: "Bicycle", WALKING: "Walking" };
const display = (v) =>
    v
        ? v
              .replaceAll("_", " ")
              .toLowerCase()
              .replace(/^./, (c) => c.toUpperCase())
        : "N/A";
export default function OperationIndex({ initialSection = null }) {
    const { id } = useParams(),
        navigate = useNavigate(),
        role = useAuthStore((s) => s.userData?.user?.role);
    const canEdit = ["ADMIN", "SUPERADMIN"].includes(role);
    const [data, setData] = useState(null),
        [section, setSection] = useState(null),
        [draft, setDraft] = useState({}),
        [error, setError] = useState(""),
        [busy, setBusy] = useState(false),
        [notice, setNotice] = useState("");
    const begin = (key, values) => {
        setDraft(
            key === "travel"
                ? { address: values.address || "", transportMethod: values.transportMethod || "" }
                : { rateCard: values.rateCard || "", travelRateCard: values.travelRateCard || "" },
        );
        setSection(key);
        setError("");
    };
    useEffect(() => {
        const c = new AbortController();
        setData(null);
        setSection(null);
        setError("");
        _get(`/api/team-operations/get/${id}`, { signal: c.signal })
            .then((r) => {
                if (!c.signal.aborted) {
                    const value = r.data.results.data;
                    setData(value);
                    if (initialSection) begin(initialSection, value);
                }
            })
            .catch((e) => {
                if (!c.signal.aborted) setError(e.response?.data?.message || "Unable to load operations");
            });
        return () => c.abort();
    }, [id, initialSection]);
    const close = () => {
        setSection(null);
        if (initialSection) navigate(`/admin/teams/${id}/operations`);
    };
    const save = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
            const r = await _put(`/api/team-operations/update/${id}`, draft);
            setData(r.data.results.data);
            setNotice("Operations saved.");
            close();
        } catch (e) {
            setError(e.response?.data?.message || "Unable to save operations");
        } finally {
            setBusy(false);
        }
    };
    const table = (key, title, rows) => (
        <section aria-label={title}>
            <header>
                <h2>{title}</h2>
                {canEdit && (
                    <button
                        aria-label={`Edit ${title.toLowerCase()}`}
                        onClick={() => begin(key, data)}
                    >
                        Edit
                    </button>
                )}
            </header>
            <dl>
                {rows.map(([label, value]) => (
                    <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
    return (
        <main className="team-operations">
            {error && <p role="alert">{error}</p>}
            {notice && <p role="status">{notice}</p>}
            {!data ? (
                <p>Loading operations…</p>
            ) : (
                <>
                    {table("travel", "Travel information", [
                        ["Address", data.address || "None"],
                        ["Transport method", names[data.transportMethod] || "None"],
                    ])}
                    {table("rates", "Rates", [
                        ["Rate card", display(data.rateCard)],
                        ["Travel rate card", display(data.travelRateCard)],
                    ])}
                </>
            )}
            {section && canEdit && (
                <div className="op-overlay">
                    <form
                        role="dialog"
                        aria-modal="true"
                        aria-label={section === "travel" ? "Edit travel information" : "Edit rates"}
                        onSubmit={save}
                    >
                        <h2>{section === "travel" ? "Travel information" : "Rates"}</h2>
                        {section === "travel" ? (
                            <>
                                <label>
                                    Address
                                    <textarea
                                        maxLength={1000}
                                        value={draft.address}
                                        onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                                    />
                                </label>
                                <label>
                                    Transport method
                                    <select
                                        value={draft.transportMethod}
                                        onChange={(e) => setDraft({ ...draft, transportMethod: e.target.value })}
                                    >
                                        <option value="">None</option>
                                        {Object.entries(names).map(([v, n]) => (
                                            <option
                                                key={v}
                                                value={v}
                                            >
                                                {n}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </>
                        ) : (
                            <>
                                <p>Rate-card labels for this team member. Staff pay amounts are configured in Finance.</p>
                                {[
                                    ["rateCard", "Rate card"],
                                    ["travelRateCard", "Travel rate card"],
                                ].map(([key, label]) => (
                                    <label key={key}>
                                        {label}
                                        <input
                                            list="operation-rate-labels"
                                            maxLength={100}
                                            value={draft[key]}
                                            onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                                        />
                                    </label>
                                ))}
                                <datalist id="operation-rate-labels">
                                    {["HIGH", "MEDIUM", "LOW", "OTHER", "NOT_DISCLOSED", "NOT_APPLICABLE"].map((v) => (
                                        <option
                                            key={v}
                                            value={v}
                                        />
                                    ))}
                                </datalist>
                            </>
                        )}
                        {error && <p role="alert">{error}</p>}
                        <footer>
                            <button
                                type="button"
                                disabled={busy}
                                onClick={close}
                            >
                                Cancel
                            </button>
                            <button
                                className="op-save"
                                disabled={busy}
                            >
                                {busy ? "Saving…" : "Save changes"}
                            </button>
                        </footer>
                    </form>
                </div>
            )}
        </main>
    );
}
