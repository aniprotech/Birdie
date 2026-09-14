import { useState, useRef } from "react";
import { format, addDays, subDays, isSameDay, isWithinInterval, startOfYear, endOfYear, isBefore, isAfter } from "date-fns";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Calendar as LucideCalendar, Info } from "lucide-react";
import "react-calendar/dist/Calendar.css";
import { useClickOutside } from "../../../../hooks/use-click-outside";
import PropTypes from "prop-types";
import AddVisit from "./AddVisit";

const VisitHeader = ({ startDate, setStartDate, clientName }) => {
    const [showAddVisitModal, setShowAddVisitModal] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const calendarRef = useRef(null);

    const yearStart = startOfYear(new Date());
    const yearEnd = endOfYear(new Date());
    const endDate = addDays(startDate, 6);

    const clientNameTitle = clientName ? clientName.firstName : "Dummy";
    useClickOutside([calendarRef, dropdownRef], () => {
        // setShowAddVisitModal(false);
        setShowDropdown(false);
    });

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
        setStartDate(date);
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
            <div className="flex items-center gap-4">
                <h2 className="text-base poppins-medium text-gray-700 md:text-xl">
                    {clientNameTitle}&apos;s visit schedule
                </h2>
                <div className="relative flex items-center flex-row flex-wrap gap-1">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-2 rounded-md focus:bg-purple-50 px-3 py-1.5 text-sm font-medium text-customTextLightNavy"
                    >
                        1 visit need reviewing
                        <span className="text-xs">▼</span>
                    </button>
                    <div className="relative">
                        <Info 
                            className="ml-2 h-5 w-5 text-gray-400 cursor-help"
                            onMouseEnter={(e) => {
                                const tooltip = document.getElementById('tooltip');
                                tooltip.style.display = 'block';
                                const rect = e.target.getBoundingClientRect();
                                tooltip.style.left = `${rect.right + 10}px`;
                                tooltip.style.top = `${rect.top}px`;
                            }}
                            onMouseLeave={() => {
                                document.getElementById('tooltip').style.display = 'none';
                            }}
                        />
                        <div
                            id="tooltip"
                            className="fixed hidden z-50 p-2 bg-customBlack1 text-white text-sm rounded shadow-lg max-w-xs"
                        >
                            Check this tab to see what information for a visit might be missing e.g. funding.
                        </div>
                    </div>
                    {showDropdown && (
                        <div
                            ref={dropdownRef}
                            className="absolute top-full left-0 mt-1 w-72 rounded-md bg-white shadow-lg border border-gray-200 z-20"
                        >
                            <div className="p-3">
                                <div className="text-sm font-medium text-gray-900">No tasks added, no carers assigned and no funding information specified</div>
                                <div className="mt-1 text-sm text-gray-500">Monday 9 Jun at 9:00am</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

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
                        {format(startDate, "dd")} - {format(endDate, "dd MMM")}
                    </span>
                    <button
                        onClick={handleNext}
                        className={`p-1 hover:text-customTextNavy ${isAfter(endDate, yearEnd) ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={isAfter(endDate, yearEnd)}
                    >
                        <FaChevronRight />
                    </button>


                </div>

                <button
                    onClick={() => setShowAddVisitModal(true)}
                    className="rounded bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                >
                    + Add visit
                </button>

                <button className="rounded bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
                    Download visits
                </button>

                {showAddVisitModal && <AddVisit onClose={() => setShowAddVisitModal(false)} />}
            </div>
        </div>
    );
};

VisitHeader.propTypes = {
    startDate: PropTypes.instanceOf(Date).isRequired,
    setStartDate: PropTypes.func.isRequired,
};

export default VisitHeader;
