import PropTypes from "prop-types";
import { format } from "date-fns";
import { formatDisplayName } from "../../../../utils/common";

// Constants
const HOURS_IN_DAY = 24;

// Convert "HH:mm" to decimal hours
const timeToDecimal = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    // For end times at 23:59, round up to 24:00
    if (hours === 23 && minutes === 59) {
        return 24;
    }
    return hours + minutes / 60;
};

// Calculate row position for events - sort ALL events for the day by start time
const calculateRowPosition = (event, allEvents) => {
    // Sort all events by start time first (ASC - earliest first)
    const sortedEvents = allEvents
        .slice() // Create a copy to avoid mutating original array
        .sort((a, b) => {
            // Sort by start time first (ASC - earliest first)
            const timeA = timeToDecimal(a.startTime);
            const timeB = timeToDecimal(b.startTime);
            const timeCompare = timeA - timeB;

            if (timeCompare !== 0) return timeCompare;

            // Then by ID for consistent ordering when times are equal
            return a.id.localeCompare(b.id);
        });

    // Find the index of current event in the sorted list
    const eventIndex = sortedEvents.findIndex((e) => e.id === event.id);
    return eventIndex;
};

const calculateEventDimensions = (startTime, endTime) => {
    const start = timeToDecimal(startTime);
    const end = endTime === "23:59" ? 24 : timeToDecimal(endTime);

    const width = ((end - start) / HOURS_IN_DAY) * 100 * 24;
    console.log("width",width)
    const hourStart = Math.floor(start);
    const left = ((start - hourStart) / HOURS_IN_DAY) * 100 * 24;
    console.log("left",left)

    return { width, left };
};
const calculateFullDayDimensions = () => ({
    width: 100,
    left: 0, 
});

const calculateEventDimensionsForSlot = (startTime, endTime) => {
    const start = timeToDecimal(startTime);
    const end = timeToDecimal(endTime === "23:59" ? "24:00" : endTime);

    const width = ((end - start) / HOURS_IN_DAY) * 100;
    const left = (start / HOURS_IN_DAY) * 100;

    return { width, left };
};

// Availability Event Component
export const AvailabilityEvent = ({ event, title, cellDate, cellKey, onEventClick, allEvents = [] }) => {
    const eventKey = `availability-${event.id}-${cellKey}`;
    const isFullDay = event.startTime === "00:00" && event.endTime === "23:59";


    const { width, left } = isFullDay ? calculateFullDayDimensions() : calculateEventDimensions(event.startTime, event.endTime);

    // Calculate row position for this event among ALL events for this day
    const rowIndex = calculateRowPosition(event, allEvents);

    const timeDisplay = width < 120 ? event.startTime.slice(0, 5) : `${event.startTime.slice(0, 5)}-${event.endTime.slice(0, 5)}`;

    return (
        <div
            key={eventKey}
            className="absolute cursor-pointer overflow-hidden truncate text-ellipsis whitespace-nowrap rounded border border-gray-300 bg-white px-2 py-1.5 text-center text-[11px] text-customTextGrey shadow-sm transition-all duration-200 hover:shadow"
            style={{
                left: `${left}%`,
                width: `${width}%`,
                top: `${rowIndex * 36 + 4}px`, // 36px per row (32px height + 4px gap)
                height: "32px",
                // minWidth: "40px",
                zIndex: 20 + rowIndex,
            }}
            title={title}
            onClick={(e) => {
                e.stopPropagation();
                onEventClick(event, "availability", cellKey, e, cellDate);
            }}
        >
            {timeDisplay}
        </div>
    );
};

// Booking Event Component
export const BookingEvent = ({ event, cellKey, topOffset, onEventClick, title, allEvents = [] }) => {
    const eventKey = `booking-${event.id}-${cellKey}`;
    const isFullDay = event.startTime === "00:00" && event.endTime === "23:59";

    let width, left;

    if (isFullDay) {
        width = 100 * 24;
        left = 0;
    } else {
        const dimensions = calculateEventDimensions(event.startTime, event.endTime);
        width = dimensions.width;
        left = dimensions.left;
    }

    // Calculate row position for this event among ALL events for this day
    const rowIndex = calculateRowPosition(event, allEvents);

    const timeDisplay = width < 120 ? event.startTime.slice(0, 5) : formatDisplayName(event.type);

    return (
        <div
            key={eventKey}
            className="absolute cursor-pointer overflow-hidden truncate text-ellipsis whitespace-nowrap rounded border border-gray-500 bg-[#FFFAF5] px-2 py-1.5 text-center text-[11px] text-customTextGrey shadow-sm transition-all duration-200 hover:shadow"
            style={{
                left: `${left}%`,
                width: `${width}%`,
                top: `${topOffset + rowIndex * 36 + 4}px`, // 36px per row (32px height + 4px gap)
                height: "32px",
                // minWidth: "40px",
                zIndex: 10 + rowIndex,
            }}
            title={title}
            onClick={(e) => onEventClick(event, "booking", cellKey, e)}
        >
            <span>{timeDisplay}</span>
        </div>
    );
};

// Event Tooltip
export const EventTooltip = ({ hoveredEvent, tooltipRef }) => {
    if (!hoveredEvent) return null;

    return (
        <div
            ref={tooltipRef}
            className="fixed z-50 rounded bg-gray-800 px-3 py-1 text-xs text-white shadow-lg"
            style={{
                top: hoveredEvent.position.top + "px",
                left: hoveredEvent.position.left + "px",
            }}
        >
            {`${hoveredEvent.event.startTime.slice(0, 5)} - ${hoveredEvent.event.endTime.slice(0, 5)}`}
        </div>
    );
};

// Event Action Popup
export const EventActionPopup = ({
    clickedEvent,
    buttonRef,
    popupPosition,
    handleDeleteAbsence,
    handleViewAbsenceDetails,
    onDeleteAvailabilityClick,
}) => {
    if (!clickedEvent) return null;

    return (
        <div
            ref={buttonRef}
            className="absolute z-[9999] min-w-[160px] rounded-md border bg-white shadow-lg"
            style={{
                top: `${popupPosition.top}px`,
                left: `${popupPosition.left}px`,
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {clickedEvent.type === "booking" ? (
                <>
                    <button
                        onClick={(e) => handleDeleteAbsence(clickedEvent.event?.id, e)}
                        className="w-full border-b px-4 py-2 text-center text-sm hover:bg-gray-100"
                    >
                        Delete Absence
                    </button>
                    <button
                        onClick={(e) => handleViewAbsenceDetails(clickedEvent.event, e)}
                        className="w-full px-4 py-2 text-center text-sm hover:bg-gray-100"
                    >
                        View Details
                    </button>
                </>
            ) : (
                <button
                    onClick={(e) => onDeleteAvailabilityClick(e, clickedEvent.event, format(new Date(clickedEvent.event.startDate), "yyyy-MM-dd"))}
                    className="w-full px-4 py-2 text-center text-sm hover:bg-gray-100"
                >
                    Delete Availability
                </button>
            )}
        </div>
    );
};

// PropTypes
AvailabilityEvent.propTypes = {
    event: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    cellDate: PropTypes.string.isRequired,
    cellKey: PropTypes.string.isRequired,
    onEventClick: PropTypes.func.isRequired,
    allEvents: PropTypes.array,
};

BookingEvent.propTypes = {
    event: PropTypes.object.isRequired,
    cellKey: PropTypes.string.isRequired,
    topOffset: PropTypes.number.isRequired,
    onEventClick: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    allEvents: PropTypes.array,
};

EventTooltip.propTypes = {
    hoveredEvent: PropTypes.object,
    tooltipRef: PropTypes.object,
};

EventActionPopup.propTypes = {
    clickedEvent: PropTypes.object,
    buttonRef: PropTypes.object,
    popupPosition: PropTypes.object,
    handleDeleteAbsence: PropTypes.func.isRequired,
    handleViewAbsenceDetails: PropTypes.func.isRequired,
    onDeleteAvailabilityClick: PropTypes.func.isRequired,
};
