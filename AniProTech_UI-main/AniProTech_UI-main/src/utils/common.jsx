import CryptoJS from "crypto-js";
// import { APPCONFIG } from "../src/Config/AppConfig";
// const SECRET_KEY = import.meta.env.VITE_APP_SECRET_KEY_KEY;
import { parseISO, getDay, addDays, differenceInCalendarDays, isBefore, isAfter, format } from "date-fns";

export const isNotEmpty = (obj) => obj && Object.keys(obj).length;
export const isNotEmptyArray = (array) => {
    return Array.isArray(array) && array.length > 0;
};
export const isNotEmptyValue = (obj) => obj && Object.keys(obj).length > 0;

export const isEmpty = (value) => {
    if (value === null || value === undefined || value === "") {
        return true;
    }
    if (Array.isArray(value) && value.length === 0) {
        return true;
    }
    if (typeof value === "object" && !Array.isArray(value)) {
        return Object.keys(value).length === 0;
    }

    return false;
};

export const privilegeCheck = (requiredRole) => {
    // const userDetails = JSON.parse(localStorage.getItem("userDetails"));
    const userDetails = decryptData("userDetails");
    return userDetails?.role === requiredRole;
};

export const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB"); // dd/mm/yyyy
};

// utils/dateUtils.js
export function extractDateOnly(dateTime) {
    if (!dateTime) return "-";

    const date = typeof dateTime === "string" ? new Date(dateTime) : dateTime;
    if (isNaN(date)) return "-";

    return date.toISOString().split("T")[0];
}

export const convertStringToDate = (dateString) => {
    const [day, month, year] = dateString.split("/").map(Number);
    return new Date(year, month - 1, day);
};
export function formatDateMonth(dateString) {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
}

export const getStatusBadge = (status, row) => {

    const base = "px-3 py-1 rounded-full text-xs font-medium inline-block";
    
    switch (status) {
        case true:
            return <span className={`${base} bg-green-200 font-semibold text-green-700`}>Active</span>;
        case false:
            return (
                <>
                    <span className={`${base} bg-red-200 font-semibold text-red-500`}>Inactive</span>
                {row !== "teams" &&
                    <span className="ml-3 rounded-full bg-customTableBg px-2 py-1 text-xs font-semibold text-customBlack1">
                        {row?.reason ? `${formatDisplayName(row?.reason)}` : ""}
                    </span>
                }
                </>
            );
        default:
            return <span className={`${base} bg-gray-100 text-gray-500`}>{status}</span>;
    }
};

export const getRiskBadge = (risk) => {
    const base = "w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center border";
    switch (risk) {
        case "GREEN":
            return <span className={`${base} border-green-600 bg-green-50 text-green-600`}>G</span>;
        case "AMBER":
            return <span className={`${base} border-yellow-500 bg-yellow-50 text-yellow-700`}>A</span>;
        case "RED":
            return <span className={`${base} border-red-500 bg-red-50 text-red-600`}>R</span>;
        default:
            return <span className={`${base} border-gray-400 bg-gray-50 text-gray-500`}>-</span>;
    }
};

export const getGroupBadge = (group) => {
    const base = "px-2 py-1 rounded-md text-xs font-semibold bg-orange-100/60 text-orange-800/80";
    return <span className={base}>{group || "Ungrouped"}</span>;
};

export const pronounButtonStyle = (selected, value) =>
    `border-customDropdownBorder border-r px-4 py-2 text-sm last:border-r-0 focus:outline-none ${
        selected === value ? "bg-customDropdown text-customDropdownBorder font-medium" : "bg-white text-black"
    }`;

export const capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str?.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const transformToUpdatePayload = (data) => {
    if (!data || typeof data !== "object") return { update: [] };

    const terminationKeys = ["lastWorkingDay", "type", "reason", "note"];

    const terminationValues = terminationKeys.reduce((acc, key) => {
        if (data.hasOwnProperty(key)) {
            acc[key] = data[key];
        }
        return acc;
    }, {});

    let updateArray = [];

    if (Object.keys(terminationValues).length > 0) {
        updateArray.push({
            attribute_id: "termination",
            value: terminationValues,
        });
    } else {
        updateArray = Object.entries(data).map(([key, value]) => ({
            attribute_id: key,
            value,
        }));
    }

    return { update: updateArray };
};

export const getReferredToAs = (risk) => {
    const base = "w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center border";
    switch (risk) {
        case "HE_HIM":
            return <span>He/Him</span>;
        case "SHE_HER":
            return <span>She/Her</span>;
        case "THEY_THEM":
            return <span>They/Them</span>;
        default:
            return <span>{risk}</span>;
    }
};

export const getInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";
    return `${firstInitial}${lastInitial}`;
};

export const formatTypeOfContact = (types) => {
    if (!types || !types.length) return "—";
    return types
        .map((type) => {
            switch (type) {
                case "NEXT_OF_KIN":
                    return "Next Of Kin";
                case "EMERGENCY":
                    return "Emergency";
                default:
                    return capitalizeFirstLetter(type.toLowerCase());
            }
        })
        .join(", ");
};

export const dayMap = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
};

export const dayIndexMap = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
};

export const changeDayFormat = {
    Sun: "SUNDAY",
    Mon: "MONDAY",
    Tue: "TUESDAY",
    Wed: "WEDNESDAY",
    Thu: "THURSDAY",
    Fri: "FRIDAY",
    Sat: "SATURDAY",
};

export const getNextDayFrom = (baseDate, fullDayName) => {
    const base = typeof baseDate === "string" ? parseISO(baseDate) : baseDate;
    const baseDayIndex = getDay(base);
    const targetDayIndex = dayIndexMap[fullDayName]; // full uppercase now
    const daysToAdd = (targetDayIndex - baseDayIndex + 7) % 7 || 7;
    return addDays(base, daysToAdd);
};

export const getCleanFileName = (path) => {
    const rawName = path?.split("/").pop(); // e.g., new-Web_1747040628085.jpg
    if (!rawName) return "";
    const parts = rawName.split("_");
    if (parts.length > 1) {
        return parts.slice(0, -1).join("_") + "." + rawName.split(".").pop(); // remove last underscore chunk
    }
    return rawName;
};

export const formatDisplayName = (value) => {
    if (!value || typeof value !== "string") return "-";

    return value
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};



// Converts time string (e.g., "13:30") to decimal (e.g., 13.5)
export const timeToDecimal = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const decimal = hours + minutes / 60;
    return Math.min(decimal, 24);
};

// Determines if an event occurs on a given date
export function isEventOnDate(event, date) {
    const eventStart = new Date(event.startDate);
    const eventEnd = event.endDate ? new Date(event.endDate) : null;

    // If date is before the event starts, return false
    if (isBefore(date, eventStart)) return false;

    // If date is after the event ends, return false
    if (eventEnd && isAfter(date, eventEnd)) return false;

    // If the date is marked as deleted, return false
    if (event.deletedDate?.includes(format(date, "yyyy-MM-dd"))) return false;

    // Non-recurring event
    if (!event.repeatUnit) {
        return differenceInCalendarDays(date, eventStart) === 0;
    }

    // Check if the selected day matches
    const dayName = Object.keys(dayMap).find((key) => dayMap[key] === getDay(date));
    if (!event.selectedDays.includes(dayName)) return false;

    const diff = differenceInCalendarDays(date, eventStart);

    // Handle daily recurrence
    if (event.repeatUnit === "DAYS") {
        return diff % event.repeatEvery === 0;
    }

    // Handle weekly recurrence
    if (event.repeatUnit === "WEEKS") {
        const weeks = Math.floor(diff / 7);
        return weeks % event.repeatEvery === 0;
    }

    return false;
}

export const getEventPosition = (event, cellTime) => {
    const eventStart = timeToDecimal(event.startTime);
    const eventEnd = timeToDecimal(event.endTime);

    const startOffset = Math.max(0, (eventStart - timeToDecimal(cellTime)) * 100);
    const duration = Math.min(100, (eventEnd - Math.max(eventStart, timeToDecimal(cellTime))) * 100);

    return { top: `${startOffset}%`, height: `${duration}%` };
};

// Helper: Calculate time difference in minutes
export function calculateDuration(start, end) {
    if (!start || !end) return "";
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const minutes = eh * 60 + em - (sh * 60 + sm);
    return `${minutes} mins`;
}

export const getDurationPercentage = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const start = timeToDecimal(startTime);
    const end = timeToDecimal(endTime);
    const duration = end - start;
    return Math.max(0, Math.min(duration * 100, 100)); // Clamp between 0% and 100%
};

// 48 slots for 30-min intervals
export const times = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2)
        .toString()
        .padStart(2, "0");
    const min = i % 2 === 0 ? "00" : "30";
    return `${hour}:${min}`;
});

export function getSlotIndex(time) {
    // Convert HH:mm or HH:mm:ss string to slot index (0-47)
    const [h, m] = time.split(":").map(Number);
    return h * 2 + (m >= 30 ? 1 : 0);
}

export function getDurationInSlots(startTime, endTime) {
    // Calculate slots count between start and end time
    const startIndex = getSlotIndex(startTime);
    const endIndex = getSlotIndex(endTime);
    // +1 because end time is inclusive of slot start
    return Math.max(endIndex - startIndex + 1, 1);
}

export function getStackedEvents(events) {
    const stacked = [];

    events.forEach((event) => {
        const eventStart = timeToDecimal(event.startTime);
        const eventEnd = timeToDecimal(event.endTime);
        let row = 0;

        // Find the first available row where this event doesn't overlap
        while (stacked.some((e) => e.row === row && !(eventEnd <= timeToDecimal(e.startTime) || eventStart >= timeToDecimal(e.endTime)))) {
            row++;
        }

        stacked.push({ ...event, row });
    });

    return stacked;
}

export const getRiskLevelStyle = (value) => {
    switch (value?.toLowerCase()) {
        case "high":
            return "bg-customInactiveBg text-customInactiveText text-xs";
        case "medium":
            return "bg-customGoldenBg text-customGoldenText text-xs";
        case "low":
            return "bg-customStatusActiveBg text-customStatusActiveText text-xs";
        default:
            return "";
    }
};

export const formatSessions = (sessions) => {
    if (!sessions || sessions.length === 0) return "Morning";

    if (sessions.length === 1) {
        const sessionMap = {
            NIGHT: "Night",
            MORNING: "Morning",
            LUNCH: "Lunch",
            AFTERNOON: "Afternoon",
            EVENING: "Evening",
        };
        return sessionMap[sessions[0]] || sessions[0];
    } else {
        return `${sessions.length} times a day`;
    }
};

export const formatSessionsForEdit = (sessions) => {
    if (!sessions || sessions.length === 0) return ["Morning"];
    const sessionMap = {
        NIGHT: "Night",
        MORNING: "Morning",
        LUNCH: "Lunch",
        AFTERNOON: "Afternoon",
        EVENING: "Evening",
    };
    return sessions.map((session) => sessionMap[session] || "Morning");
};

export const formatFrequency = (frequency, repeatEvery, repeatUnit) => {
    if (frequency === "DAILY") return "Daily";
    if (frequency === "WEEKLY") return "Weekly";
    if (frequency === "CUSTOM") {
        const unit = repeatUnit === "DAYS" ? "day" : "week";
        const unitPlural = repeatEvery > 1 ? `${unit}s` : unit;
        return `Every ${repeatEvery} ${unitPlural}`;
    }
    return frequency;
};

export const formatSelectedDays = (selectedDays) => {
    if (!selectedDays || selectedDays.length === 0) {
        return ["M", "T", "W", "T", "F", "S", "S"];
    }

    const dayMapping = {
        MONDAY: "M",
        TUESDAY: "T",
        WEDNESDAY: "W",
        THURSDAY: "T",
        FRIDAY: "F",
        SATURDAY: "S",
        SUNDAY: "S",
    };

    const allDays = ["M", "T", "W", "T", "F", "S", "S"];
    const activeDays = selectedDays.map((day) => dayMapping[day]).filter(Boolean);

    return allDays.map((day) => (activeDays.includes(day) ? day : null)).map((day, index) => day || allDays[index]);
};

export const timeSlotsMap = {
    Morning: 8,
    Lunch: 13,
    Afternoon: 18,
    Evening: 21,
};

export const showPastScheduleWarning = (values) => {
    const { firstDoseDate, firstDoseTime } = values;
    if (!firstDoseDate || !firstDoseTime) return false;

    const now = new Date();
    const selectedDate = new Date(firstDoseDate);
    const isToday = selectedDate.toDateString() === now.toDateString();

    if (isToday && timeSlotsMap[firstDoseTime]) {
        const selectedHour = timeSlotsMap[firstDoseTime];
        return now.getHours() >= selectedHour;
    }

    // Past date
    return selectedDate < now;
};

export const outcomeOptions = [
    { value: "NOT_OBSERVED", label: "Not Observed" },
    { value: "MAY_BE_TAKEN", label: "May be taken" },
    { value: "NOT_TAKEN", label: "Not taken" },
    { value: "PARTIALLY_TAKEN", label: "Partially taken" },
    { value: "FULLY_TAKEN", label: "Fully taken" },
];

const commonReasons = [
    { value: "REFUSED", label: "Refused" },
    { value: "DESTROYED", label: "Destroyed" },
    { value: "NAUSEA_AND_VOMITING", label: "Nausea and vomiting" },
    { value: "MEDICATION_MISSING", label: "Missing medication" },
    { value: "MEDICATION_ERROR", label: "Medication error" },
    { value: "OTHER", label: "Other" },
];

export const reasonOptionsMap = {
    MAY_BE_TAKEN: commonReasons,
    NOT_TAKEN: commonReasons,
    PARTIALLY_TAKEN: commonReasons,
    NOT_OBSERVED: [
        { value: "FAMILY_ADMINISTERED", label: "Family administered" },
        { value: "HOSPITALISED", label: "Hospitalised" },
        { value: "SELF_ADMINISTERED", label: "Self administered" },
        { value: "PREPARED_AND_LEFT_OUT", label: "Prepared and left out" },
        { value: "OTHER", label: "Other" },
    ],
};

export const formatSlotLabel = (slot) => {
    if (!slot) return "";

    // If slot is a time string (HH:MM or HH:MM:SS)
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(slot)) {
        const [hours, minutes, seconds = 0] = slot.split(":").map(Number);
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        date.setSeconds(seconds);

        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    }

    // Otherwise return slot as-is (e.g., "Morning")
    return slot;
};


export const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};
