import PropTypes from "prop-types";

const numberValue = (event, fallback = 0) => {
    const value = Number(event.target.value);
    return Number.isFinite(value) && value >= 0 ? value : fallback;
};

export default function MedicationSafetySection({ values, setFieldValue }) {
    return (
        <div className="mb-4 rounded border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
                <div className="poppins-medium text-sm text-customBlack">Medication safety controls</div>
                <p className="mt-1 text-sm text-customGrey1">Configure witnessing and stock controls from the dispensing label and your medicines policy.</p>
            </div>
            <div className="space-y-4 px-6 py-4">
                <label className="flex items-start gap-3 text-sm text-customBlack">
                    <input type="checkbox" checked={values.isControlledDrug} onChange={(event) => { setFieldValue("isControlledDrug", event.target.checked); if (event.target.checked) setFieldValue("requiresWitness", true); }} />
                    <span><strong>Controlled drug</strong><span className="block text-customGrey1">Every mobile administration requires a second active team member as witness.</span></span>
                </label>
                <label className="flex items-start gap-3 text-sm text-customBlack">
                    <input type="checkbox" checked={values.requiresWitness} disabled={values.isControlledDrug} onChange={(event) => setFieldValue("requiresWitness", event.target.checked)} />
                    <span><strong>Witness required</strong><span className="block text-customGrey1">Use this for medicines covered by an organisation-specific two-person policy.</span></span>
                </label>
                <label className="flex items-start gap-3 text-sm text-customBlack">
                    <input type="checkbox" checked={values.stockTrackingEnabled} onChange={(event) => setFieldValue("stockTrackingEnabled", event.target.checked)} />
                    <span><strong>Track medication stock</strong><span className="block text-customGrey1">Administered quantities reduce the recorded balance and create one open low-stock alert.</span></span>
                </label>
                {values.stockTrackingEnabled && (
                    <div className="grid gap-4 md:grid-cols-3">
                        <label className="text-sm text-customBlack">Current stock
                            <input type="number" min="0" step="0.01" className="mt-1 w-full rounded border border-gray-300 px-3 py-2" value={values.stockQuantity} onChange={(event) => setFieldValue("stockQuantity", numberValue(event))} />
                        </label>
                        <label className="text-sm text-customBlack">Stock unit
                            <input type="text" maxLength="40" placeholder="tablets, ml, patches" className="mt-1 w-full rounded border border-gray-300 px-3 py-2" value={values.stockUnit} onChange={(event) => setFieldValue("stockUnit", event.target.value)} />
                        </label>
                        <label className="text-sm text-customBlack">Low-stock threshold
                            <input type="number" min="0" step="0.01" className="mt-1 w-full rounded border border-gray-300 px-3 py-2" value={values.lowStockThreshold} onChange={(event) => setFieldValue("lowStockThreshold", numberValue(event))} />
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
}

MedicationSafetySection.propTypes = { values: PropTypes.object.isRequired, setFieldValue: PropTypes.func.isRequired };
