import PropTypes from "prop-types";
import { getRiskLevelStyle } from "../../utils/common";
import { HiChevronDown } from "react-icons/hi";

const DropdownField = ({
  label,
  name,
  options,
  required,
  valueChange,
  value,
  disable,
  error,
  style,
  componentName,
  placeholder,
  pipe,
}) => {
  const isRiskLevel = name === "riskLevel";

  const handleChange = (e) => {
    const selectedValue = e.target.value;
    if (componentName === "FormikValidation") {
      valueChange({ target: { name, value: selectedValue } });
    } else {
      valueChange(selectedValue, name);
    }
  };

  return (
    <div className="relative w-full">
      <label
        htmlFor={name}
        className={`block ${
          style === "textSize" ? "poppins-medium text-base text-customNavy" : "text-sm"
        } mb-3 text-customTextGrey`}
      >
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <div className="relative">
        {/* Select Box */}
        <select
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          disabled={disable}
          className={`block w-full appearance-none cursor-pointer rounded border bg-white px-3 py-3 text-sm text-customTextGrey ${
            error ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-customBlue"
          } focus:outline-none focus:ring-1 ${style || ""}`}
        >
          <option value="" disabled hidden>
            {placeholder || "Select an option"}
          </option>
          {options.map((option, index) => (
            <option key={index}  value={option.value} className="text-customTextGrey text-sm max-h-60 overflow-y-auto">
              {option.label}
            </option>
          ))}
        </select>

        {/* Chevron Icon */}
        <HiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />


        {/* Vertical Divider Line | */}
        {pipe && (
          <span className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 text-gray-400">
            |
          </span>
        )}
      </div>

      {isRiskLevel && value && (
        <div className={`mt-2 inline-block rounded-full px-3 py-1 text-sm ${getRiskLevelStyle(value)}`}>
          {options.find((opt) => opt.value === value)?.label}
        </div>
      )}

      {error && !value && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </div>
  );
};

DropdownField.propTypes = {
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
  value: PropTypes.string,
  disable: PropTypes.bool,
  error: PropTypes.string,
  style: PropTypes.string,
  componentName: PropTypes.string,
  placeholder: PropTypes.string,
};


export default DropdownField;
