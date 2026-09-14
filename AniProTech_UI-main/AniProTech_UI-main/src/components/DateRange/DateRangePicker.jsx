import React, { useState, useRef } from "react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useClickOutside } from "../../hooks/use-click-outside";

const DropdownDateRangeSelector = ({ onRangeChange, style }) => {
    const [open, setOpen] = useState(false);
    const [range, setRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: "selection",
        },
    ]);
    const [selectingStart, setSelectingStart] = useState(true);
    const ref = useRef();

    useClickOutside([ref], () => {
        setOpen(false);
        setSelectingStart(true); // Reset on close
    });

    const handleSelect = (ranges) => {
        const { startDate, endDate } = ranges.selection;

        if (selectingStart) {
            setRange([
                {
                    startDate,
                    endDate: endDate || startDate,
                    key: "selection",
                },
            ]);
            setSelectingStart(false);
        } else {
            setRange([{ startDate, endDate, key: "selection" }]);
            setOpen(false);
            setSelectingStart(true);
        }

        onRangeChange?.(ranges.selection);
    };

    const formatRange = () => {
        const { startDate, endDate } = range[0];
        return `${format(startDate, "dd/MM/yyyy", { locale: enGB })} - ${format(endDate, "dd/MM/yyyy", { locale: enGB })}`;
    };

    return (
        <div ref={ref} className="relative inline-block w-full md:w-auto">
            {!style && (
                <p className="mb-1 text-sm font-semibold text-gray-700">Choose Date:</p>
            )}
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="w-full md:w-60 rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition hover:border-teal-400 hover:ring-2 hover:ring-teal-100 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            >
                {formatRange()}
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 rounded-lg border border-gray-200 bg-white shadow-xl">
                    <DateRange
                        editableDateInputs={true}
                        onChange={handleSelect}
                        moveRangeOnFirstSelection={false}
                        ranges={range}
                        locale={enGB}
                    />
                </div>
            )}
        </div>
    );
};

export default DropdownDateRangeSelector;
