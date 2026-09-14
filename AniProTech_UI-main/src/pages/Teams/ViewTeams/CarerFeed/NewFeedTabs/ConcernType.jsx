import React from "react";
import { Formik, Form } from "formik";
import SearchableDropdown from "../../../../../components/DropdownInput/SearchableDropdown";
import DropdownField from "../../../../../components/DropdownInput/Dropdown";
import RadioButtonGroup from "../../../../../components/TextInput/RadioButtonGroup";
import TextAreaField from "../../../../../components/TextInput/TextAreaField";
import { Bell } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { carerFeedNotesConcernValidationSchema } from "../../../../../utils/validations/teams/carerFeedValidations";

const ConcernType = () => {
    const initialValues = {
        client: "",
        carer: "",
        category: "",
        severity: "",
        privacy: "",
        event_description: "",
        actions_taken: "",
    };

    const clientOptions = [
        { label: "Select client name", value: "" },
        { label: "Client A", value: "client_a" },
        { label: "Client B", value: "client_b" },
    ];

    const carerOptions = [
        { label: "Select carer name", value: "" },
        { label: "Carer A", value: "carer_a" },
        { label: "Carer B", value: "carer_b" },
    ];

    const categoryOptions = [
        { label: "Select severity", value: "" },
        { label: "Health", value: "health" },
        { label: "Safety", value: "safety" },
    ];

    const severityOptions = [
        { label: "Select severity", value: "" },
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
    ];

    const privacyOptions = [
        { label: "Public", value: "public" },
        { label: "Private", value: "private" },
    ];

    const handleSubmit = (values) => {
        console.log("Form submitted:", values);
    };

    const { id } = useParams();
    const navigate = useNavigate();
    return (
        <Formik
            initialValues={initialValues}
            validationSchema={carerFeedNotesConcernValidationSchema}
            onSubmit={handleSubmit}
        >
            {({ values, errors, handleChange, setFieldValue }) => (
                <div>
                    <div className="flex max-h-[86vh] flex-col p-5">
                        {/* Sticky concern header */}
                        <span className="sticky top-0 z-10 mb-2 inline-flex w-fit items-center rounded-full border border-customNavy/50 bg-customCarerFeedBg px-3 py-1 text-sm font-semibold text-customTextGrey">
                            <Bell
                                size={15}
                                className="mr-1"
                            />{" "}
                            Concern
                        </span>
                        {/* Form content, with scroll and max height */}
                        <div className="max-h-[80vh] flex-1 overflow-y-auto border-t pb-16 pt-5">
                            <Form className="space-y-6">
                                <SearchableDropdown
                                    label="Who is the concern for?"
                                    name="client"
                                    options={clientOptions}
                                    required
                                    value={values.client}
                                    valueChange={(value) => setFieldValue("client", value)}
                                    error={errors.client}
                                />

                                <SearchableDropdown
                                    label="Who raised the concern?"
                                    name="carer"
                                    options={carerOptions}
                                    required
                                    value={values.carer}
                                    valueChange={(value) => setFieldValue("carer", value)}
                                    error={errors.carer}
                                />

                                <DropdownField
                                    label="What is the category of the concern?"
                                    name="category"
                                    options={categoryOptions}
                                    value={values.category}
                                    valueChange={handleChange}
                                    required
                                    error={errors.category}
                                    placeholder="category"
                                    componentName="FormikValidation"
                                />

                                <DropdownField
                                    label="What is the severity of the concern?"
                                    name="severity"
                                    options={severityOptions}
                                    value={values.severity}
                                    valueChange={handleChange}
                                    required
                                    error={errors.severity}
                                    placeholder="severity"
                                    componentName="FormikValidation"
                                />

                                <RadioButtonGroup
                                    label="Select privacy"
                                    name="privacy"
                                    value={values.privacy}
                                    valueChange={handleChange}
                                    error={errors.privacy}
                                    options={privacyOptions}
                                />

                                <TextAreaField
                                    label="Describe the event"
                                    name="event_description"
                                    placeHolder="Provide as much detail as you can. Be objective and avoid opinions."
                                    value={values.event_description}
                                    valueChange={handleChange}
                                    rows={5}
                                    required
                                    error={errors.event_description}
                                />

                                <TextAreaField
                                    label="What actions were taken?"
                                    name="actions_taken"
                                    placeHolder="Explain how the carer supported the client and what was done to manage the concern."
                                    value={values.actions_taken}
                                    valueChange={handleChange}
                                    rows={5}
                                    required
                                    error={errors.actions_taken}
                                />
                            </Form>
                        </div>
                    </div>
                    {/* Sticky submit button */}
                    <div className="sticky bottom-10 border-t bg-white p-4">
                        <div className="flex items-center gap-5 text-sm font-semibold">
                            <button
                                // onClick={onCancel}
                                onClick={() => {
                                    navigate(`/admin/teams/${id}/carer-feed`);
                                }}
                                className="rounded border border-gray-300 px-4 py-1.5 text-customTextGrey hover:bg-customBgGrey"
                            >
                                Cancel
                            </button>
                            <button
                                // disabled={!isTitleValid}
                                // onClick={() => onSave({ title, details })}
                                className={`rounded px-4 py-1.5 text-white ${"bg-customDropdownBorder hover:bg-customDropdownBorder/80"}`}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Formik>
    );
};

export default ConcernType;
