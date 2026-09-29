import { useState } from "react";
import PropTypes from "prop-types";

const regions = ["Head", "Neck", "Shoulder", "Chest", "Abdomen", "Upper back", "Lower back", "Arm", "Hand", "Hip", "Thigh", "Knee", "Lower leg", "Foot"];

export default function MedicationBodyMapEditor({ value, onChange, onClose }) {
    const [view, setView] = useState("Front");
    const [side, setSide] = useState("Left");
    const [region, setRegion] = useState("");
    const [instructions, setInstructions] = useState("");
    const text = typeof value === "string" ? value : "";
    const addSite = () => {
        if (!region || !instructions.trim()) return;
        onChange([text.trim(), `${view} · ${side} ${region}: ${instructions.trim()}`].filter(Boolean).join("\n"));
        setRegion("");
        setInstructions("");
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true" aria-label="Medication application sites">
            <div className="mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6">
                <h3 className="mb-2 text-lg font-semibold">Medication application sites</h3>
                <p className="mb-4 text-sm text-gray-600">Record each site and the prescription or care-plan instructions. Carers must review this information before recording an administered dose.</p>
                <div className="mb-3 flex gap-2">
                    {["Front", "Back"].map((item) => <button key={item} type="button" aria-pressed={view === item} className={`rounded border px-3 py-2 text-sm ${view === item ? "border-blue-600 bg-blue-50" : "border-gray-300"}`} onClick={() => setView(item)}>{item}</button>)}
                </div>
                <div className="mb-3 flex gap-2" aria-label="Client's anatomical side">
                    {["Left", "Right", "Centre"].map((item) => <button key={item} type="button" aria-pressed={side === item} className={`rounded border px-3 py-2 text-sm ${side === item ? "border-blue-600 bg-blue-50" : "border-gray-300"}`} onClick={() => setSide(item)}>{item}</button>)}
                </div>
                <label className="mb-1 block text-sm font-medium" htmlFor="medication-body-region">Body region</label>
                <select id="medication-body-region" value={region} onChange={(event) => setRegion(event.target.value)} className="mb-3 w-full rounded border border-gray-300 p-2">
                    <option value="">Choose a region</option>
                    {regions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <label className="mb-1 block text-sm font-medium" htmlFor="medication-body-instructions">Application instructions</label>
                <textarea id="medication-body-instructions" value={instructions} onChange={(event) => setInstructions(event.target.value)} maxLength={500} rows={2} className="mb-3 w-full rounded border border-gray-300 p-2" placeholder="For example, apply a thin layer to intact skin" />
                <button type="button" disabled={!region || !instructions.trim()} onClick={addSite} className="mb-4 rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-50">Add application site</button>
                <label className="mb-1 block text-sm font-medium" htmlFor="medication-body-map-data">Sites carers will see</label>
                <textarea id="medication-body-map-data" value={text} onChange={(event) => onChange(event.target.value)} maxLength={4000} rows={5} className="w-full rounded border border-gray-300 p-2" placeholder="Add at least one application site" />
                <div className="mt-4 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="rounded border border-gray-300 px-4 py-2">Close</button>
                    <button type="button" disabled={!text.trim()} onClick={onClose} className="rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-50">Use these sites</button>
                </div>
            </div>
        </div>
    );
}

MedicationBodyMapEditor.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};
