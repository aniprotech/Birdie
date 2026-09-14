import React, { useState } from "react";
import useScrollToTop from "../../../../hooks/useScrollToTop";
import CalenderHeader from "./ClientsCalenderHeader";
import SchedulingCalender from "./ClientsSchedulingCalender";
import { startOfWeek, addDays, subDays, format } from "date-fns";

const ClientsCalendarIndex = () => {
    const [mode, setMode] = useState("");
    const [data, setData] = useState([]);

    // Get today's date
    const today = new Date();

    // Find the start of the week (Monday)
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday as the start of the week

    // Calculate the end of the week (Sunday)
    const endOfCurrentWeek = addDays(startOfCurrentWeek, 6); // 6 days after Monday gives Sunday

    // Set the initial start and end dates for the current week
    const [startDateState, setStartDate] = useState(startOfCurrentWeek);

    useScrollToTop();

    return (
        <div className="space-y-7">
            <div>
                <CalenderHeader
                    name="CalenderHeader"
                    data={data}
                    setData={setData}
                    mode={mode}
                    setMode={setMode}
                    startDate={startDateState}
                    setStartDate={setStartDate}
                    startDateRange={format(startDateState, "dd MMM yyyy")}  // Passing formatted start date
                    endDateRange={format(endOfCurrentWeek, "dd MMM yyyy")}  // Passing formatted end date
                />
            </div>
            <div className="px-5 pb-10">
                <SchedulingCalender
                    name="SchedulingCalender"
                    data={data}
                    setData={setData}
                    mode={mode}
                    setMode={setMode}
                    startDate={startDateState}
                    setStartDate={setStartDate}
                />
            </div>
        </div>
    );
};

export default ClientsCalendarIndex;
