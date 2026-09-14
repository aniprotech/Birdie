import React from "react";

const TextAreaField = React.forwardRef(
    (
        {
            label,
            sublabel = "",
            name,
            valueChange,
            value,
            error,
            required,
            onBlur,
            disable,
            placeHolder = "Type here",
            maxLength,
            readOnly,
            componentName,
            autoFocus = false,
            touched,
            rows = "",
            style,
        },
        ref,
    ) => {
        // Mirror your TextField’s change handler
        const handleValueChange = (event) => {
            const newValue = event.target.value;
            if (maxLength && newValue.length > maxLength) return;
            // Formik style vs. simple callback
            if (componentName === "FormikValidation") {
                valueChange({ target: { name, value: newValue } });
            } else {
                valueChange({ target: { name, value: newValue } });
            }
        };

        return (
            <div className="w-full">
                <label
                    htmlFor={name}
                    className={`block ${style === "textSize" ? "poppins-medium text-base text-customNavy" : "text-sm"} poppins-medium text-customTextGrey`}
                >
                    {label}
                    {sublabel && (
                        <span className={sublabel === "(0 characters remaining)" ? "ml-1 text-red-500" : "ml-1 text-gray-500"}>{sublabel}</span>
                    )}
                    {required && <span className="text-red-600"> *</span>}
                </label>

                <div className="relative mt-1">
                    <textarea
                        ref={ref}
                        id={name}
                        name={name}
                        disabled={disable}
                        value={value || ""}
                        onBlur={onBlur}
                        autoFocus={autoFocus}
                        onChange={handleValueChange}
                        placeholder={placeHolder}
                        maxLength={maxLength}
                        readOnly={readOnly}
                        rows={rows ? rows : 3}
                        className={`${style === "mt" ? "mt-0" : "mt-2"} w-full rounded border px-4 py-3 text-sm ${
                            error ? "border-red-500" : "border-gray-300"
                        } focus:outline-none`}
                    />
                </div>

                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
        );
    },
);

export default TextAreaField;
