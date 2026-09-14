import React from "react";

const TextField = React.forwardRef(
    (
        {
            label,
            sublabel = "",
            name,
            type = "text",
            valueChange,
            value,
            error,
            required,
            onBlur,
            disable,
            style,
            placeHolder = "Type here",
            maxLength,
            readOnly,
            componentName,
            customWidth,
            autoFocus = false,
            touched,
        },
        ref,
    ) => {
        const inputFieldValueChanges = (event) => {
            let newValue = event.target.value;
            if (maxLength && newValue.length > maxLength) {
                return;
            }
            if (componentName === "FormikValidation") {
                if (type === "number") {
                    const raw = event.target.value;
                    newValue = raw === "" ? null : event.target.valueAsNumber;
                }

                valueChange({ target: { name, value: newValue } });
            } else if (componentName === "NormalValidation") {
                valueChange(newValue, name);
            } else {
                if (type === "number") {
                    const raw = event.target.value;
                    newValue = raw === "" ? null : event.target.valueAsNumber;
                }

                // valueChange(newValue, name);
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
                    <span className={sublabel === "(0 characters remaining)" ? "text-red-500" : "text-gray-500"}>{sublabel}</span>
                    {required && <span className="text-red-600"> *</span>}
                </label>

                <div className="relative ">
                    <input
                        ref={ref}
                        id={name}
                        name={name}
                        disabled={disable}
                        type={type}
                        value={value || ""}
                        onBlur={onBlur}
                        autoFocus={autoFocus}
                        onChange={inputFieldValueChanges}
                        placeholder={placeHolder}
                        maxLength={type === "number" ? 15 : type === "text" ? 20 : maxLength}
                        min={type === "number" ? 1 : undefined}
                        readOnly={readOnly}
                        inputMode={type === "number" ? "numeric" : undefined}
                        onKeyDown={(e) => {
                            if (type === "number" && ["e", "E", "+", "-"].includes(e.key)) {
                                e.preventDefault();
                            }
                        }}
                        onInput={(e) => {
                            if (type === "number") {
                                e.target.value = e.target.value.replace(/[^0-9]/g, "");
                            }
                        }}
                        className={`${style === "mt" ? "mt-0" : "mt-3"} w-full rounded border px-4 py-3 text-sm ${
                            error ? "border-red-500" : "border-gray-300"
                        } focus:outline-none ${type === "number" ? "hide-arrow" : ""}`}
                    />
                </div>

                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
        );
    },
);

export default TextField;
