import PropTypes from "prop-types";
import { format, parseISO, isValid, isBefore, startOfDay, isToday, getHours, getMinutes } from "date-fns";
import classNames from "classnames";
import { useNavigationHelpers } from "../../../../hooks/useNavigationHelpers";
import { useState, useMemo } from "react";
import MedicationMonitoringDialog from "./MedicationMonitoringDialog";
import { getOutcomeDisplay } from "../../../../data/clients/clientMedication";
import { formatDisplayName, timeSlotsMap } from "../../../../utils/common";

const MedicationMonitoringTable = ({ data, fetchSchedulingData }) => {
    const { id, navigate } = useNavigationHelpers();
    const [selectedItem, setSelectedItem] = useState(null);

    const isWithinClientInactivity = (date, clientInactivities) => {
        if (!clientInactivities || clientInactivities.length === 0) {
            return null;
        }

        const dateStr = typeof date === 'string' ? date : format(date, "yyyy-MM-dd");
        
        return clientInactivities.find(inactivity => {
            const startDate = inactivity.startDate;
            const endDate = inactivity.endDate;
            
            // Check if date is within the inactivity date range
            return dateStr >= startDate && dateStr <= endDate;
        });
    };

    // Helper function to check if a date is in the past
    const isDateInPast = (date) => {
        const now = new Date();
        const checkDate = typeof date === 'string' ? parseISO(date) : date;
        return isValid(checkDate) && isBefore(checkDate, startOfDay(now));
    };

    // Helper function to get dose time from medication data
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
                
                // If it's already a time format (HH:MM or HH:MM:SS)
                if (slot.includes(":")) {
                    return slot.length > 5 ? slot.substring(0, 5) : slot;
                }
                
                // Use timeSlotsMap for text slots
                if (timeSlotsMap[slot]) {
                    const hour = timeSlotsMap[slot];
                    return `${hour.toString().padStart(2, '0')}:00`;
                }
                
                return slot;
            }
        }

        return "—";
    };

    // Helper function to check if a dose time has passed on today
    const isDoseTimePassed = (doseTime) => {
        if (doseTime === "—" || !doseTime || !doseTime.includes(":")) return false;
        
        try {
            const now = new Date();
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

    // Flatten the data to show each pastAdministration as a separate row
    const flattenedData = useMemo(() => {
        if (!data?.medicationSchedules) return [];
        
        const rows = [];
        
        // Filter out PRN medications
        const nonPRNMedications = data.medicationSchedules.filter(med => med.type !== "PRN");
        
        nonPRNMedications.forEach((medication) => {
            if (medication.pastAdministrations && medication.pastAdministrations.length > 0) {
                // Add rows for existing past administrations (these are already in the past)
                medication.pastAdministrations.forEach((administration) => {
                    const administrationDate = new Date(administration.date);
                    
                    // Only show if the date is in the past
                    if (isDateInPast(administrationDate)) {
                        const inactivity = isWithinClientInactivity(administration.date, data.clientInactivities);
                        
                        rows.push({
                            ...medication,
                            administration,
                            // For dialog compatibility
                            date: administrationDate,
                            doseNumber: 1, // You might need to derive this from slot
                            doseTime: administration.time || "—",
                            isClientInactive: !!inactivity,
                            inactivityData: inactivity,
                            outcome: inactivity ? "CLIENT_INACTIVE" : administration.outcome,
                            isPastData: true, // Mark as past data for editing
                        });
                    }
                });
            }
            
            if (medication.firstDoseDate) {
                const startDate = parseISO(medication.firstDoseDate);
                const endDate = medication.lastDoseDate ? parseISO(medication.lastDoseDate) : new Date();
                
                if (isValid(startDate)) {
                    // Check each day from start to end (or current date) to see if it's past and should show self-administered
                    let currentDate = startDate;
                    const now = new Date();
                    
                    while (currentDate <= endDate && currentDate <= now) {
                        const isCurrentDateToday = isToday(currentDate);
                        
                        if (isDateInPast(currentDate) || isCurrentDateToday) {
                            // For each dose of this medication on this date
                            const dailyTimes = medication.dailyTimes || 1;
                            
                            for (let doseNumber = 1; doseNumber <= dailyTimes; doseNumber++) {
                                const doseTime = getDoseTime(medication, doseNumber);
                                const doseSlot = getDoseSlot(medication, doseNumber);
                                
                                // For today, only show doses where time has passed
                                // For past dates, show all doses
                                const shouldShowDose = isCurrentDateToday ? isDoseTimePassed(doseTime) : true;
                                
                                if (shouldShowDose) {
                                    // Check if this date and slot already has a past administration
                                    const hasAdministration = medication.pastAdministrations?.some(admin => 
                                        admin.date === format(currentDate, "yyyy-MM-dd") && 
                                        admin.slot?.toLowerCase() === doseSlot?.toLowerCase()
                                    );
                                    
                                    if (!hasAdministration) {
                                        const inactivity = isWithinClientInactivity(currentDate, data.clientInactivities);
                                        
                                        rows.push({
                                            ...medication,
                                            administration: null,
                                            date: new Date(currentDate),
                                            doseNumber,
                                            doseTime,
                                            doseSlot,
                                            isClientInactive: !!inactivity,
                                            inactivityData: inactivity,
                                            outcome: inactivity ? "CLIENT_INACTIVE" : "default", // default means self-administered
                                            isSelfAdministered: !inactivity,
                                            isPastData: true, // Mark as past data for editing
                                        });
                                    }
                                }
                            }
                        }
                        
                        // Move to next day
                        currentDate = new Date(currentDate);
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                }
            }
        });
        
        return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [data?.medicationSchedules, data?.clientInactivities]);

    const formatDate = (value) => {
        try {
            return value ? format(new Date(value), "MMM dd") : "—";
        } catch {
            return "—";
        }
    };

    const formatTime = (dateTimeString) => {
        try {
            return dateTimeString ? format(new Date(dateTimeString), "hh:mm a") : "";
        } catch {
            return "";
        }
    };

    const renderOutcome = (outcome, isClickable = false) => {
        // Handle client inactive case
        if (outcome === "CLIENT_INACTIVE") {
            return (
                <span 
                    className={classNames(
                        "inline-flex items-center rounded-full px-2 py-1 text-sm font-medium capitalize",
                        "bg-gray-200 text-black",
                        isClickable ? "cursor-pointer hover:opacity-80" : ""
                    )}
                >
                    Client Inactive
                </span>
            );
        }

        // Use getOutcomeDisplay for other outcomes
        const outcomeDisplay = getOutcomeDisplay(outcome);
        
        return (
            <div className="flex items-center gap-2">
                <span 
                    className={classNames(
                        outcomeDisplay.className,
                        isClickable ? "cursor-pointer hover:opacity-80" : ""
                    )}
                >
                    {outcomeDisplay.content}
                </span>
                <span className="text-sm text-gray-600 capitalize cursor-pointer">
                    {outcome === "default" ? "Self administered" : outcome?.replaceAll("_", " ")?.toLowerCase()}
                </span>
            </div>
        );
    };

    const handleOutcomeClick = (e, item) => {
        e.stopPropagation();
        // All past data should be editable
        if (item.isPastData) {
            setSelectedItem(item);
        }
    };

    const handleMedicationClick = (e) => {
        e.stopPropagation();
        navigate(`/admin/clients/${id}/medication/scheduling`);
    };

    return (
        <div className="w-full overflow-x-auto">
            <div className="min-w-[1100px] rounded-lg border border-gray-200 bg-white">
                <table className="poppins-regular w-full table-auto text-sm">
                    <thead className="poppins-medium bg-gray-50 text-sm text-customGrey1">
                        <tr className="border-b border-gray-200 text-left">
                            <td className="min-w-[160px] whitespace-nowrap px-4 py-3">Outcome</td>
                            <td className="min-w-[160px] whitespace-nowrap px-4 py-3">Reason</td>
                            <td className="min-w-[300px] whitespace-nowrap px-4 py-3">Medication</td>
                            <td className="min-w-[140px] whitespace-nowrap px-4 py-3">Date</td>
                            <td className="min-w-[160px] whitespace-nowrap px-4 py-3">Carer</td>
                            <td className="min-w-[200px] whitespace-nowrap px-4 py-3">Edited</td>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white text-customBlack">
                        {flattenedData.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                    No medication data found
                                </td>
                            </tr>
                        ) : (
                            flattenedData.map((item, index) => {
                                // All past data should be editable
                                const isOutcomeClickable = item.isPastData;
                                
                                return (
                                    <tr
                                        key={`${item.id}-${item.administration?.date || item.date}-${item.administration?.slot || 'default'}-${index}`}
                                        className="transition-colors duration-150 hover:bg-gray-50 poppins-medium text-customBlack2"
                                    >
                                        <td className="px-4 py-4">
                                            <div onClick={(e) => handleOutcomeClick(e, item)}>
                                                {renderOutcome(item.outcome, isOutcomeClickable)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {item.isClientInactive 
                                                ? "—" 
                                                : item.administration?.reason ? formatDisplayName(item.administration.reason) : "—"
                                            }
                                        </td>
                                        <td
                                            className="poppins-medium cursor-pointer px-4 py-4 text-customTextLightNavy hover:text-customTextLightNavy/80"
                                            onClick={(e) => handleMedicationClick(e)}
                                        >
                                            {item.medicationDescription || "—"}
                                        </td>
                                        <td className="px-4 py-4">
                                            {formatDate(item.administration?.date || item.date)}
                                        </td>
                                        <td className="px-4 py-4">
                                            {item.isClientInactive 
                                                ? "—"
                                                : item.clientFirstName && item.clientLastName 
                                                    ? `${item.clientFirstName} ${item.clientLastName}`
                                                    : item.administration?.carer || "—"
                                            }
                                        </td>
                                        <td className="px-4 py-4">
                                            {item.isClientInactive 
                                                ? "—"
                                                : (() => {
                                                    const timeToShow = item.administration?.updatedAt || item.createdAt;
                                                    const updatedBy = item.administration?.updatedBy;
                                                    const formattedTime = formatTime(timeToShow);
                                                    
                                                    if (updatedBy && formattedTime) {
                                                        return `${updatedBy} @ ${formattedTime}`;
                                                    } else if (updatedBy) {
                                                        return updatedBy;
                                                    } else if (formattedTime) {
                                                        return formattedTime;
                                                    }
                                                    return "—";
                                                })()
                                            }
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {selectedItem && (
                    <MedicationMonitoringDialog
                        data={selectedItem}
                        onClose={() => setSelectedItem(null)}
                        showTime={false}
                        onSave={() => {
                            setSelectedItem(null);
                            if (fetchSchedulingData) {
                                fetchSchedulingData();
                            }
                        }}
                        // Add flag to indicate this is from table (to hide time in dialog)
                        hideTimeInDialog={true}
                    />
                )}
            </div>
        </div>
    );
};

MedicationMonitoringTable.propTypes = {
    data: PropTypes.object.isRequired,
    fetchSchedulingData: PropTypes.func,
};

export default MedicationMonitoringTable;
