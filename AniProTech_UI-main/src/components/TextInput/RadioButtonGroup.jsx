import React from "react";

const RadioButtonGroup = ({ label, name, options, value, valueChange, required, error, disabled = false, style }) => {
    const handleChange = (val) => {
        valueChange({ target: { name, value: val } });
    };

    return (
        <div className="w-full">
            {label && (
                <label
                    className={`block ${style === "textSize" ? "poppins-medium text-base text-customNavy" : "text-sm"} poppins-medium mb-3 text-customTextGrey`}
                >
                    {" "}
                    {label}
                    {required && <span className="text-red-500"> *</span>}
                </label>
            )}

            <div className="space-y-3">
                {options.map((option, idx) => (
                    <label
                        key={idx}
                        className={`flex cursor-pointer items-center rounded border px-4 py-3 transition ${
                            value === option.value ? "bg-gray-50" : "border-gray-300 hover:border-customNavy"
                        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={value === option.value}
                            onChange={() => handleChange(option.value)}
                            disabled={disabled}
                            className="mr-3 h-4 w-4 text-customBlue"
                        />
                        <div className="flex flex-col text-sm">
                            {" "}
                            <span className="text-sm text-customNavy">{option.label}</span>
                            {option?.description && <span className="text-sm text-customGrey1">{option.description}</span>}
                        </div>
                    </label>
                ))}
            </div>

            {error && !value && <span className="mt-1 block text-xs text-red-500">{error}</span>}
        </div>
    );
};

export default RadioButtonGroup;
