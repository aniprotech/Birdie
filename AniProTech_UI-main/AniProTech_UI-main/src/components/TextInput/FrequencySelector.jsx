import React from "react";
import { changeDayFormat } from "../../utils/common";

const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const FrequencySelector = ({ value = {}, onChange, error }) => {
    const { frequency = "DAILY", repeatEvery = 1, repeatUnit = "WEEKS", selectedDays = [] } = value;

    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const handleDayToggle = (day) => {
        const fullDay = changeDayFormat[day];

        const newDays = selectedDays.includes(fullDay) ? selectedDays.filter((d) => d !== fullDay) : [...selectedDays, fullDay];

        const sortedDays = newDays.sort((a, b) => Object.values(changeDayFormat).indexOf(a) - Object.values(changeDayFormat).indexOf(b));

        onChange({
            frequency: frequency.toUpperCase(),
            repeatEvery,
            repeatUnit,
            selectedDays: sortedDays,
        });
    };

    const handleFrequencyChange = (val) => {
        const upperVal = val.toUpperCase();
        onChange({
            frequency: upperVal,
            repeatEvery: upperVal === "CUSTOM" ? repeatEvery : 1,
            repeatUnit: upperVal === "CUSTOM" ? repeatUnit : "WEEKS",
            selectedDays: upperVal !== "DAILY" ? selectedDays : [],
        });
    };

    const handleRepeatChange = (e) => {
        const num = parseInt(e.target.value, 10);
        onChange({
            frequency: frequency.toUpperCase(),
            repeatEvery: num,
            repeatUnit,
            selectedDays,
        });
    };

    const handleUnitChange = (e) => {
        onChange({
            frequency: frequency.toUpperCase(),
            repeatEvery,
            repeatUnit: e.target.value.toUpperCase(),
            selectedDays,
        });
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="poppins-medium text-sm text-customTextGrey">
                    Select frequency <span className="text-red-600">*</span>
                </label>
                <div className="mt-2 flex w-max overflow-x-auto rounded-md border border-gray-300">
                    {["daily", "weekly", "custom"].map((opt) => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => handleFrequencyChange(opt)}
                            className={`border-r px-4 py-2 text-sm last:border-r-0 ${
                                frequency === opt.toUpperCase()
                                    ? "poppins-medium bg-customDropdown text-customDropdownBorder"
                                    : "bg-white text-customTextGrey"
                            }`}
                        >
                            {capitalizeFirstLetter(opt)}
                        </button>
                    ))}
                </div>
            </div>

            {(frequency === "WEEKLY" || frequency === "CUSTOM") && (
                <div>
                    <label className="text-sm font-medium text-gray-700">
                        Select days <span className="text-red-600">*</span>
                    </label>
                    <div className="mt-2 flex w-max flex-wrap overflow-x-auto rounded-md border border-gray-300">
                        {daysOfWeek.map((day) => {
                            const fullDay = changeDayFormat[day];
                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleDayToggle(day)}
                                    className={`border-r px-4 py-2 text-sm last:border-r-0 ${
                                        selectedDays.includes(fullDay)
                                            ? "poppins-medium bg-customDropdown text-customDropdownBorder"
                                            : "bg-white text-customTextGrey"
                                    }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                    {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
                </div>
            )}

            {frequency === "CUSTOM" && (
                <div>
                    <label className="text-sm font-medium text-gray-700">Repeats every</label>
                    <div className="mt-2 flex items-center gap-2">
                        <input
                            type="number"
                            min="1"
                            className="w-12 rounded border border-gray-300 px-2 py-2 text-sm"
                            value={repeatEvery}
                            onChange={handleRepeatChange}
                        />
                        <select
                            value={repeatUnit}
                            onChange={handleUnitChange}
                            className="w-40 rounded border border-gray-300 px-2 py-2 text-sm"
                        >
                            <option value="DAYS">Days</option>
                            <option value="WEEKS">Weeks</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FrequencySelector;
