import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { format, isValid } from "date-fns";

import DropdownField from "../../../../components/DropdownInput/Dropdown";
import TextAreaField from "../../../../components/TextInput/TextAreaField";
import { outcomeOptions, reasonOptionsMap, formatDisplayName } from "../../../../utils/common";
import { useNavigationHelpers } from "../../../../hooks/useNavigationHelpers";
import { _put } from "../../../../utils/ApiService";
import APIConfig from "../../../../utils/ApiConfig";
import { showError, showSuccess } from "../../../../utils/toaster";
import { formatTime24Hour } from "../../../../utils/dateAndTimeUtil";

const MedicationMonitoringDialog = ({ data, onClose, showTime = true, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formValues, setFormValues] = useState({
        id: data?.administration?.id || "",
        outcome: data?.administration?.outcome || "",
        reason: data?.administration?.reason || "",
        note: data?.administration?.note || "",
    });

    const { userData } = useNavigationHelpers();

    const formattedDate = (() => {
        const date = data?.date ? new Date(data.date) : null;
        return isValid(date) ? format(date, "dd/MM/yyyy") : "Invalid date";
    })();

    const formattedTime = data?.doseTime || "—";

    const formatTime = formatTime24Hour(data?.createdAt)

    const handleValueChange = (key, value) => {
        setFormValues((prev) => ({
            ...prev,
            [key]: typeof value === "string" ? value : value?.value,
        }));
    };

    useEffect(() => {
        if (!reasonOptionsMap[formValues.outcome]) {
            setFormValues((prev) => ({ ...prev, reason: "" }));
        }
    }, [formValues.outcome]);

    const handleSave = async () => {
        if (!formValues.outcome || !formValues.note) return;

        setLoading(true);

        try {
            const payload = {
                medicationId: data?.id,
                date: format(data.date, "yyyy-MM-dd"),
                slot: data.doseSlot,
                outcome: formValues.outcome,
                reason: formValues.reason || "OTHER",
                note: formValues.note,
                userId: userData?.user?.id,
            };

            if (data.administration?.id) {
                payload.id = formValues.id;
            }

            const response = await _put(APIConfig.CLIENT_MEDICATION_SCHEDULING.UPDATE_PAST_ADMINISTRATION(), payload);

            if (response?.data?.error === false) {
                showSuccess(response?.data?.message || "Administration updated successfully");
                onSave(formValues);
                setIsEditing(false);
            } else {
                showError(response?.data?.message || "Failed to update administration");
            }
        } catch (error) {
            console.error("Error updating administration:", error);
            showError(error?.response?.data?.message || "An error occurred while updating the administration");
        } finally {
            setLoading(false);
        }
    };

    const showReason = reasonOptionsMap[formValues.outcome];
    const reasonRequired = !!showReason;
    const isEdited = data?.administration?.updatedAt || data?.administration?.updatedBy;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded bg-white p-6 shadow-lg space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <h2 className="text-base font-medium text-customBlack">
                        {data?.medicationDescription} • <span className="text-customBlack2 text-sm">{formattedDate} @ {formatTime}</span>
                    </h2>
                    <button onClick={onClose} className="text-2xl text-customBlack1">
                        &times;
                    </button>
                </div>

                {/* Result */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="poppins-medium text-base text-customBlack">Result</h3>
                        {isEditing ? (
                            <button
                                className="poppins-medium rounded border border-gray-300 px-4 py-2 text-sm text-customBlack disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={handleSave}
                                disabled={loading || !formValues.outcome || !formValues.note || (reasonRequired && !formValues.reason)}
                            >
                                {loading ? "Saving..." : "Save"}
                            </button>
                        ) : (
                            <button
                                className="poppins-medium rounded border border-gray-300 px-4 py-2 text-sm text-customBlack"
                                onClick={() => setIsEditing(true)}
                            >
                                Update
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <>
                            <DropdownField
                                label="Outcome"
                                name="outcome"
                                value={formValues.outcome}
                                valueChange={(value) => handleValueChange("outcome", value)}
                                options={outcomeOptions}
                                required
                                error={!formValues.outcome ? "Required" : ""}
                            />
                            {showReason && (
                                <DropdownField
                                    label="Reason"
                                    name="reason"
                                    value={formValues.reason}
                                    valueChange={(value) => handleValueChange("reason", value)}
                                    options={reasonOptionsMap[formValues.outcome]}
                                    required={reasonRequired}
                                    error={reasonRequired && !formValues.reason ? "Required" : ""}
                                />
                            )}
                            <TextAreaField
                                label="Note"
                                name="note"
                                value={formValues.note}
                                valueChange={(e) => handleValueChange("note", e.target.value)}
                                required
                                error={!formValues.note ? "Required" : ""}
                            />
                        </>
                    ) : (
                        <div className="text-sm space-y-4">
                            {formValues.outcome ? (
                                <>
                                    <div className="flex gap-1">
                                        <p className="poppins-medium text-customBlack2">Outcome:</p>
                                        <p className="text-customBlack">{formatDisplayName(formValues.outcome)}</p>
                                    </div>
                                    {formValues.reason && (
                                        <div className="flex gap-1">
                                            <p className="poppins-medium text-customBlack2">Reason:</p>
                                            <p className="text-customBlack">{formatDisplayName(formValues.reason)}</p>
                                        </div>
                                    )}
                                    <div className="flex gap-1">
                                        <p className="poppins-medium text-customBlack2">Note:</p>
                                        <p className="text-customBlack">{formValues.note}</p>
                                    </div>
                                    {/* {isEdited && (
                                        <p className="mt-2 text-xs text-gray-500">
                                            This administration has been edited
                                        </p>
                                    )} */}
                                    <hr />
                                </>
                            ) : (
                                <p className="text-customBlack2">No record of administration</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Medication Info */}
                <div className="space-y-4 text-sm">
                    <h3 className="poppins-medium text-base  text-customBlack">Medication</h3>
                    <div className="flex gap-1">
                        <p className="poppins-medium text-customBlack2">Type:</p>
                        <p className="text-customBlack">{formatDisplayName(data?.type) || "—"}</p>
                    </div>
                    <div className="flex gap-1">
                        <p className="poppins-medium text-customBlack2">Dose:</p>
                        <p className="text-customBlack">{data?.dose || data?.quantityAmount || "—"}</p>
                    </div>
                    {showTime && (
                        <div className="flex gap-1">
                            <p className="poppins-medium text-customBlack2">Time:</p>
                            <p className="text-customBlack">{formattedTime}</p>
                        </div>
                    )}
                </div>

<hr />
                {/* Log */}
                <div className="space-y-3">
                    <h3 className="poppins-medium text-base text-customBlack">Log</h3>
                    <div>
                    <p className="text-sm text-customBlack2">
                        {formattedDate} @ {formatTime} {" "}
                        {formValues.outcome
                            ? `${formatDisplayName(formValues.outcome)}${isEdited ? " (Edited)" : ""}`
                            : "No record of administration"}
                    </p>
                    {data?.administration?.updatedAt && (
                        <p className="text-sm text-customBlack2 mt-1">
                            Last updated: {format(new Date(data.administration.updatedAt), "dd/MM/yyyy @ HH:mm")} {data?.administration?.updatedBy ? `by ${data?.administration?.updatedBy}` : ""}
                        </p>
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
};

MedicationMonitoringDialog.propTypes = {
    data: PropTypes.object,
    onClose: PropTypes.func,
    onSave: PropTypes.func,
};

export default MedicationMonitoringDialog;
