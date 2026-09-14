import React, { useState, useRef } from "react";
import { format, addDays, subDays, isSameDay, isWithinInterval, startOfYear, endOfYear, isBefore, isAfter } from "date-fns";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Calendar as LucideCalendar } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigationHelpers } from "../../../../hooks/useNavigationHelpers";
import { useClickOutside } from "../../../../hooks/use-click-outside";

const CalenderHeader = ({ startDate, setStartDate }) => {
    const { navigate, id } = useNavigationHelpers();
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef(null); 

    const yearStart = startOfYear(new Date());
    const yearEnd = endOfYear(new Date());
    const endDate = addDays(startDate, 6);

    // Close calendar if clicked outside
    useClickOutside([calendarRef], () => setShowCalendar(false));

    const handlePrev = () => {
        const newStart = subDays(startDate, 7);
        if (!isBefore(newStart, yearStart)) {
            setStartDate(newStart);
        }
    };

    const handleNext = () => {
        const newEnd = addDays(endDate, 7);
        if (!isAfter(newEnd, yearEnd)) {
            setStartDate(addDays(startDate, 7));
        }
    };

    const handleDateChange = (date) => {
        setShowCalendar(false);
    };

    const tileClassName = ({ date, view }) => {
        if (view === "month") {
            if (isSameDay(date, startDate)) {
                return "selected-day";
            }
            if (isWithinInterval(date, { start: startDate, end: endDate })) {
                return "highlighted-day";
            }
        }
        return "";
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b p-3 md:p-6 relative">
            <h2 className="text-base poppins-medium text-gray-700 md:text-xl">
                Carer | <span className="text-customTextNavy">Ajith Kumar</span>
            </h2>

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-customNavy/80">
                    <button
                        onClick={handlePrev}
                        className={`p-1 hover:text-customTextNavy ${isSameDay(startDate, yearStart) ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={isSameDay(startDate, yearStart)}
                    >
                        <FaChevronLeft />
                    </button>
                    <span className="text-sm font-semibold">
                        {format(startDate, "dd MMM yyyy")} - {format(endDate, "dd MMM yyyy")}
                    </span>
                    <button
                        onClick={handleNext}
                        className={`p-1 hover:text-customTextNavy ${isAfter(endDate, yearEnd) ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={isAfter(endDate, yearEnd)}
                    >
                        <FaChevronRight />
                    </button>

                    <button
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="p-1 hover:text-customTextNavy"
                    >
                        <LucideCalendar className="h-5 w-5 text-customTextNavy" />
                    </button>
                </div>
                <button className="rounded bg-customDropdownBorder px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
                    Download visits
                </button>
            </div>

            {showCalendar && (
                <div
                    ref={calendarRef} // Attach the ref here to detect clicks outside
                    className="absolute md:right-10 right-5 top-16 mt-2 z-10 rounded-lg border bg-white p-2 shadow-lg"
                    style={{
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        borderRadius: "8px",
                        padding: "10px",
                        minWidth: "250px",
                    }}
                >
                    <Calendar
                        onClickDay={handleDateChange}
                        value={startDate}
                        tileClassName={tileClassName}
                        className="react-calendar-custom"
                    />
                </div>
            )}
        </div>
    );
};

export default CalenderHeader;
