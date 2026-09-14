import React, { useEffect, useState, useRef } from "react";
import countries from "world-countries";
import TextField from "../TextInput/TextInput";
import { useClickOutside } from "../../hooks/use-click-outside";

const PhoneNumberField = ({
    label,
    name,
    value = "",
    error,
    required,
    initialCountry = "GB",
    onChange,
    selectedCountry,
    phoneName,
    phoneValue,
    phoneChange,
    phoneError,
    countryValue,
    countryChange,
    style,
}) => {
    const [countryOptions, setCountryOptions] = useState([]);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [selectedCountryState, setSelectedCountryState] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef(null);
    const dropdownBtnRef = useRef(null);

    const actualName = name || phoneName;
    const actualValue = value || phoneValue;
    const actualError = error || phoneError;

    useClickOutside([dropdownRef, dropdownBtnRef], () => setShowDropdown(false));

    useEffect(() => {
        const formatted = countries
            .filter((country) => country.idd?.root)
            .map((country) => {
                const code = `${country.idd.root}${country.idd.suffixes?.[0] || ""}`;
                return {
                    value: country.cca2,
                    label: country.flag || code,
                    fullName: country.name.common,
                    code,
                };
            });

        setCountryOptions(formatted);
        setFilteredOptions(formatted);

        const defaultCountry = formatted.find((c) => c.value === initialCountry);
        setSelectedCountryState(defaultCountry);
    }, [initialCountry]);

    useEffect(() => {
        if (selectedCountry && countryOptions.length > 0) {
            const countryOption = countryOptions.find((c) => c.code === selectedCountry);
            if (countryOption) {
                setSelectedCountryState(countryOption);
            }
        }
    }, [selectedCountry, countryOptions]);

    const handleSelect = (country) => {
        setSelectedCountryState(country);
        setShowDropdown(false);
        setSearch("");
        setFilteredOptions(countryOptions);

        // Support both onChange patterns
        if (onChange) {
            onChange(actualValue, country.code);
        } else if (countryChange) {
            countryChange(country.code);
            if (phoneChange) phoneChange(actualValue);
        }
    };

    const handlePhoneChange = (e) => {
        const newValue = e.target.value;

        // Support both onChange patterns
        if (onChange) {
            onChange(newValue, selectedCountryState?.code);
        } else if (phoneChange) {
            phoneChange(e);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearch(value);
        const filtered = countryOptions.filter((c) => c.fullName.toLowerCase().includes(value) || c.code.includes(value) || c.label.includes(value));
        setFilteredOptions(filtered);
    };

    return (
        <div className="w-full">
            <label
                className={`block ${style === "textSize" ? "poppins-medium text-base text-customNavy" : "text-sm"} poppins-medium text-customTextGrey`}
            >
                {label}
            </label>

            <div className="flex items-center gap-2">
                {/* Country Code Dropdown */}
                <div
                    className="relative"
                    ref={dropdownBtnRef}
                >
                    <button
                        type="button"
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="mt-3 flex min-w-[50px] items-center justify-center rounded border border-gray-300 bg-white px-2 py-3 text-sm shadow-sm hover:border-gray-400"
                    >
                        {selectedCountryState?.code || "Select"}
                    </button>

                    {showDropdown && (
                        <div
                            ref={dropdownRef}
                            className="absolute z-10 mt-1 max-h-72 w-64 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg md:w-96"
                        >
                            <div className="sticky top-0 border-b border-gray-200 bg-white p-2">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={handleSearch}
                                    placeholder="Search..."
                                    className="w-full rounded-md border px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-customBlue"
                                />
                            </div>
                            {filteredOptions.map((country) => (
                                <div
                                    key={country.value}
                                    onClick={() => handleSelect(country)}
                                    className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
                                >
                                    <span className="w-10">{country.label}</span>
                                    <span className="text-gray-700">{country.fullName}</span>
                                    <span className="ml-auto text-gray-500">{country.code}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Phone Number Input */}
                <TextField
                    name={actualName}
                    value={actualValue}
                    type="number"
                    valueChange={handlePhoneChange}
                    error={actualError}
                    required={required}
                    placeholder="Enter phone number"
                    className="h-[40px] w-full"
                    maxLength={15}
                />
            </div>
        </div>
    );
};

export default PhoneNumberField;
