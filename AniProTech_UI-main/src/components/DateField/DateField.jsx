import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaRegCalendarAlt } from "react-icons/fa";

const DateField = ({ name, label, value, onChange, onBlur, style, error,minDate, required, access, disable }) => {
    const handleDateChange = (date) => {
        if (date) {
            const formattedDate = date.toISOString().split("T")[0]; // yyyy-MM-dd
            onChange({ target: { name, value: formattedDate } });
        }
    };

    return (
        <div className="mb-4 w-fit">
            <label
                htmlFor={name}
                className={`block ${style === "textSize" ? "text-base poppins-medium text-customNavy" : "text-sm"} poppins-medium text-customTextGrey`}
            >
                {label}
                {required && <span className="text-red-500"> *</span>}
            </label>

            <div className={`relative ${style === "mt" || style === "width" ? "mt-2" : ""}`}>
                <DatePicker
                    selected={value}
                    onChange={handleDateChange}
                    onBlur={onBlur}
                    dateFormat="dd-MM-yyyy"
                    minDate={minDate ? new Date(minDate) : undefined}
                    disabled={disable}
                    className={` ${style === "width" ? "w-full" : "min-w-[160px] md:min-w-[180px]"} disabled:cursor-text cursor-pointer rounded border p-3 pr-10 text-sm ${error ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-1`}
                    placeholderText="dd-mm-yyyy"
                    // shouldCloseOnSelect={!access} // Prevent closing on select if access is true
                />
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transform text-customTextGrey">
                    <FaRegCalendarAlt />
                </div>
            </div>

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
};

export default DateField;
