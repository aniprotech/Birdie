import { useEffect, useState } from "react";
import moment from "moment";
import PropTypes from "prop-types";
import { formattedEvents, timeGroups } from "../../../../data/clients/clientVisitData";
import VisitEvent from "./VisitEvents";
import VisitDialog from "./VisitDialog";

const VisitCalendar = ({ startDate = new Date(), clientName }) => {
    const [weekDays, setWeekDays] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedVisit, setSelectedVisit] = useState(null);

    useEffect(() => {
        // Generate week days starting from Monday
        const start = moment(startDate).startOf("week").add(1, "day");
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = moment(start).add(i, "days");
            days.push({
                date: day,
                dayName: day.format("dddd"),
                dayNumber: day.format("D"),
                dayAbbr: day.format("ddd"),
                isToday: day.isSame(moment(), "day"),
            });
        }
        setWeekDays(days);
        setEvents(formattedEvents);
    }, [startDate]);

    const handleEventClick = (event) => {
        console.log("event",event)
        setSelectedVisit(event);
    };

    // Get maximum height for each time group across all days
    const getMaxTimeGroupHeight = (timeGroup) => {
        let maxHeight = 120; // Base height
        
        weekDays.forEach((day) => {
            const eventsInSlot = events.filter(
                (event) => event.dayAbbr === day.dayAbbr && event.timeGroup === timeGroup.label
            );
            const eventCount = eventsInSlot.length;
            
            if (eventCount > 0) {
                const calculatedHeight = Math.max(220, 80 + (eventCount * 100));
                maxHeight = Math.max(maxHeight, calculatedHeight);
            }
        });
        
        return `${maxHeight}px`;
    };

    return (
        <div className="h-screen bg-white">
            {/* Main Calendar Container */}
            <div className="relative h-full overflow-auto">
                <div className="min-w-[2800px]">
                    {/* Calendar Header */}
                    <div className="sticky top-0 z-10 grid grid-cols-[140px_repeat(7,1fr)] border-b border-gray-200 bg-customGrey2">
                        <div className="border-r border-gray-200 " />
                        {weekDays.map((day) => (
                            <div
                                key={day.dayNumber}
                                className="flex flex-col items-center border-r border-gray-200 p-2 last:border-r-0"
                            >
                                <span className={`text-sm font-medium ${day.isToday ? "text-customDropdownBorder poppins-semibold" : "text-gray-700"}`}>{day.dayName}</span>
                                <div className="mt-2 flex flex-col items-center">
                                    <span
                                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium
                                            ${day.isToday ? "bg-customDropdownBorder text-white" : "text-customGrey1 italic"}`}
                                    >
                                        {day.dayNumber}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-[140px_repeat(7,1fr)]">
                        {/* Time Groups Column */}
                        <div className="sticky left-0 z-10 bg-customGrey2">
                            {timeGroups?.map((group) => (
                                <div
                                    key={group.label}
                                    className="border-b border-r border-gray-200"
                                    style={{ height: getMaxTimeGroupHeight(group) }}
                                >
                                    <div className="p-4">
                                        <div className="text-sm font-medium text-gray-700">
                                            {group.label}
                                        </div>
                                        {group.displayTime !== "Anytime" && (
                                            <div className="mt-1 text-xs text-gray-500">
                                                {group.displayTime}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Days Grid */}
                        {weekDays.map((day) => (
                            <div
                                key={day.dayNumber}
                                className="border-r border-gray-200 last:border-r-0"
                            >
                                {timeGroups.map((timeGroup) => {
                                    const dayEvents = events.filter(
                                        (event) => event.dayAbbr === day.dayAbbr && event.timeGroup === timeGroup.label
                                    );
                                    
                                    return (
                                        <div
                                            key={timeGroup.label}
                                            className="relative border-b border-gray-200 bg-white"
                                            style={{ height: getMaxTimeGroupHeight(timeGroup) }}
                                        >
                                            <div className="p-2">
                                                {dayEvents.map((event) => (
                                                    <VisitEvent
                                                        key={event.id}
                                                        event={event}
                                                        onClick={handleEventClick}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Visit Dialog */}
            {selectedVisit && (
                <VisitDialog
                    visit={selectedVisit}
                    medication={false}
                    onClose={() => setSelectedVisit(null)}
                    clientName={clientName}
                />
            )}
        </div>
    );
};

VisitCalendar.propTypes = {
    startDate: PropTypes.instanceOf(Date),
};

export default VisitCalendar;
