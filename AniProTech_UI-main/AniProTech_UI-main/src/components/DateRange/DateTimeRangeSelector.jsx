import React from "react";
import { format, parseISO } from "date-fns";
import DateField from "../DateField/DateField";
import { dayIndexMap, getNextDayFrom } from "../../utils/common";

const DateTimeRangeSelector = ({ values, handleChange, endType = false, onEndTypeChange, isEndDateInvalid }) => {
    const today = new Date();
    const { startDate, endDate, startTime, endTime } = values || {};
    const shortDay = values?.schedule?.selectedDays?.[0];

    let firstOccurrenceDate = startDate;

    if (shortDay && dayIndexMap[shortDay] !== undefined) {
        firstOccurrenceDate = getNextDayFrom(startDate, shortDay);
    }

    const formattedDate = format(typeof firstOccurrenceDate === "string" ? parseISO(firstOccurrenceDate) : firstOccurrenceDate, "eeee, dd MMMM");

    const displayText = startDate && startTime && endTime ? `The first occurrence will be on ${formattedDate} from ${startTime} to ${endTime}.` : "";

    const minDate = format(today, "yyyy-MM-dd");

    return (
        <div className="mt-4 space-y-6">
            {/* Starts Section */}
            <div>
                <DateField
                    name="startDate"
                    label="Starts"
                    value={startDate || minDate}
                    onChange={handleChange}
                    required
                    style="mt"
                    min={minDate}
                    access={true}
                />
                {displayText && <p className="mt-2 text-sm text-gray-600">{displayText}</p>}
            </div>

            {/* Ends Section */}
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                    Ends <span className="text-red-600">*</span>
                </label>

                <div className="flex items-center space-x-6">
                    {/* Never Option */}
                    <label className="flex cursor-pointer items-center space-x-2">
                        <input
                            type="radio"
                            name="endType"
                            value="never"
                            checked={endType === false}
                            onChange={() => onEndTypeChange(false)}
                            className="h-4 w-4 text-cyan-600 accent-cyan-600"
                        />
                        <span className="text-sm">Never</span>
                    </label>

                    {/* On Option */}
                    <label className="flex cursor-pointer items-center space-x-2">
                        <input
                            type="radio"
                            name="endType"
                            value="on"
                            checked={endType === true}
                            onChange={() => onEndTypeChange(true)}
                            className="h-4 w-4 text-cyan-600 accent-cyan-600"
                        />
                        <span className="text-sm">On</span>
                    </label>

                    <div className={`w-60 pl-3 ${!endType ? "pointer-events-none opacity-50" : ""}`}>
                        <DateField
                            name="endDate"
                            label=""
                            value={endDate || startDate}
                            onChange={handleChange}
                            style="mt"
                            disabled={!endType}
                            min={minDate}
                            access={true}
                        />
                    </div>
                </div>
                {isEndDateInvalid && <p className="text-xs text-red-600">End date must be after the start date.</p>}
            </div>
        </div>
    );
};

export default DateTimeRangeSelector;
