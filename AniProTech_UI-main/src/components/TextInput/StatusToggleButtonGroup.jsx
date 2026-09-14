import React from "react";

const StatusToggleButtonGroup = ({ label, name, options, value, onChange, error, style }) => {
    const handleButtonClick = (selectedValue) => {
        onChange({ target: { name, value: selectedValue } });
    };
    
    
    const buttonStyle = (selectedValue) =>
        `border-customDropdownBorder border-r px-4 py-2 text-sm last:border-r-0 focus:outline-none ${
            selectedValue === value ? "bg-customDropdown text-customDropdownBorder font-medium" : "bg-white text-black"
        }`;
        
    return (
        <div>
            <p className={`mb-2 ${style === "textSize" ? "text-base poppins-medium text-customNavy" : "text-sm"} poppins-medium text-customTextGrey1`}>
                {label}
            </p>
            <div className="flex max-w-fit overflow-x-auto rounded-md border border-customDropdownBorder">
                {options.map((option, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => handleButtonClick(option.value)}
                        className={buttonStyle(option.value)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
};

export default StatusToggleButtonGroup;
