import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, subDays, isSameDay, isWithinInterval, startOfYear, endOfYear, isBefore, isAfter } from "date-fns";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import AddAvailability from "./AddAvailability";
import { useNavigationHelpers } from "../../../../hooks/useNavigationHelpers";
import { useGlobalStore } from "../../../../stores/useGlobalStore";

const AvailabilityHeader = ({ startDate, setStartDate, showPopup, setShowPopup }) => {
    const { navigate, id } = useNavigationHelpers();
    const endDate = addDays(startDate, 6);
    const yearStart = startOfYear(new Date());
    const yearEnd = endOfYear(new Date());
    const { teamsPersonalDetailData } = useGlobalStore();

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

    const handleAddAvailability = () => {
        navigate(`/admin/teams/${id}/availability?add=new`);
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const handleBookAbsence = () => {
        navigate(`/admin/teams/${id}/availability/book-absence`);
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b p-3 md:p-8">
            <h2 className="poppins-medium text-base text-customTextGrey md:text-xl">
                {`${teamsPersonalDetailData?.firstName}'s availability schedule`}
            </h2>

            <div className="flex flex-wrap items-center gap-3">
                <div className="gap-2 text-xs font-medium text-customNavy/80 md:flex md:items-center md:text-sm">
                    <button
                        onClick={handlePrev}
                        className={`p-1 hover:text-customTextNavy ${isSameDay(startDate, yearStart) ? "cursor-not-allowed opacity-50" : ""}`}
                        disabled={isSameDay(startDate, yearStart)}
                    >
                        <FaChevronLeft />
                    </button>
                    <span className="font-semibold">
                        {format(startDate, "dd MMM yyyy")} - {format(endDate, "dd MMM yyyy")}
                    </span>
                    <button
                        onClick={handleNext}
                        className={`p-1 hover:text-customTextNavy ${isAfter(endDate, yearEnd) ? "cursor-not-allowed opacity-50" : ""}`}
                        disabled={isAfter(endDate, yearEnd)}
                    >
                        <FaChevronRight />
                    </button>
                </div>
                <button
                    onClick={handleAddAvailability}
                    className="rounded bg-customDropdownBorder px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                >
                    Add availability
                </button>
                <button
                    onClick={handleBookAbsence}
                    className="rounded bg-customDropdownBorder px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                >
                    Book absence
                </button>
            </div>

            {showPopup && <AddAvailability onClose={handleClosePopup} />}
        </div>
    );
};

export default AvailabilityHeader;
