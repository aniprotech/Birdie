import { useState } from "react";
import { startOfWeek, addDays, format } from "date-fns";
import useScrollToTop from "../../../../hooks/useScrollToTop";
import VisitHeader from "./VisitHeader";
import VisitCalendar from "./VisitCalendar";
import { useGlobalStore } from "../../../../stores/useGlobalStore";

const VisitIndex = () => {
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
    const endOfCurrentWeek = addDays(startOfCurrentWeek, 6); 
    const [startDateState, setStartDate] = useState(startOfCurrentWeek);
    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData ? clientsPersonalDetailData : "Dummy";

    useScrollToTop();

    return (
        <div className="">
            <div>
                <VisitHeader
                    startDate={startDateState}
                    setStartDate={setStartDate}
                    startDateRange={format(startDateState, "dd MMM yyyy")}
                    endDateRange={format(endOfCurrentWeek, "dd MMM yyyy")}
                    clientName={clientName}
                />
            </div>
            <div className="">
                <VisitCalendar startDate={startDateState} clientName={clientName} />
            </div>
        </div>
    );
};

export default VisitIndex;
