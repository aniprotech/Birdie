import { addMonths, format } from "date-fns";

export const getFrequencyDisplay = (selectedItem) => {
  if (selectedItem.frequencyType === "DAILY") {
    const map = {
      1: "Once daily",
      2: "Twice daily",
      3: "Three times daily",
      4: "Four times daily",
    };
    return map[selectedItem.dailyTimes] || "Multiple times daily";
  } else if (selectedItem.frequencyType === "CUSTOM") {
    return selectedItem.customRepeat && selectedItem.customUnit
      ? `Every ${selectedItem.customRepeat} ${selectedItem.customUnit}`
      : "—";
  }
  return "—";
};

export const getWhenDisplay = (selectedItem) => {
  if (selectedItem.selectedTimeSlots?.length > 0) {
    return selectedItem.selectedTimeSlots.join(", ");
  } else if (
    selectedItem.exactTimes &&
    typeof selectedItem.exactTimes === "object"
  ) {
    const times = Object.values(selectedItem.exactTimes)
      .map((t) => {
        if (!t) return null;

        // Match HH:mm or HH:mm:ss
        const timeRegex = /^([0-1]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
        if (timeRegex.test(t)) {
          return format(new Date(`1970-01-01T${t}`), "hh:mm a");
        }
        return t; // return label like "Morning", "Lunch"
      })
      .filter(Boolean);

    return times.length ? times.join(", ") : "—";
  }

  return "—";
};

export const getStartDateDisplay = (selectedItem) => {
  if (selectedItem.firstDoseDate) {
    if (selectedItem.firstDoseTime) {
      const time = selectedItem.firstDoseTime;
      const isValidTime = /^([0-1]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(time);
      if (isValidTime) {
        return format(new Date(`${selectedItem.firstDoseDate}T${time}`), "dd MMM yyyy, hh:mm a");
      }
    }
    return format(new Date(selectedItem.firstDoseDate), "dd MMM yyyy");
  }

  if (selectedItem.prnStartDate) {
    return format(new Date(selectedItem.prnStartDate), "dd MMM yyyy");
  }

  return "—";
};

export const getEndDateDisplay = (selectedItem) => {
  if (selectedItem.lastDoseDate) {
    if (selectedItem.lastDoseTime) {
      const time = selectedItem.lastDoseTime;
      const isValidTime = /^([0-1]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(time);
      if (isValidTime) {
        return format(new Date(`${selectedItem.lastDoseDate}T${time}`), "dd MMM yyyy, hh:mm a");
      }
    }
    return format(new Date(selectedItem.lastDoseDate), "dd MMM yyyy");
  }

  if (selectedItem.prnEndDate) {
    return format(new Date(selectedItem.prnEndDate), "dd MMM yyyy");
  }

  return "—";
};

export const generateMonthOptions = () => {
  const startDate = new Date(2013, 0);
  const endDate = addMonths(new Date(), 3);
  const months = [];
  let current = startDate;

  while (current <= endDate) {
      const label = format(current, "MMMM yyyy");
      const value = `${format(current, "MMMM")}_${format(current, "yyyy")}`;
      months.push({ label, value });
      current = addMonths(current, 1);
  }
  return months;
};

export const formatTime24Hour = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");  // HH
  const minutes = String(date.getMinutes()).padStart(2, "0");  // mm

  return `${hours}:${minutes}`; // e.g., "17:22"
};


export const formatCustomDate = (dateStr, prefix = "Created") => {
  try {
      const date = new Date(dateStr);
      const day = date.getDate();
      const suffix =
          day % 10 === 1 && day !== 11 ? "st" :
          day % 10 === 2 && day !== 12 ? "nd" :
          day % 10 === 3 && day !== 13 ? "rd" : "th";
      const formatted = format(date, `d'${suffix}' MMMM yyyy`);
      return `${prefix} ${formatted}`;
  } catch {
      return "";
  }
};
