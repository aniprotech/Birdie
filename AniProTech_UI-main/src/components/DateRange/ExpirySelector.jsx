import React from "react";
import DropdownDateRangeSelector from "./DateRangePicker";
import DateField from "../DateField/DateField";

const ExpirySelector = ({ dueDate, isNever, onNeverChange, onDateChange, label, error }) => {
    const handleNeverToggle = (checked) => {
        onNeverChange(checked);
        if (!checked) {
            onDateChange(null);
        }
    };

    return (
        <div className="mt-4">
            <label className="poppins-medium mb-1 block text-sm text-customTextGrey">{label ? label : "Expires"}</label>

            <div className="flex flex-col gap-4">
                {/* Never Checkbox */}
                <div className="mt-2 flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="never"
                        checked={!isNever}
                        onChange={() => handleNeverToggle(false)}
                        className="h-4 w-4 cursor-pointer accent-cyan-600"
                    />
                    <label
                        htmlFor="never"
                        className="cursor-pointer text-sm"
                        onClick={() => handleNeverToggle(false)}
                    >
                        Never
                    </label>
                </div>

                {/* On Checkbox and Calendar */}
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="on"
                        checked={isNever}
                        onChange={() => handleNeverToggle(true)}
                        className="h-4 w-4 cursor-pointer accent-cyan-600"
                    />
                    <label
                        htmlFor="on"
                        className="cursor-pointer text-sm"
                        onClick={() => handleNeverToggle(true)}
                    >
                        On
                    </label>

                    <div className={`${!isNever ? "pointer-events-none opacity-50" : ""} pl-3`}>
                        <DateField
                            value={dueDate ? new Date(dueDate) : null}
                            onChange={(e) => onDateChange(e.target.value)}
                            disabled={!isNever}
                        />
                    </div>
                </div>
                {!dueDate && isNever && <p className="text-red-500 text-xs">Please select a date</p>}
            </div>
        </div>
    );
};

export default ExpirySelector;
