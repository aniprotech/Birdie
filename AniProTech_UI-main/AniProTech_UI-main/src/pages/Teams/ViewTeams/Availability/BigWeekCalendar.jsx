import { useState, useRef } from "react";
import { format, addDays, isToday } from "date-fns";
import { timeToDecimal } from "../../../../utils/common";
import DeleteAvailabilityPopUp from "./DeleteAvailabilityPopUp";
import { useClickOutside } from "../../../../hooks/use-click-outside";
import { _delete } from "../../../../utils/ApiService";
import APIConfig from "../../../../utils/ApiConfig";
import { fetchData } from "../../../../utils/FetchData";
import { useNavigationHelpers } from "../../../../hooks/useNavigationHelpers";
import PropTypes from "prop-types";

// Import from new utility and component files
import { getEventsForDate, getCellHeight, generateHoursArray } from "./CalendarUtils";
import { AvailabilityEvent, BookingEvent, EventActionPopup } from "./CalendarEvents";

// Generate hours array
const hours = generateHoursArray();

const CustomWeekCalendar = ({ startDate, availabilityData = [], bookingData = [], fetchAvailability, fetchBookingAbsence }) => {
    const [selectedAvailability, setSelectedAvailability] = useState(null);
    const [clickedEvent, setClickedEvent] = useState(null);
    const [selectedDate, setSelectedDate] = useState([]);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

    const { id, navigate } = useNavigationHelpers();

    const buttonRef = useRef();
    const tableRef = useRef();

    useClickOutside([buttonRef], () => {
        setClickedEvent(null);
    });

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

    const handleEventClick = (event, type, cellKey, e, cellDate) => {
        e.stopPropagation();

        const rect = e.currentTarget.getBoundingClientRect();
        const tableRect = tableRef.current.getBoundingClientRect();

        const popupWidth = 160;
        const popupHeight = type === "booking" ? 80 : 40;

        const relativeLeft = rect.left - tableRect.left;
        const relativeTop = rect.bottom - tableRect.top;

        let left = relativeLeft + rect.width / 2 - popupWidth / 2;
        let top = relativeTop;

        const tableWidth = tableRect.width;
        left = Math.max(10, Math.min(left, tableWidth - popupWidth - 10));

        const tableHeight = tableRect.height;
        const spaceBelow = tableHeight - relativeTop;

        if (spaceBelow < popupHeight + 20) {
            top = rect.top - tableRect.top - popupHeight - 8;
        } else {
            top = relativeTop + 4;
        }

        setClickedEvent({ type, event, cellKey });
        setPopupPosition({ top, left });

        if (type === "availability" && cellDate) {
            setSelectedDate([cellDate]);
        }
    };

    const handleDeleteAvailability = () => {
        setSelectedAvailability(null);
        setClickedEvent(null);
        fetchAvailability();
    };

    const handleDeleteAbsence = async (bookingId, e) => {
        e.stopPropagation();
        const response = await fetchData(() => _delete(APIConfig?.TEAMS?.TEAM_AVAILABILITY_BOOKING_DELETE(bookingId)));
        if (response?.data?.error === false) fetchBookingAbsence();
        setClickedEvent(null);
    };

    const handleViewAbsenceDetails = (data, e) => {
        e.stopPropagation();
        navigate(`/admin/teams/${id}/availability/book-absence`, { state: data });
        setClickedEvent(null);
    };

    const handleDeleteAvailabilityClick = (e, event, date) => {
        e.stopPropagation();
        setSelectedDate((prev) => Array.from(new Set([...(event?.deletedDate || []), ...prev, date])));
        setSelectedAvailability(event);
        setClickedEvent(null);
    };

    return (
        <div
            className="relative w-full bg-white text-xs"
            onClick={() => {
                setClickedEvent(null);
            }}
        >
            <div className="w-full overflow-x-auto">
                <div
                    className="min-w-[1200px]"
                    ref={tableRef}
                >
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="sticky top-0 z-10 bg-white">
                                <th className="w-32 border-b border-customNavy1 p-2"></th>
                                {hours.map((hour) => (
                                    <th
                                        key={hour}
                                        className="relative border-b border-customNavy1 p-2 pb-5 text-left text-xs text-customDefaultTextColor"
                                    >
                                        <span className="absolute -ml-6 text-xs text-customDefaultTextColor">{hour}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {weekDays.map((day) => {
                                const cellDate = format(day, "yyyy-MM-dd");
                                const isCurrentDay = isToday(day);

                                return (
                                    <tr key={cellDate}>
                                        <td className="border-b border-r border-customNavy1 bg-[#F6F7F9] p-2">
                                            <div className="flex items-center justify-between">
                                                <span className={isCurrentDay ? "text-customDropdownBorder" : ""}>{format(day, "EEEE")}</span>
                                                <span
                                                    className={`flex h-7 w-7 items-center justify-center rounded-md ${isCurrentDay ? "bg-customDropdownBorder text-white" : "bg-gray-200"}`}
                                                >
                                                    {format(day, "d")}
                                                </span>
                                            </div>
                                        </td>

                                        {hours.map((hour) => {
                                            const cellHour = timeToDecimal(hour);
                                            const cellKey = `${cellDate}-${hour}`;

                                            const allAvailabilitiesForDay = getEventsForDate(cellDate, availabilityData);
                                            const allBookingsForDay = getEventsForDate(cellDate, bookingData, true);

                                            const availabilities = allAvailabilitiesForDay
                                                .filter((a) => {
                                                    const startHour = Math.floor(timeToDecimal(a.startTime));
                                                    return startHour === Math.floor(cellHour);
                                                })
                                                .sort((a, b) => timeToDecimal(a.startTime) - timeToDecimal(b.startTime));

                                            const bookings = allBookingsForDay
                                                .filter((b) => {
                                                    const startHour = Math.floor(timeToDecimal(b.startTime));
                                                    return startHour === Math.floor(cellHour);
                                                })
                                                .sort((a, b) => timeToDecimal(a.startTime) - timeToDecimal(b.startTime));

                                            const cellHeight = getCellHeight(allAvailabilitiesForDay, allBookingsForDay);

                                            return (
                                                <td
                                                    key={cellKey}
                                                    className="relative border-b border-r border-customNavy1 bg-customCalenderBg p-0"
                                                >
                                                    <div
                                                        className="relative w-full"
                                                        style={{ height: `${cellHeight}px` }}
                                                    >
                                                        <div
                                                            className="relative w-full"
                                                            style={{
                                                                height: availabilities.length ? `${availabilities.length * 36}px` : "0",
                                                                minHeight: availabilities.length ? `${availabilities.length * 36}px` : "0",
                                                            }}
                                                        >
                                                            {availabilities.map((event) => (
                                                                <AvailabilityEvent
                                                                    key={`${event.id}-${cellKey}`}
                                                                    event={event}
                                                                    title={`${event.startTime.slice(0, 5)} - ${event.endTime.slice(0, 5)}`}
                                                                    cellDate={cellDate}
                                                                    cellKey={cellKey}
                                                                    onEventClick={handleEventClick}
                                                                    allEvents={allAvailabilitiesForDay}
                                                                />
                                                            ))}
                                                        </div>

                                                        <div
                                                            className="relative w-full"
                                                            style={{
                                                                height: bookings.length ? `${bookings.length * 36}px` : "0",
                                                                minHeight: bookings.length ? `${bookings.length * 36}px` : "0",
                                                                marginTop: allAvailabilitiesForDay.length && allBookingsForDay.length ? "12px" : "0",
                                                            }}
                                                        >
                                                            {bookings.map((event) => (
                                                                <BookingEvent
                                                                    key={`booking-${event.id}-${cellKey}`}
                                                                    event={event}
                                                                    title={`${event.startTime.slice(0, 5)} - ${event.endTime.slice(0, 5)}`}
                                                                    cellKey={cellKey}
                                                                    topOffset={
                                                                        allAvailabilitiesForDay.length > 0
                                                                            ? allAvailabilitiesForDay.length * 36 + 12
                                                                            : 0
                                                                    }
                                                                    onEventClick={handleEventClick}
                                                                    allEvents={allBookingsForDay}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Event Action Popup */}
            <EventActionPopup
                clickedEvent={clickedEvent}
                buttonRef={buttonRef}
                popupPosition={popupPosition}
                handleDeleteAbsence={handleDeleteAbsence}
                handleViewAbsenceDetails={handleViewAbsenceDetails}
                onDeleteAvailabilityClick={handleDeleteAvailabilityClick}
            />

            {/* Delete Availability Popup */}
            {selectedAvailability && (
                <DeleteAvailabilityPopUp
                    selectedAvailability={selectedAvailability}
                    handleDeleteAvailability={handleDeleteAvailability}
                    setSelectedAvailability={setSelectedAvailability}
                    selectedDate={selectedDate}
                    selectedAvailabilityDate={selectedDate[0]}
                />
            )}
        </div>
    );
};

CustomWeekCalendar.propTypes = {
    startDate: PropTypes.instanceOf(Date).isRequired,
    availabilityData: PropTypes.arrayOf(PropTypes.object),
    bookingData: PropTypes.arrayOf(PropTypes.object),
    fetchAvailability: PropTypes.func.isRequired,
    fetchBookingAbsence: PropTypes.func.isRequired,
};

export default CustomWeekCalendar;
