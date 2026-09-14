import { format, addDays, addWeeks, isWithinInterval } from "date-fns";

/**
 * Calculate recurring dates for an event based on its frequency settings
 */
export const getRecurringDates = (event) => {
    const dates = [];
    const { frequency, startDate, endDate, selectedDays, repeatEvery = 1, repeatUnit } = event;

    if (!startDate) return dates;

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : addWeeks(start, 4); // Default to 4 weeks if no end date

    let currentDate = start;
    while (currentDate <= end) {
        if (frequency === "DAILY") {
            dates.push(format(currentDate, "yyyy-MM-dd"));
        } else if (frequency === "WEEKLY" && selectedDays?.length) {
            const currentDay = format(currentDate, "EEEE").toUpperCase();
            if (selectedDays.includes(currentDay)) {
                dates.push(format(currentDate, "yyyy-MM-dd"));
            }
        } else if (frequency === "CUSTOM") {
            const daysToAdd = repeatUnit === "DAYS" ? repeatEvery : 1;
            if (selectedDays?.includes(format(currentDate, "EEEE").toUpperCase())) {
                dates.push(format(currentDate, "yyyy-MM-dd"));
            }
            currentDate = addDays(currentDate, daysToAdd - 1);
        }
        currentDate = addDays(currentDate, 1);
    }

    return dates.filter((date) => !event.deletedDate?.includes(date));
};

/**
 * Get events for a specific date
 */
export const getEventsForDate = (date, events, isBooking = false) => {
    return events.filter((event) => {
        if (isBooking) {
            // Check if the date falls within the booking's date range
            const currentDate = new Date(date);
            const startDate = new Date(event.startDate);
            const endDate = new Date(event.endDate || event.startDate); // Use startDate if endDate is not provided

            return isWithinInterval(currentDate, { start: startDate, end: endDate });
        }
        const recurringDates = getRecurringDates(event);
        return recurringDates.includes(date);
    });
};

/**
 * Calculate appropriate cell height based on contained events
 */
export const getCellHeight = (availabilities, bookings) => {
    const eventHeight = 32; // Updated to match new event height
    const gap = 8; // Increased gap between events
    const sectionGap = 12; // Increased gap between availability and booking sections
    const padding = 12; // Increased bottom padding
    
    const availabilityHeight = availabilities.length ? (availabilities.length * (eventHeight + gap) - gap) : 0;
    const bookingHeight = bookings.length ? (bookings.length * (eventHeight + gap) - gap) : 0;
    
    // Add section gap only if both sections have events
    const totalHeight = availabilityHeight + 
                      (availabilities.length && bookings.length ? sectionGap : 0) + 
                      bookingHeight + 
                      padding;
    
    return Math.max(36, totalHeight); // Minimum height increased to match new event height
};

// Helper function to convert time string to decimal
export const timeToDecimal = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    // For end times at 23:59, round up to 24:00
    if (hours === 23 && minutes === 59) {
        return 24;
    }
    return hours + (minutes / 60);
};

// Generate hours array for the calendar
export const generateHoursArray = () => {
    return Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);
}; 