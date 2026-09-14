import React, { useEffect, useState } from "react";
import AddAvailability from "./AddAvailability";
import { addDays, isWithinInterval } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";

const ShowAvailabilityDetails = ({ startDate, showPopup, setShowPopup, fetchAvailability }) => {
    const [showAddAvailability, setShowAddAvailability] = useState(false);
    const today = new Date();
    const navigate = useNavigate();
    const {id} = useParams();

    const inCurrentWeek = isWithinInterval(today, {
        start: new Date(startDate),
        end: addDays(new Date(startDate), 6),
    });


    const isFuture = new Date(startDate).setHours(0, 0, 0, 0) > today.setHours(0, 0, 0, 0);

    const shouldShowButton = inCurrentWeek || isFuture;

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    if (showAddAvailability && showPopup) {
        return (
            <AddAvailability
                onClose={handleClosePopup}
                fetchAvailability={fetchAvailability}
            />
        );
    }

    return (
        <div className="mt-20 text-center">
            {shouldShowButton ? (
                <div className="flex flex-col items-center justify-center space-y-4 md:h-[40vh]">
                    <h2 className="text-xl font-semibold md:text-2xl">No availability</h2>
                    <p className="mt-2 text-sm text-gray-600">Before you can begin, you need to create an availability schedule.</p>
                    <button
                        onClick={() => {
                            setShowAddAvailability(true);
                            setShowPopup(true);
                            navigate(`/admin/teams/${id}/availability?add=new`);
                        }}
                        className="mt-4 rounded border border-customNavy/70 px-4 py-2 text-sm font-medium hover:bg-customCarerFeedBg"
                    >
                        Create availability schedule
                    </button>
                </div>
            ) : (
                <h2 className="flex flex-col items-center justify-center space-y-4 text-xl text-customTextGrey md:h-[40vh]">
                    No availability scheduled for this week.
                </h2>
            )}
        </div>
    );
};

export default ShowAvailabilityDetails;
