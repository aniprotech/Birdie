import { format } from "date-fns";
import { useNavigationHelpers } from "../../../../hooks/useNavigationHelpers";
import PropTypes from "prop-types";
import { Info } from "lucide-react";
import { getFrequencyDisplay, getWhenDisplay, getStartDateDisplay, getEndDateDisplay } from "../../../../utils/dateAndTimeUtil";
import { formatDisplayName } from "../../../../utils/common";

const SchedulingViewDialog = ({ selectedItem, setSelectedItem }) => {
    const { id, navigate } = useNavigationHelpers();
    const isPRN = selectedItem?.type?.toUpperCase() === "PRN";
    const isStopped = selectedItem?.isStopped;

    const InfoRow = ({ label, value, isStatus, isStopped = false }) => (
        <div className="flex items-start gap-4 py-4">
            <div className="poppins-semibold w-[40%] text-sm text-customBlack2">{label}</div>
            <div
                className={`poppins-medium break-words text-sm text-customBlack ${
                    isStatus
                        ? `rounded-full px-2 py-0.5 ${
                              isStopped ? "bg-customInactiveBg text-customInactiveText" : "bg-customStatusActiveBg text-customStatusActiveText"
                          }`
                        : "w-[60%]"
                }`}
            >
                {value || "—"}
            </div>
        </div>
    );

    return (
        <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-gray-200 bg-white shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
                <h2 className="poppins-medium text-base font-semibold">{selectedItem?.medicationDescription || "Medication"}</h2>
                <button
                    onClick={() => setSelectedItem(null)}
                    className="text-xl text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 space-y-4 p-4 text-sm text-customBlack">
                {/* Warning */}
                {isStopped && (
                    <div className="poppins-semibold flex items-start gap-2 rounded border-l-4 border-customBlack bg-customTableBg p-3 text-[13px] text-sm">
                        <Info className="mt-0.5 h-4 w-4 text-customBlack" />
                        <p className="text-customBlack">Stopped medication schedules cannot be edited.</p>
                    </div>
                )}

                {/* Main fields */}
                <div className="divide-y divide-gray-200">
                    <InfoRow
                        label="Status"
                        value={isStopped ? "Stopped" : "Active"}
                        isStatus
                        isStopped={isStopped}
                    />

                    <InfoRow
                        label="Support type"
                        value={isPRN ? selectedItem.type?.toUpperCase() : formatDisplayName(selectedItem.type)}
                    />
                    <InfoRow
                        label="Dose"
                        value={selectedItem.dose}
                    />
                    <InfoRow
                        label="Route"
                        value={formatDisplayName(selectedItem.route)}
                    />

                    {!isPRN && (
                        <>
                            <InfoRow
                                label="Frequency"
                                value={getFrequencyDisplay(selectedItem)}
                            />

                            <InfoRow
                                label="When"
                                value={getWhenDisplay(selectedItem)}
                            />

                            <InfoRow
                                label="Start date"
                                value={getStartDateDisplay(selectedItem)}
                            />

                            <InfoRow
                                label="End date"
                                value={getEndDateDisplay(selectedItem)}
                            />
                            <InfoRow
                                label="Body map"
                                value={selectedItem.bodyMap}
                            />
                        </>
                    )}

                    {isPRN && (
                        <>
                            <InfoRow
                                label="Minimum interval"
                                value={selectedItem.timeBetweenDoses ? `${selectedItem.timeBetweenDoses} ${selectedItem.timeBetweenUnit}` : "—"}
                            />
                            <InfoRow
                                label="Maximum dose per period"
                                value={
                                    selectedItem.maxDoseCount && selectedItem.maxDoseUnit
                                        ? `${selectedItem.maxDoseCount} / ${selectedItem.maxDoseUnit}`
                                        : "—"
                                }
                            />
                            <InfoRow
                                label="Reason for prescription"
                                value={selectedItem.medicalConditionDetails}
                            />
                            <InfoRow
                                label="Circumstances in which dose should be given"
                                value={selectedItem.circumstances}
                            />
                            <InfoRow
                                label="How would the client express they need this medication?"
                                value={selectedItem.clientExpression}
                            />
                            <InfoRow
                                label="Situations when to liaise with GP"
                                value={selectedItem.gpLiaison?.join(", ")}
                            />
                            <InfoRow
                                label="Start date"
                                value={getStartDateDisplay(selectedItem)}
                            />

                            <InfoRow
                                label="End date"
                                value={getEndDateDisplay(selectedItem)}
                            />
                            <InfoRow
                                label="Body map"
                                value={selectedItem.bodyMap}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex justify-between border-t bg-white p-4">
                <button
                    onClick={() => setSelectedItem(null)}
                    className="poppins-semibold rounded border border-customNavy px-3 py-1 text-sm text-customNavy transition hover:bg-blue-50"
                >
                    Close
                </button>

                <button
                    disabled={isStopped}
                    onClick={() => navigate(`/admin/clients/${id}/medication/schedule/edit/${selectedItem?.id}`)}
                    className={`poppins-semibold rounded px-6 py-2 text-sm text-white ${
                        isStopped ? "cursor-not-allowed bg-gray-400" : "bg-customDropdownBorder hover:bg-customDropdownBorder/90"
                    }`}
                >
                    Edit
                </button>
            </div>
        </div>
    );
};

SchedulingViewDialog.propTypes = {
    selectedItem: PropTypes.object.isRequired,
    setSelectedItem: PropTypes.func.isRequired,
};

export default SchedulingViewDialog;
