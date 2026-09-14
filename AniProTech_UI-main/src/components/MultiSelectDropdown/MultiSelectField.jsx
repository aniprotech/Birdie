import React, { useState, useRef, useEffect } from "react";
import { FaCircleCheck } from "react-icons/fa6";

const MultiSelectField = ({
  label,
  name,
  options,
  required,
  isMultiSelect = false,
  valueChange,
  value = [],
  disable,
  error,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const dropdownRef = useRef(null); // Create a ref for the dropdown

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    if (!disable) setShowDropdown(!showDropdown);
  };

  // Handle option changes
  const handleOptionChange = (selectedOption) => {
    if (isMultiSelect) {
      const updatedValues = value.some(
        (val) => val.zipcode === selectedOption.zipcode
      )
        ? value.filter((val) => val.zipcode !== selectedOption.zipcode) // Remove if already selected
        : [...value, selectedOption]; // Add if not selected
      valueChange(updatedValues, name);
    } else {
      valueChange([selectedOption], name);
      setShowDropdown(false); // Close dropdown for single select
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.zipcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={dropdownRef}>
      <label className="block text-sm font-bold text-customTextGrey1">
        {label}
        {required && <span className="text-customRed"> *</span>}
      </label>

      <div className="relative">
        {/* Dropdown display field */}
        <div
          className={`mt-3 w-full text-xs border-b focus:border-b-customNavy cursor-pointer border-opacity-90 ${
            error ? "border-customRed" : "focus:border-customNavy"
          }`}
          onClick={toggleDropdown}
        >
          {/* Show selected values */}
          <div className="text-xs text-customBlack font-opensans">
            {value.length > 0
              ? value.map((selectedValue) => selectedValue.zipcode).join(", ")
              : "Choose"}
          </div>
        </div>

        {showDropdown && (
          <div className="absolute bg-white w-full border border-gray-300 z-50 max-h-60 overflow-y-auto">
            {/* Search Input */}
            <div className="p-2 border-b">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 text-xs border rounded focus:outline-none"
              />
            </div>

            {/* Options */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center p-2 cursor-pointer"
                  onClick={() => handleOptionChange(option)}
                >
                  {value.some((val) => val.id === option.id) && (
                    <span className="flex items-center mr-2">
                      <FaCircleCheck className="text-customNavy text-sm" />
                    </span>
                  )}
                  <label className="text-customBlack text-xs hover:cursor-pointer">
                    {option.zipcode.charAt(0).toUpperCase() +
                      option.zipcode.slice(1)}{" "}
                  </label>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-gray-500">
                No options found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected categories display */}
      {isMultiSelect && value.length > 0 && (
        <div className="mt-2">
          {value.map((selectedValue, index) => (
            <div
              key={index}
              className="inline-flex items-center px-3 py-1 text-xs bg-gray-100 rounded-full mt-2"
            >
              <span className="text-customBlack">
                {selectedValue.zipcode.charAt(0).toUpperCase() +
                  selectedValue.zipcode.slice(1)}
              </span>
              <button
                onClick={() => handleOptionChange(selectedValue)} // Remove selected value
                className="ml-2 text-black text-sm bg-white rounded-full w-5 h-5 flex items-center justify-center"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <span className="text-customRed text-xs">{error}</span>}
    </div>
  );
};

export default MultiSelectField;
