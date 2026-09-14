import PropTypes from "prop-types";

const VisitEvent = ({ event, onClick }) => {
    const isNotStarted = event.status === "Not started";
    const isScheduled = event.status === "Scheduled";

    return (
        <div
            className={`relative mb-2 cursor-pointer rounded border ${isNotStarted ? "border-customEventCardBorder" : "border-gray-200 bg-white"}`}
            onClick={() => onClick(event)}
        >
            {/* Title with time */}
            <div className="mb-2 px-3 pt-3 text-sm font-medium text-gray-900">
                <span>
                    <span className="poppins-semibold text-base">{event.dayAbbr}</span> {event.startTime}
                    {event.endTime ? ` – ${event.endTime}` : ""}
                </span>
            </div>

            {/* Tasks/Medication info */}
            <div className="text-customEventCardBorder mb-2 px-3 text-sm">{event.tasks || "No tasks or medication"}</div>

            {/* Status and provider */}
            <div
                className={`flex items-center justify-between px-3 ${isNotStarted ? "bg-customEventNotStartedCardBg text-customEventCardBorder" : isScheduled ? "bg-customEventSheduleCardBg text-customEventSheduleCardBorder" : "bg-gray-100 text-gray-800"}`}
            >
                <span className={`rounded-full py-2 text-sm font-medium`}>{event.status}</span>
                <span className="text-customEventCardBorder text-sm">{event.provider || "No carers"}</span>
            </div>

            {/* Additional Info Badge */}
            {event.additionalInfo && (
                <div className="absolute right-2 top-2 flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                    <span className="text-gray-400">👤</span>
                    {event.additionalInfo}
                </div>
            )}

            {/* Checkbox for tasks if present */}
            {event.hasCheckbox && (
                <div className="absolute left-2 top-2">
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                        checked={event.isChecked}
                        onChange={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

VisitEvent.propTypes = {
    event: PropTypes.shape({
        dayAbbr: PropTypes.string.isRequired,
        startTime: PropTypes.string.isRequired,
        endTime: PropTypes.string,
        status: PropTypes.string.isRequired,
        tasks: PropTypes.string,
        provider: PropTypes.string,
        additionalInfo: PropTypes.string,
        hasCheckbox: PropTypes.bool,
        isChecked: PropTypes.bool,
    }).isRequired,
    onClick: PropTypes.func.isRequired,
};

export default VisitEvent;
