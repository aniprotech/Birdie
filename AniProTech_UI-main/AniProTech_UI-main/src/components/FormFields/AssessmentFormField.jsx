import { useField, useFormikContext } from "formik";
import PropTypes from "prop-types";
import TextAreaField from "../TextInput/TextAreaField";
import WeightInput from "../TextInput/WeightInput";
import MedicalConditionsField from "./MedicalConditionsField";
import StatusToggleButtonGroup from "../TextInput/StatusToggleButtonGroup";
import TextField from "../TextInput/TextInput";
import RadioButtonGroup from "../TextInput/RadioButtonGroup";
import CheckboxButtonGroup from "../TextInput/CheckboxButtonGroup";
import DateField from "../DateField/DateField";

const AssessmentFormField = ({ field, clientName = "the client" }) => {
    const [mainField, meta] = useField(field.id);
    const [detailsField] = useField(`${field.id}_details`);
    const { values } = useFormikContext();
    const error = meta.touched && meta.error;

    const handleChange = (value) => {
        if (typeof value === "object" && value.target) {
            mainField.onChange(value);
        } else {
            mainField.onChange({
                target: {
                    name: field.id,
                    value: value,
                },
            });
        }
    };

    const shouldShowField = () => {
        if (!field.dependencies) return true;

        return Object.entries(field.dependencies).every(([dependencyField, requiredValue]) => {
            if (Array.isArray(requiredValue)) {
                return requiredValue.includes(values[dependencyField]);
            }
            return values[dependencyField] === requiredValue;
        });
    };

    const shouldShowDetails = () => {
        // Check if this is a medication question by looking at the section_id
        const isMedicationQuestion =
            field.section_id &&
            [
                "administration_support",
                "types_of_medication",
                "current_medication",
                "medication_risks",
                "functional",
                "prescriptions",
                "collecting",
                "storing",
                "disposing",
            ].includes(field.section_id);

        if (field.set_no_details) {
            const valueToCheck = mainField.value;
            return valueToCheck === false || valueToCheck === "false";
        }

        // If it's a medication question and show_details is true, always show the details
        if ((isMedicationQuestion && field.show_details) || field.default_show_details) {
            return true;
        }

        // First check if showDetails prop is passed
        if (field.showDetails !== undefined) {
            return field.showDetails;
        }

        // if (field.section_id === "mobility" && field.showDetails) {
        //     return true;
        // }

        // Handle show_details cases for non-medication questions
        if (field.show_details && !isMedicationQuestion) {
            if (field.answer_type.type === "boolean") {
                return mainField.value === true;
            } else if (field.answer_type.type === "single_choice") {
                const valueToCheck = mainField.value?.toLowerCase();
                return valueToCheck === "yes" || valueToCheck === "other" || valueToCheck === "yes_confirmed" || valueToCheck === "yes_suspected";
            }
        }

        // Handle has_note cases
        if (field.has_note) {
            if (Array.isArray(field.has_note)) {
                const hasNoteConfig = field.has_note.find((note) => note.question_id === field.id);
                if (hasNoteConfig) {
                    if (field.answer_type.type === "multiple_choice") {
                        return Array.isArray(mainField.value) && mainField.value.includes(hasNoteConfig.hasValue);
                    } else if (field.answer_type.type === "single_choice") {
                        return mainField.value === hasNoteConfig.hasValue;
                    }
                }
            }
            // Default has_note behavior
            if (field.answer_type.type === "multiple_choice") {
                return Array.isArray(mainField.value) && mainField.value.includes("other");
            } else if (field.answer_type.type === "single_choice") {
                return mainField.value === "other";
            }
        }

        return false;
    };

    const interpolatedTitle = field?.title?.replace(/{{firstname}}/g, clientName);
    const interpolatedSubtitle = field?.subtitle?.replace(/{{firstname}}/g, clientName);

    const renderField = () => {
        switch (field.answer_type.type) {
            case "date":
                return (
                    <DateField
                        label={interpolatedTitle}
                        name={field.id}
                        value={mainField.value}
                        onChange={handleChange}
                        error={error}
                        required={field.required}
                        style="mt"
                    />
                );

            case "single_choice":
                return (
                    <div className="space-y-2">
                        {Array.isArray(field.subtitle) ? (
                            <div className="space-y-1 text-sm text-gray-500">
                                {field.subtitle.map((item, index) => (
                                    <p key={index}>• {item.trim().replace(/^•\s*/, "")}</p>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500">{interpolatedSubtitle}</p>
                        )}

                        <RadioButtonGroup
                            label={interpolatedTitle}
                            name={field.id}
                            value={mainField.value || ""}
                            options={field.answer_type.choices.map((choice) => ({
                                value: choice.choice_id,
                                label: choice.label,
                            }))}
                            valueChange={handleChange}
                            error={error}
                        />
                    </div>
                );

            case "multiple_choice":
                return (
                    <div className="space-y-2">
                        <CheckboxButtonGroup
                            label={interpolatedTitle}
                            name={field.id}
                            value={mainField.value || []}
                            options={field.answer_type.choices.map((choice) => ({
                                value: choice.choice_id,
                                label: choice.label,
                            }))}
                            valueChange={handleChange}
                            error={error}
                        />
                        {field.subtitle && <p className="text-sm text-gray-500">{interpolatedSubtitle}</p>}
                    </div>
                );

            case "boolean":
                return (
                    <div className="space-y-2">
                        <StatusToggleButtonGroup
                            label={interpolatedTitle}
                            name={field.id}
                            value={mainField.value}
                            options={[
                                { value: true, label: "Yes" },
                                { value: false, label: "No" },
                            ]}
                            onChange={handleChange}
                            error={error}
                        />
                        {Array.isArray(field.subtitle) ? (
                            <div className="space-y-1 text-sm text-gray-500">
                                {field.subtitle.map((item, index) => (
                                    <p key={index}>• {item.trim().replace(/^•\s*/, "")}</p>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">{interpolatedSubtitle}</p>
                        )}
                    </div>
                );

            case "weight":
                return (
                    <div className="space-y-2">
                        <WeightInput
                            label={interpolatedTitle}
                            name={field.id}
                            value={mainField.value}
                            valueChange={handleChange}
                            error={error}
                        />
                        {field.subtitle && <p className="text-sm text-gray-500">{interpolatedSubtitle}</p>}
                    </div>
                );

            case "number":
                return (
                    <div className="space-y-2">
                        <TextField
                            label={interpolatedTitle}
                            name={field.id}
                            type="number"
                            value={mainField.value}
                            valueChange={handleChange}
                            error={error}
                            placeHolder={field.placeholder}
                        />
                        {field.subtitle && <p className="text-sm text-gray-500">{interpolatedSubtitle}</p>}
                    </div>
                );

            case "text_field":
                return (
                    <div className="space-y-2">
                        <TextField
                            label={interpolatedTitle}
                            name={field.id}
                            type="text"
                            value={mainField.value}
                            valueChange={handleChange}
                            error={error}
                            placeHolder={field.placeholder}
                        />
                        {field.subtitle && <p className="text-sm text-gray-500">{interpolatedSubtitle}</p>}
                    </div>
                );

            case "text":
            case "free_text":
                return (
                    <div className="space-y-2">
                        <TextAreaField
                            label={interpolatedTitle}
                            name={field.id}
                            value={mainField.value}
                            valueChange={handleChange}
                            variant={field.answer_type.variant}
                            error={error}
                            placeHolder={field.placeholder || "Enter details here..."}
                            required={field.required}
                        />
                        {field.subtitle && <p className="text-sm text-gray-500">{interpolatedSubtitle}</p>}
                    </div>
                );

            case "medical_conditions":
                return (
                    <MedicalConditionsField
                        field={field}
                        value={mainField.value || []}
                        onChange={handleChange}
                        clientName={clientName}
                    />
                );

            default:
                console.warn(`Unsupported field type: ${field.answer_type.type}`);
                return null;
        }
    };

    if (!shouldShowField()) return null;

    return (
        <div className="space-y-4">
            {renderField()}
            {shouldShowDetails() && (
                <div className="mt-4">
                    <TextAreaField
                        label="Additional details"
                        name={`${field.id}_details`}
                        value={detailsField.value}
                        valueChange={detailsField.onChange}
                        variant="multi_line"
                        placeholder={field.placeholder || "Add any relevant details here..."}
                    />
                </div>
            )}
        </div>
    );
};

AssessmentFormField.propTypes = {
    field: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string,
        subtitle: PropTypes.string,
        dependencies: PropTypes.object,
        section_id: PropTypes.string,
        answer_type: PropTypes.shape({
            type: PropTypes.string.isRequired,
            variant: PropTypes.string,
            choices: PropTypes.arrayOf(
                PropTypes.shape({
                    choice_id: PropTypes.string.isRequired,
                    label: PropTypes.string.isRequired,
                }),
            ),
        }).isRequired,
        show_details: PropTypes.bool,
        default_show_details: PropTypes.bool,
        set_no_details: PropTypes.bool,
        showDetails: PropTypes.bool,
        required: PropTypes.bool,
        placeholder: PropTypes.string,
    }).isRequired,
    clientName: PropTypes.string,
};

export default AssessmentFormField;
