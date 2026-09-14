import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { format, eachDayOfInterval, isWithinInterval, isValid, lastDayOfMonth, parseISO, isBefore, startOfDay, differenceInDays, isToday, getHours, getMinutes } from "date-fns";
import { Tooltip } from "react-tooltip";
import MedicationMonitoringDialog from "./MedicationMonitoringDialog";
import { formatMedicationType, getOutcomeDisplay } from "../../../../data/clients/clientMedication";
import { useNavigationHelpers } from "../../../../hooks/useNavigationHelpers";
import { TIME_SLOT_MAPPING } from "../../../../constants/clientMedication";

const MedicationMonitoringChart = ({ data, setData, fetchSchedulingData, selectedMonth }) => {
    const [selectedEntry, setSelectedEntry] = useState(null);
    const { id, navigate } = useNavigationHelpers();


    const [monthName, year] = useMemo(() => {
        if (typeof selectedMonth === "string" && selectedMonth.includes("_")) {
            return selectedMonth.split("_");
        }
        return ["January", "2025"];
    }, [selectedMonth]);

    const dateStart = useMemo(() => {
        const d = new Date(`${monthName} 1, ${year}`);
        return isValid(d) ? d : new Date("2025-01-01");
    }, [monthName, year]);

    const dateEnd = lastDayOfMonth(dateStart);

    const days = useMemo(() => {
        return eachDayOfInterval({ start: dateStart, end: dateEnd });
    }, [dateStart, dateEnd]);

    const safeParseISO = (dateString) => (typeof dateString === "string" && dateString.length >= 10 ? parseISO(dateString) : null);

    // Helper function to get custom tooltip text for specific outcomes
    const getCustomTooltipText = (outcome, administration) => {
        // Handle default/s/a case
        if (!outcome || outcome === "default") {
            return "Self Administrated";
        }

        // Handle specific outcome mappings
        const tooltipMap = {
            "NOT_OBSERVED": "Not Observed",
            "MAY_BE_TAKEN": "May be taken",
            "FULLY_TAKEN": "Fully taken",
            "PARTIALLY_TAKEN": "Partially taken",
            "NOT_TAKEN": "Not taken"
        };

        let tooltipText = tooltipMap[outcome] || outcome?.replaceAll("_", " ")?.toLowerCase() || "Unknown outcome";

        // Add edited information if available
        if (administration?.updatedAt || administration?.updatedBy) {
            tooltipText += " (Edited)";
        }

        return tooltipText;
    };

    // Helper function to check if a cell is within client inactivity period
    const isWithinClientInactivity = (day, doseTime) => {
        if (!data?.clientInactivities || data.clientInactivities.length === 0) {
            return false;
        }

        const dayStr = format(day, "yyyy-MM-dd");
        
        return data.clientInactivities.some(inactivity => {
            const startDate = inactivity.startDate;
            const endDate = inactivity.endDate;
            const startTime = inactivity.startTime ? inactivity.startTime.substring(0, 5) : "00:00";
            const endTime = inactivity.endTime ? inactivity.endTime.substring(0, 5) : "23:59";
            
            // Check if day is within the inactivity date range
            if (dayStr < startDate || dayStr > endDate) {
                return false;
            }
            
            // If it's a single day inactivity
            if (startDate === endDate) {
                return doseTime >= startTime && doseTime <= endTime;
            }
            
            // If it's the start date, check if dose time is after start time
            if (dayStr === startDate) {
                return doseTime >= startTime;
            }
            
            // If it's the end date, check if dose time is before end time
            if (dayStr === endDate) {
                return doseTime <= endTime;
            }
            
            // If it's a day in between, it's fully within inactivity period
            return true;
        });
    };

    // Helper function to check if a dose time has passed on a given day
    const isDoseTimePassed = (day, doseTime) => {
        const now = new Date();
        
        // If it's not today, check if it's in the past
        if (!isToday(day)) {
            return isBefore(day, startOfDay(now));
        }
        
        // For today, check if the dose time has passed
        if (doseTime === "—" || !doseTime || !doseTime.includes(":")) return false;
        
        try {
            // Parse dose time (handle HH:MM format)
            const [doseHours, doseMinutes] = doseTime.split(":").map(Number);
            const currentHours = getHours(now);
            const currentMinutes = getMinutes(now);
            
            // Convert to minutes for easier comparison
            const doseTimeInMinutes = doseHours * 60 + doseMinutes;
            const currentTimeInMinutes = currentHours * 60 + currentMinutes;
            
            return currentTimeInMinutes > doseTimeInMinutes;
        } catch (error) {
            console.error("Error parsing dose time:", doseTime, error);
            return false;
        }
    };

    // Helper function to check if a day should be active based on frequency
    const isDayActive = (med, day) => {
        const startDate = med.isPRN ? med.prnStartDate : med.firstDoseDate;
        const endDate = med.isPRN ? med.prnEndDate : med.lastDoseDate;

        const start = safeParseISO(startDate);
        const end = safeParseISO(endDate);

        if (!isValid(start)) return false;

        // Check if day is within date range
        // If no end date, continue till the end of the calendar month
        const isInRange = end ? isWithinInterval(day, { start, end }) : !isBefore(day, start) && !isBefore(dateEnd, day);

        if (!isInRange) return false;

        // Handle different frequency types
        if (med.frequencyType === "DAILY") {
            return true;
        } else if (med.frequencyType === "CUSTOM") {
            const daysDiff = differenceInDays(day, start);

            if (med.customUnit === "days") {
                return daysDiff % (med.customRepeat || 1) === 0;
            } else if (med.customUnit === "weeks") {
                const weeksDiff = Math.floor(daysDiff / 7);
                return weeksDiff % (med.customRepeat || 1) === 0 && daysDiff % 7 === 0;
            }
        }

        return true;
    };

    // Helper function to get time for a dose
    const getDoseTime = (med, doseNumber) => {
        // First check exactTimes
        if (med.exactTimes && med.exactTimes[`dose${doseNumber}`]) {
            const time = med.exactTimes[`dose${doseNumber}`];
            return time.substring(0, 5); // Convert "08:00:00" to "08:00"
        }

        // Then check selectedTimeSlots
        if (med.selectedTimeSlots && med.selectedTimeSlots.length > 0) {
            const slotIndex = doseNumber - 1;
            if (slotIndex < med.selectedTimeSlots.length) {
                const slot = med.selectedTimeSlots[slotIndex];
                if (TIME_SLOT_MAPPING[slot]) {
                    return TIME_SLOT_MAPPING[slot];
                }
                // If it's already a time format
                if (slot.includes(":")) {
                    return slot.length > 5 ? slot.substring(0, 5) : slot;
                }
                return slot;
            }
        }

        return "—";
    };

    // Helper function to get slot name for matching with pastAdministrations
    const getDoseSlot = (med, doseNumber) => {
        if (med.selectedTimeSlots && med.selectedTimeSlots.length > 0) {
            const slotIndex = doseNumber - 1;
            if (slotIndex < med.selectedTimeSlots.length) {
                return med.selectedTimeSlots[slotIndex];
            }
        }
        return `dose${doseNumber}`;
    };

    // Helper function to get outcome for a specific date and dose
    const getOutcomeForDateAndDose = (med, day, doseNumber) => {
        if (!med.pastAdministrations || med.pastAdministrations.length === 0) {
            return null;
        }

        const dayStr = format(day, "yyyy-MM-dd");
        const expectedSlot = getDoseSlot(med, doseNumber);

        // Find matching administration by date and slot
        const administration = med.pastAdministrations.find((admin) => {
            if (admin.date !== dayStr) return false;

            // Match by slot name (case insensitive)
            return admin.slot?.toLowerCase() === expectedSlot?.toLowerCase();
        });

        return administration;
    };

    // Create rows for each medication with separate rows for each dose
    const medicationRows = useMemo(() => {
        const rows = [];

        data?.medicationSchedules?.forEach((med) => {
            const dailyTimes = med.dailyTimes || 1;
            const isStopped = med?.isStopped;
            const isPRN = med.type === "PRN" || (med.prnStartDate && med.prnEndDate);

            // Determine date range
            const startDate = safeParseISO(isPRN ? med?.prnStartDate : med?.firstDoseDate);
            const endDate = safeParseISO(isPRN ? med?.prnEndDate : med?.lastDoseDate);

            // Create a row for each dose
            for (let doseNumber = 1; doseNumber <= dailyTimes; doseNumber++) {
                const doseTime = getDoseTime(med, doseNumber);
                const doseSlot = getDoseSlot(med, doseNumber);

                rows.push({
                    ...med,
                    doseNumber,
                    doseTime,
                    doseSlot,
                    startDate,
                    endDate,
                    isStopped,
                    isPRN,
                    isFirstDose: doseNumber === 1,
                    isLastDose: doseNumber === dailyTimes,
                });
            }
        });

        return rows;
    }, [data?.medicationSchedules]);

    return (
        <div className="overflow-auto text-sm">
            <table className="min-w-full border-collapse">
                <thead className="sticky top-0 z-10 bg-white">
                    <tr className="border-b border-gray-200">
                        <th className="poppins-medium sticky left-0 z-20 w-[360px] border-r border-gray-300 bg-white px-4 py-2 text-left text-sm text-customBlack2">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">Medication</div>
                                <div className="flex items-center justify-end text-center">
                                    <div className="w-[60px] text-sm">Dose #</div>
                                    <div className="w-[80px] text-sm">Time</div>
                                </div>
                            </div>
                        </th>
                        {days.map((day) => (
                            <th
                                key={day.toISOString()}
                                className="w-[60px] bg-gray-100 px-2 py-1 text-center text-sm font-medium text-customBlack2"
                            >
                                {format(day, "d")}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {medicationRows?.map((row, index) => {
                        const textColor = row.isStopped ? "text-customBlack" : "text-customTextLightNavy";
                        const cursor = row.isStopped ? "" : "cursor-pointer";

                        // Check if this is the last dose of the current medication
                        const nextRow = medicationRows[index + 1];
                        const isLastDoseOfMedication = !nextRow || nextRow.id !== row.id;

                        return (
                            <tr
                                key={`${row.id}-${row.doseNumber}`}
                                className={isLastDoseOfMedication ? "border-b border-gray-200" : ""}
                            >
                                <td className="sticky left-0 z-10 w-[360px] border-r border-gray-300 bg-white px-4">
                                    <div className="flex items-stretch justify-between">
                                        <div className="flex-1">
                                            {row.isFirstDose && (
                                                <div className="flex flex-col justify-center gap-1">
                                                    <div
                                                        className={`${textColor} ${cursor} max-w-[200px] truncate font-medium`}
                                                        // title={row?.medicationDescription}
                                                        onClick={() => !row.isStopped && navigate(`/admin/clients/${id}/medication/schedule/edit/${row.id}`)}
                                                    >
                                                        {row?.medicationDescription || "Unnamed Medication"}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {formatMedicationType(row.type)} / {row.quantityAmount || row.dose}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center text-center">
                                            <div className="w-[60px] text-customBlack">
                                                <span className="text-sm font-medium">{row.doseNumber}</span>
                                            </div>
                                            <div className="w-[80px]">
                                                <span className="text-sm text-customBlack2">{row.doseTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {days.map((day) => {
                                    const isActiveDay = isDayActive(row, day);
                                    const administration = getOutcomeForDateAndDose(row, day, row.doseNumber);
                                    const doseTime = row.doseTime;
                                    const isInClientInactivity = isWithinClientInactivity(day, doseTime);
                                    const doseTimePassed = isDoseTimePassed(day, doseTime);

                                    let outcomeDisplay = null;
                                    let isClickable = false;
                                    let tooltipContent = "";

                                    if (isInClientInactivity) {
                                        // Client inactivity period - show black shaded cell
                                        outcomeDisplay = {
                                            // className: "px-2 py-1 rounded bg-black/20",
                                            content: "-",
                                            tooltip: "Client Inactivity"
                                        };
                                        tooltipContent = "Client Inactivity";
                                    } else if (isActiveDay) {
                                        if (administration) {
                                            // There's a pastAdministration record for this date/slot
                                            outcomeDisplay = getOutcomeDisplay(administration.outcome);
                                            // Always clickable if there's an administration record and dose time has passed
                                            isClickable = doseTimePassed;
                                            tooltipContent = getCustomTooltipText(administration.outcome, administration);
                                        } else {
                                            // No pastAdministration record but day is active
                                            outcomeDisplay = getOutcomeDisplay("default"); // This will show s/a
                                            // For PRN: only clickable if dose time has passed (to update past s/a)
                                            // For regular medications: clickable if dose time has passed
                                            isClickable = doseTimePassed;
                                            tooltipContent = "Self Administrated";
                                        }
                                    } else {
                                        // No data for this cell
                                        tooltipContent = "Not Scheduled";
                                    }

                                    const tooltipId = `tooltip-${row.id}-${row.doseNumber}-${format(day, "yyyy-MM-dd")}`;

                                    return (
                                        <td
                                            key={day.toISOString()}
                                            className="bg-gray-100 px-2 py-2 text-center"
                                        >
                                            <div className="mx-auto flex h-[40px] w-[44px] items-center justify-center">
                                                {outcomeDisplay && (
                                                    <>
                                                        <div
                                                            data-tooltip-id={tooltipId}
                                                            data-tooltip-content={tooltipContent}
                                                            // title={tooltipContent}
                                                            className={`${outcomeDisplay.className} ${
                                                                isClickable ? "cursor-pointer hover:opacity-80" : ""
                                                            }`}
                                                            onClick={() => {
                                                                if (isClickable) {
                                                                    setSelectedEntry({
                                                                        ...row,
                                                                        date: day,
                                                                        administration,
                                                                        doseNumber: row.doseNumber,
                                                                        doseTime: row.doseTime,
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            {outcomeDisplay.content}
                                                        </div>
                                                        <Tooltip 
                                                            id={tooltipId}
                                                            place="bottom"
                                                            className="z-50"
                                                        />
                                                    </>
                                                )}
                                                {!outcomeDisplay && (
                                                    <>
                                                        <div
                                                            data-tooltip-id={tooltipId}
                                                            data-tooltip-content={tooltipContent}
                                                            // title={tooltipContent}
                                                            className="h-8 w-8"
                                                        />
                                                        <Tooltip 
                                                            id={tooltipId}
                                                            place="bottom"
                                                            className="z-50"
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {selectedEntry && (
                <MedicationMonitoringDialog
                    data={selectedEntry}
                    onClose={() => setSelectedEntry(null)}
                    onSave={() => {
                        setSelectedEntry(null);
                        fetchSchedulingData();
                    }}
                />
            )}
        </div>
    );
};

MedicationMonitoringChart.propTypes = {
    data: PropTypes.object.isRequired,
    selectedMonth: PropTypes.string.isRequired,
};

export default MedicationMonitoringChart;
