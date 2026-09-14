import { Flag } from "lucide-react";
import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Formik, Field, Form } from "formik";
import DropdownDateRangeSelector from "../../../../../components/DateRange/DateRangePicker";
import DropdownField from "../../../../../components/DropdownInput/Dropdown";
import SearchableDropdown from "../../../../../components/DropdownInput/SearchableDropdown";
import { useNavigate, useParams } from "react-router-dom";

const ClientActionType = ({ onCancel, onSave }) => {
    const [details, setDetails] = useState("");

    const maxLength = 50; // Max title length
    const repeatOptions = [
        { label: "Never", value: "never" },
        { label: "Daily", value: "daily" },
        { label: "Weekly", value: "weekly" },
        { label: "Monthly", value: "monthly" },
    ];

    const assignedOptions = [
        { label: "Unassigned", value: "" },
        { label: "Bhaskar Reddy", value: "bhaskar" },
        { label: "Birdie Team", value: "team" },
        { label: "Rohitha Prakash", value: "rohitha" },
        { label: "Sat (to add / edit)", value: "sat" },
        { label: "Swarnalatha Kontham", value: "swarna" },
    ];

    const modules = {
        toolbar: [[{ header: [1, 2, 3, 4, 5, 6, false] }], ["bold", "italic"], [{ list: "ordered" }, { list: "bullet" }]],
    };

    const { id } = useParams();
    const navigate = useNavigate();
    return (
        <div className="flex h-dvh flex-col bg-white">
            {/* Formik Integration */}
            <Formik
                initialValues={{
                    title: "",
                    dueDate: null,
                    repeat: "never",
                    assigned: "",
                }}
                validate={(values) => {
                    const errors = {};
                    if (!values.title) {
                        errors.title = "Title is required";
                    }
                    return errors;
                }}
                onSubmit={(values) => {
                    onSave({ ...values, details });
                }}
            >
                {({ values, handleChange, handleBlur, handleSubmit, errors }) => (
                    <Form
                        onSubmit={handleSubmit}
                        className="flex flex-1 flex-col overflow-auto"
                    >
                        {/* Scrollable content area */}
                        <div className="h-full max-h-[83vh] flex-1 overflow-y-auto px-6 pb-16">
                            {/* Note Label */}
                            <div className="sticky top-1 border-b bg-white pt-4">
                                <span className="mb-3 inline-flex items-center rounded-full border border-customNavy/50 bg-customCarerFeedBg px-3 py-1 text-sm font-semibold text-customTextGrey">
                                    <Flag
                                        size={15}
                                        className="mr-1"
                                    />{" "}
                                    Action
                                </span>
                            </div>
                            {/* Title Input */}
                            <label className="mb-1 mt-5 block text-base font-semibold text-customTextGrey">
                                Title <span className="text-customRed">*</span>
                            </label>
                            <p className="mt-2 text-sm text-customGrey">{`Describe the subject of the action`}</p>
                            <Field
                                type="text"
                                name="title"
                                value={values.title}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                maxLength={maxLength}
                                className="mb-1 w-full rounded border border-gray-300 px-3 py-2.5 text-sm focus:outline-none"
                                placeholder="Enter title"
                            />
                            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                            {/* Progress Bar */}
                            <div className="mb-1 mt-0.5 h-1 w-full rounded-full bg-gray-200">
                                <div
                                    className="h-full rounded-full bg-customDropdownBorder transition-all duration-300"
                                    style={{ width: `${(values.title.length / maxLength) * 100}%` }}
                                />
                            </div>
                            <p className="mb-5 text-right text-xs text-customGrey">
                                {values.title.length}/{maxLength}
                            </p>

                            {/* Due by & Repeats */}
                            <div className="mb-6 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-customTextGrey">
                                        Due by <span className="text-red-500">*</span>
                                    </label>
                                    <DropdownDateRangeSelector
                                        selectedDate={values.dueDate}
                                        onChange={(date) => setFieldValue("dueDate", date)}
                                        placeholder="Choose a date"
                                        style={"style"}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-customTextGrey">
                                        Repeats <span className="text-gray-500">(optional)</span>
                                    </label>
                                    <DropdownField
                                        name="repeat"
                                        options={repeatOptions}
                                        value={values.repeat}
                                        valueChange={(e) => setFieldValue("repeat", e.target.value)}
                                        placeholder="Never"
                                    />
                                </div>
                            </div>

                            {/* Assigned to */}
                            <div>
                                <SearchableDropdown
                                    label={"Assigned to (optional)"}
                                    name="assigned"
                                    options={assignedOptions}
                                    value={values.assigned}
                                    valueChange={(val) => setFieldValue("assigned", val)}
                                    placeholder="Unassigned"
                                />
                            </div>

                            {/* Details Editor */}
                            <label className="mb-1 mt-6 block text-base font-semibold text-customTextGrey">
                                Details <span className="text-sm text-customGrey">(optional)</span>
                            </label>
                            <p className="mb-2 text-sm text-customGrey">Include dates, times, and witnesses where possible</p>
                            <div className="rounded-md">
                                <ReactQuill
                                    value={details}
                                    onChange={setDetails}
                                    placeholder="Start typing…"
                                    modules={modules}
                                    className="custom-quill-editor focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Sticky Footer Buttons */}
                        <div className="sticky bottom-0 z-10 border-t bg-white px-6 py-4">
                            <div className="flex items-center gap-5 text-sm font-semibold">
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigate(`/admin/teams/${id}/carer-feed`);
                                    }}
                                    className="rounded border border-gray-300 px-4 py-1.5 text-customTextGrey hover:bg-customBgGrey"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!values.title || errors.title}
                                    className={`rounded px-4 py-1.5 text-white ${
                                        values.title && !errors.title
                                            ? "bg-customDropdownBorder hover:bg-customDropdownBorder/80"
                                            : "cursor-not-allowed bg-gray-300"
                                    }`}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default ClientActionType;
