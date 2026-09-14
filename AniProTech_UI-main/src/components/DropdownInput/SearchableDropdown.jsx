import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { HiChevronDown, HiX } from "react-icons/hi";
import { Search } from "lucide-react";

const SearchableDropdown = ({
    label,
    name,
    options,
    value = [], // <-- expect array of selected values now
    valueChange,
    required,
    error,
    placeholder,
    alsoKnownAsMap = {},
    disable,
    style,
    restrictClinicalSearch,
    setRestrictClinicalSearch,
}) => {
    const [query, setQuery] = useState("");
    const [restrictSearch, setRestrictSearch] = useState(restrictClinicalSearch);

    const [showPopup, setShowPopup] = useState(false);
    const [popupTerms, setPopupTerms] = useState([]);
    const [selectedTermIndex, setSelectedTermIndex] = useState(null);
    const [tempSelectedOption, setTempSelectedOption] = useState(null);

    const filteredOptions = query === "" ? options : options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));

    const selectedOptions = options.filter((opt) => value.includes(opt.value));

    const handleSelect = (selectedValue) => {
        const selectedOpt = options.find((opt) => opt.value === selectedValue);
        if (!selectedOpt) return;

        if (alsoKnownAsMap[selectedOpt.label] && alsoKnownAsMap[selectedOpt.label].length > 0) {
            setPopupTerms([selectedOpt.label, ...alsoKnownAsMap[selectedOpt.label]]);
            setSelectedTermIndex(0);
            setTempSelectedOption(selectedOpt.value);
            setShowPopup(true);
        } else {
            const currentValue = Array.isArray(value) ? value : [];

            let newSelectedValues;
            if (currentValue.includes(selectedValue)) {
                newSelectedValues = currentValue.filter((val) => val !== selectedValue);
            } else {
                newSelectedValues = [...currentValue, selectedValue];
            }

            valueChange(newSelectedValues);
        }

        setQuery("");
    };

    const confirmSelection = () => {
        if (selectedTermIndex === null) return;
        const term = popupTerms[selectedTermIndex];
        const foundOption = options.find((opt) => opt.label === term);
        const val = foundOption ? foundOption.value : tempSelectedOption;

        let newSelectedValues = value.includes(val) ? value : [...value, val];

        valueChange(newSelectedValues);
        setShowPopup(false);
    };

    const cancelSelection = () => setShowPopup(false);

    const removeOption = (valToRemove) => {
        const newSelectedValues = value.filter((val) => val !== valToRemove);
        valueChange(newSelectedValues);
    };

    return (
        <div className="relative w-48 md:w-full">
            <label
                className={`block ${
                    style === "textSize" ? "poppins-medium text-base text-customNavy" : "text-sm"
                } poppins-medium mb-3 text-customTextGrey`}
            >
                {label}
                {required && <span className="text-red-500"> *</span>}
            </label>

            <Listbox
                value={value}
                onChange={handleSelect}
                disabled={disable}
            >
                <div className="relative">
                    <Listbox.Button
                        className={`flex w-full items-center justify-between rounded border px-3 py-3 text-left text-sm ${
                            error ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-customBlue"
                        } focus:outline-none focus:ring-1 ${style || ""}`}
                    >
                        <span className={`poppins-medium truncate ${selectedOptions.length === 0 ? "text-gray-400" : "text-gray-700"}`}>
                            {selectedOptions.length === 0 ? placeholder || "Select an option" : `${selectedOptions.length} selected`}
                        </span>
                        <Search className="ml-2 h-4 w-4 text-gray-400" />
                    </Listbox.Button>

                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white text-sm shadow-lg">
                            <div className="px-3 py-2">
                                <input
                                    type="text"
                                    className="poppins-medium w-full rounded border border-gray-300 px-2 py-2 text-sm text-customTextGrey focus:outline-none"
                                    placeholder={`Search ${placeholder || ""}`}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>

                            {filteredOptions.length === 0 ? (
                                <div className="px-4 py-2 text-gray-500">No results found</div>
                            ) : (
                                filteredOptions.map((option, idx) => (
                                    <Listbox.Option
                                        key={idx}
                                        value={option.value}
                                        className={({ active }) => `cursor-pointer px-4 py-2 ${active ? "bg-gray-100" : ""}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{option.label}</span>
                                            {alsoKnownAsMap[option.label] && (
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {alsoKnownAsMap[option.label].map((aka, i) => (
                                                        <span
                                                            key={i}
                                                            className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                                                        >
                                                            {aka}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </Listbox.Option>
                                ))
                            )}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>

            {/* Restrict search checkbox */}
            <div
                className="mt-3 flex items-center space-x-2 hover:cursor-pointer"
                onClick={(e) => setRestrictSearch(e.target.checked)}
            >
                <input
                    type="checkbox"
                    id="restrictSearch"
                    checked={restrictSearch}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-white accent-customDropdownBorder focus:ring-customBlue"
                />
                <label
                    htmlFor="restrictSearch"
                    className="mt-0.5 text-sm text-gray-700 hover:cursor-pointer"
                >
                    Restrict search to clinical findings and procedures
                </label>
            </div>

            {/* Display multiple selected options, each with clear (X) */}
            {selectedOptions.length > 0 && (
                <div className="mt-4 space-y-2">
                    {selectedOptions.map((opt) => (
                        <div
                            key={opt.value}
                            className="relative rounded border border-gray-300 bg-gray-50 px-3 py-3 text-sm text-gray-700"
                        >
                            Selected: <span className="font-medium">{opt.label}</span>
                            <HiX
                                onClick={() => removeOption(opt.value)}
                                className="absolute right-3 top-3 h-5 w-5 cursor-pointer text-gray-400 hover:text-red-500"
                                title="Clear selection"
                            />
                        </div>
                    ))}
                </div>
            )}

            {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}

            {/* Popup modal for term selection */}
            {showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
                    <div className="w-full max-w-md rounded bg-white p-6 shadow-lg">
                        <div className="flex items-center justify-between border-b border-gray-300 pb-2">
                            <h3 className="poppins-medium text-lg text-customNavy">Choose the term to store in medical history</h3>
                            <button
                                onClick={() => setShowPopup(false)}
                                className="text-gray-400 hover:text-gray-600"
                                aria-label="Close popup"
                            >
                                <HiX className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="mt-4 max-h-48 space-y-2 overflow-y-auto">
                            {popupTerms.map((term, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSelectedTermIndex(idx)}
                                    className={`w-full rounded border px-3 py-2 text-left text-sm font-medium ${
                                        selectedTermIndex === idx
                                            ? "border-customDropdownBorder bg-customDropdownBorder bg-opacity-20 text-customDropdownBorder"
                                            : "border-gray-300 text-gray-700 hover:border-customDropdownBorder hover:text-customDropdownBorder"
                                    }`}
                                >
                                    {term}
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={cancelSelection}
                                className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmSelection}
                                className="rounded border border-customDropdownBorder bg-customDropdownBorder px-4 py-2 text-sm text-white hover:bg-opacity-90"
                            >
                                Select term
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableDropdown;
