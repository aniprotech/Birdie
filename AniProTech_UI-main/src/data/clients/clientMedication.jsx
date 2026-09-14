export const getCurrentStatus = (clientInactivity = []) => {
    if (!Array.isArray(clientInactivity) || clientInactivity.length === 0) return "Active";

    const currentDate = new Date();

    const activeInactivity = clientInactivity.find((item) => {
        const start = new Date(item.startDate);
        if (item.type === "PERMANENT") {
            return start <= currentDate;
        }

        if (item.type === "TEMPORARY") {
            const end = item.endDate ? new Date(item.endDate) : null;
            return start <= currentDate && (!end || currentDate <= end);
        }

        return false;
    });

    if (activeInactivity) {
        if (activeInactivity.type === "TEMPORARY") return " Inactive";
        if (activeInactivity.type === "PERMANENT") return "Inactive";
    }

    return "Active";
};

export const renderStatusBadge = (status) => {
    let colorClass = "bg-green-100 border border-green-500 text-green-800";

    if (status === " Inactive") {
        colorClass = "bg-yellow-100 border border-yellow-500 text-yellow-800";
    } else if (status === "Inactive") {
        colorClass = "bg-red-100 border border-red-500 text-red-800";
    }

    return (
        <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${colorClass}`}
        >
            {status}
        </span>
    );
};

export const displayValue = (val) => {
    if (!val) return "";
    return val.charAt(0) + val.slice(1).toLowerCase();
};


// Generate route options dynamically from medication data
export const getRouteOptions = (medication) => {
    const staticRoutes =
        medication?.routes?.map((route) => ({
            value: route
                .toUpperCase()
                .replace(/[^A-Z0-9]+/g, "_")
                .replace(/^_+|_+$/g, ""),
            label: route,
        })) || [];

    // Always add "Others" option
    return [...staticRoutes, { value: "OTHERS", label: "Others" }];
};

export const getOutcomeDisplay = (outcome) => {
  switch (outcome) {
    case "FULLY_TAKEN":
      return {
        content: "",
        className: "bg-customStatusActiveBg text-customStatusActiveText border border-customStatusActiveText rounded-full w-3 h-3 text-[10px] font-medium",
        tooltip: "Fully taken"
      };
    case "NOT_TAKEN":
      return {
        content: "n/t",
        className: "bg-customInactiveBg text-customInactiveText border border-customInactiveText rounded-full px-1.5 py-1.5 text-[10px] font-medium",
        tooltip: "Not Taken"
      };
    case "NOT_OBSERVED":
      return {
        content: "n/o",
        className: "bg-gray-300 text-gray-800 border border-gray-300 rounded-full px-1.5 py-1.5 text-[10px] font-medium",
        tooltip: "Not Observed"
      };
    case "MAY_BE_TAKEN":
      return {
        content: "m/t",
        className: "bg-customGoldenBg text-customGoldenText border border-customGoldenText rounded-full px-1.5 py-1.5 text-[10px] font-medium",
        tooltip: "May Be Taken"
      };
    case "PARTIALLY_TAKEN":
      return {
        content: "p/t",
        className: "bg-yellow-100 text-orange-900 border border-orange-300 rounded-full px-1.5 py-1.5 text-[10px] font-medium",
        tooltip: "Partially taken"
      };
    default:
      return {
        content: "s/a",
        className: "bg-white text-gray-800 border border-gray-300 rounded px-1.5 py-1.5 text-[10px] font-medium",
        tooltip: "Self Administrated"
      };
  }
};


export const formatMedicationType = (type) => {
    switch (type) {
        case "PRN":
            return "PRN";
        case "SCHEDULED":
            return "Scheduled";
        case "BLISTER_PACK":
            return "Blister Pack";
        case "TABLET":
            return "Tablet";
        case "CAPSULE":
            return "Capsule";
        case "INJECTION":
        default:
            return type;
    }
}