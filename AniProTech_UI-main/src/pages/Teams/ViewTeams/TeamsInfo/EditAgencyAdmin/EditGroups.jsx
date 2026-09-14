import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { _get, _put } from "../../../../../utils/ApiService";
import { showSuccess } from "../../../../../utils/toaster";
export default function EditGroups() {
    const { id } = useParams(),
        navigate = useNavigate();
    const [groups, setGroups] = useState(""),
        [loading, setLoading] = useState(true),
        [saving, setSaving] = useState(false),
        [error, setError] = useState("");
    useEffect(() => {
        let active = true;
        _get(`/api/team/${id}/groups`)
            .then((r) => {
                if (active) setGroups(r.data.results.data.groups.join(", "));
            })
            .catch((e) => {
                if (active) setError(e.response?.data?.message || "Unable to load groups");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [id]);
    async function save(e) {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            await _put(`/api/team/${id}/groups`, {
                groups: groups
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
            });
            showSuccess("Groups saved");
            navigate(`/admin/teams/${id}`);
        } catch (e) {
            setError(e.response?.data?.message || "Unable to save groups");
        } finally {
            setSaving(false);
        }
    }
    return (
        <form
            onSubmit={save}
            className="mx-auto max-w-2xl space-y-5 p-8"
        >
            <h1 className="text-2xl font-semibold">Staff groups</h1>
            <p className="text-sm text-gray-500">
                Enter group names separated by commas, for example North team, Weekend cover. Leave empty to remove all groups.
            </p>
            {error && (
                <p
                    role="alert"
                    className="text-red-700"
                >
                    {error}
                </p>
            )}
            <label className="block">
                Groups
                <input
                    disabled={loading || saving}
                    className="mt-2 block w-full rounded border p-3"
                    value={groups}
                    onChange={(e) => setGroups(e.target.value)}
                />
            </label>
            <div className="flex gap-3">
                <button
                    disabled={loading || saving}
                    className="rounded bg-customNavy px-5 py-2 text-white"
                    type="submit"
                >
                    {saving ? "Saving..." : "Save groups"}
                </button>
                <button
                    type="button"
                    className="rounded border px-5 py-2"
                    onClick={() => navigate(-1)}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
