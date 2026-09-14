import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { createPortal } from "react-dom";
import { HiChevronDown } from "react-icons/hi";
import { IoClose } from "react-icons/io5";

const MultiSelect = ({
  label,
  name,
  options,
  required,
  valueChange,
  value = [], // array of string values
  disable,
  error,
  style,
  componentName,
  placeholder,
  pipe,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const [dropdownStyles, setDropdownStyles] = useState({});

  const updateDropdownPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyles({
        position: "absolute",
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        zIndex: 9999,
      });
    }
  };

  const openDropdown = () => {
    if (!disable) {
      setShowDropdown(true);
    }
  };

  const handleChange = (selectedValue) => {
    const updatedValues = value.includes(selectedValue)
      ? value.filter((v) => v !== selectedValue)
      : [...value, selectedValue];

    if (componentName === "FormikValidation") {
      valueChange({ target: { name, value: updatedValues } });
    } else {
      valueChange(updatedValues, name);
    }
  };

  const handleClear = () => {
    const empty = [];
    if (componentName === "FormikValidation") {
      valueChange({ target: { name, value: empty } });
    } else {
      valueChange(empty, name);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !triggerRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      updateDropdownPosition();
      window.addEventListener("scroll", updateDropdownPosition, true);
      window.addEventListener("resize", updateDropdownPosition);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", updateDropdownPosition, true);
      window.removeEventListener("resize", updateDropdownPosition);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="relative w-full">
      {label && (
        <label
          htmlFor={name}
          className={`block ${
            style === "textSize"
              ? "poppins-medium text-base text-customNavy"
              : "text-sm"
          } mb-3 text-customTextGrey`}
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      {/* Display box */}
      <div
        ref={triggerRef}
        onClick={openDropdown}
        className={`min-h-[42px] flex flex-wrap gap-1 items-center rounded border bg-white px-3 py-[6px] text-sm
        ${disable ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer"}
        ${error ? "border-red-500" : "border-gray-300"}
        focus-within:border-customBlue focus:outline-none focus:ring-1 ${style || ""}`}
      >
        {value.length === 0 && (
          <span className="text-gray-400 text-sm">
            {placeholder || "Select an option"}
          </span>
        )}

{value.map((val) => {
  const label = options.find((opt) => opt.value === val)?.label || val;
  return (
    <span
      key={val}
      className="flex items-center bg-gray-200 text-customBlack1 text-xs rounded-md px-2 py-[2px] mr-1"
    >
      {label}
      {!disable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleChange(val);
          }}
          className="ml-1 text-gray-600 hover:text-red-500"
        >
          <IoClose size={14} />
        </button>
      )}
    </span>
  );
})}


        <div className="flex-grow" />

        {pipe && <span className="text-gray-400 mx-2">|</span>}

        {value.length > 0 && !disable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
          >
            <IoClose className="text-gray-500 hover:text-red-500" size={16} />
          </button>
        )}

        <HiChevronDown className="ml-2 text-gray-400" size={18} />
      </div>

      {/* Dropdown Portal */}
      {showDropdown &&
        createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyles}
            className="max-h-60 overflow-auto rounded border border-gray-300 bg-white shadow-md
              scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          >
            {options.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <div
                  key={option.value}
                  onClick={() => handleChange(option.value)}
                  className={`px-3 py-2 text-sm cursor-pointer ${
                    isSelected
                      ? "bg-blue-100 text-customBlack1"
                      : "hover:bg-blue-50"
                  }`}
                >
                  {option.label}
                </div>
              );
            })}
          </div>,
          document.body
        )}

      {error && !value?.length && (
        <span className="mt-1 block text-xs text-red-500">{error}</span>
      )}
    </div>
  );
};

MultiSelect.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  required: PropTypes.bool,
  valueChange: PropTypes.func.isRequired,
  value: PropTypes.arrayOf(PropTypes.string),
  disable: PropTypes.bool,
  error: PropTypes.string,
  style: PropTypes.string,
  componentName: PropTypes.string,
  placeholder: PropTypes.string,
  pipe: PropTypes.bool,
};

MultiSelect.defaultProps = {
  required: false,
  disable: false,
  value: [],
  options: [],
  pipe: false,
};

export default MultiSelect;
