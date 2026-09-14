import TextField from "../../../../components/TextInput/TextInput";
import CheckboxButtonGroup from "../../../../components/TextInput/CheckboxButtonGroup";
import TextAreaField from "../../../../components/TextInput/TextAreaField";
import StatusToggleButtonGroup from "../../../../components/TextInput/StatusToggleButtonGroup";
import SearchableDropdown from "../../../../components/DropdownInput/SearchableDropdown";
import { useState } from "react";
import InnerLoader from "../../../../components/Loader/InnerLoader";

const PRNSections = ({ values, setFieldValue, unlockedSections, openSection, setOpenSection, moveToNextSection, isSubmitting, isEditMode }) => {
    const handleSectionToggle = (sectionName) => {
        // Close current section if it's the same, otherwise open the new section and close others
        setOpenSection(openSection === sectionName ? null : sectionName);
    };

    const options = [
        { value: "FEVER", label: "Fever" },
        { value: "STROKE", label: "Stroke" },
        { value: "MALARIAL_FEVER", label: "Malarial fever" },
    ];

    const alsoKnownAsMap = {
        Fever: ["Febrile", "Pyrexia", "Pyrexial"],
    };
    const [showConfirmation, setShowConfirmation] = useState(false);

    return (
        <>
            {/* PRN Time Between Doses Section */}
            {values.route && unlockedSections.has("prntimebetween") && (
                <div className="mb-4 rounded border border-gray-200">
                    <button
                        type="button"
                        className="flex w-full items-center justify-between px-6 py-4 text-left focus:outline-none"
                        onClick={() => handleSectionToggle("prntimebetween")}
                    >
                        <div className="flex-1">
                            <span className="poppins-medium text-sm text-customBlack">What is the shortest time between doses?</span>
                            {openSection !== "prntimebetween" && (
                                <div className="mt-1 text-sm text-customGrey1">
                                    {values.timeBetweenDoses
                                        ? `at least ${values.timeBetweenDoses} ${values.timeBetweenUnit} between doses`
                                        : "Not specified"}
                                </div>
                            )}
                        </div>
                        <svg
                            className={`ml-2 h-5 w-5 transition-transform ${openSection === "prntimebetween" ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>
                    {openSection === "prntimebetween" && (
                        <div className="border-t border-gray-200 px-6 py-4">
                            <div className="mb-4 flex items-center gap-2">
                                <span className="text-sm text-customGrey1">At least</span>
                                <div className="w-20">
                                    <TextField
                                        name="timeBetweenDoses"
                                        value={values.timeBetweenDoses}
                                        placeHolder="4"
                                        valueChange={(e) => setFieldValue("timeBetweenDoses", e.target.value)}
                                        style="mt"
                                    />
                                </div>
                                <select
                                    value={values.timeBetweenUnit}
                                    onChange={(e) => setFieldValue("timeBetweenUnit", e.target.value)}
                                    className="rounded border border-gray-300 px-3 py-3 text-sm"
                                >
                                    <option value="hours">hours</option>
                                    <option value="minutes">minutes</option>
                                    <option value="days">days</option>
                                </select>
                                <span className="text-sm text-customGrey1">between doses</span>
                            </div>
                            <div className="mb-4 text-sm text-customGrey1">e.g. at least {"4"} hours between doses</div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFieldValue("timeBetweenDoses", "");
                                        setFieldValue("timeBetweenUnit", "hours");
                                        setOpenSection(null);
                                        if (!isEditMode) {
                                            moveToNextSection("prntimebetween", "prnmaxdose");
                                        }
                                    }}
                                    className="rounded border border-customNavy px-4 py-2 text-sm text-customNavy hover:bg-gray-50"
                                >
                                    Skip
                                </button>
                                <button
                                    type="button"
                                    disabled={!values.timeBetweenDoses}
                                    className="rounded bg-customDropdownBorder px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-400"
                                    onClick={() => {
                                        setOpenSection(null);
                                        if (!isEditMode) {
                                            moveToNextSection("prntimebetween", "prnmaxdose");
                                        }
                                    }}
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* PRN Max Dose Section */}
            {unlockedSections.has("prnmaxdose") && (
                <div className="mb-4 rounded border border-gray-200">
                    <button
                        type="button"
                        className="flex w-full items-center justify-between px-6 py-4 text-left focus:outline-none"
                        onClick={() => handleSectionToggle("prnmaxdose")}
                    >
                        <div className="flex-1">
                            <span className="poppins-medium text-sm text-customBlack">What is the maximum dose allowance and over what period?</span>
                            <div className="mt-1 text-xs text-customGrey1">1 dose = {values?.dose}</div>
                            {openSection !== "prnmaxdose" && (
                                <div className="mt-1 text-sm text-customGrey1">
                                    {values.maxDoseCount && values.maxDosePeriod && values.maxDoseUnit
                                        ? `${values.maxDoseCount} doses per ${values.maxDosePeriod} ${values.maxDoseUnit}`
                                        : values.otherMaxDose
                                          ? values.otherMaxDose
                                          : "Not specified"}
                                </div>
                            )}
                        </div>
                        <svg
                            className={`ml-2 h-5 w-5 transition-transform ${openSection === "prnmaxdose" ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>
                    {openSection === "prnmaxdose" && (
                        <div className="border-t border-gray-200 px-6 py-4">
                            <div className="mb-4">
                                <StatusToggleButtonGroup
                                    label=""
                                    name="maxDoseType"
                                    value={values.maxDoseType || "by_count"}
                                    options={[
                                        { value: "by_count", label: "By count of doses" },
                                        { value: "other", label: "Other" },
                                    ]}
                                    onChange={(e) => setFieldValue("maxDoseType", e.target.value)}
                                    style="textSize"
                                />
                            </div>

                            {(!values.maxDoseType || values.maxDoseType === "by_count") && (
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="w-20">
                                        <TextField
                                            name="maxDoseCount"
                                            value={values.maxDoseCount}
                                            placeHolder="0"
                                            valueChange={(e) => setFieldValue("maxDoseCount", e.target.value)}
                                            style="mt"
                                        />
                                    </div>
                                    <span className="text-sm text-customGrey1">doses per</span>
                                    <div className="w-20">
                                        <TextField
                                            name="maxDosePeriod"
                                            value={values.maxDosePeriod}
                                            placeHolder="0"
                                            valueChange={(e) => setFieldValue("maxDosePeriod", e.target.value)}
                                            style="mt"
                                        />
                                    </div>
                                    <select
                                        value={values.maxDoseUnit}
                                        onChange={(e) => setFieldValue("maxDoseUnit", e.target.value)}
                                        className="rounded border border-gray-300 px-3 py-3 text-sm"
                                    >
                                        <option value="">Select time</option>
                                        <option value="hours">hours</option>
                                        <option value="days">days</option>
                                        <option value="weeks">weeks</option>
                                    </select>
                                </div>
                            )}

                            {values.maxDoseType === "other" && (
                                <div className="mb-4">
                                    <div className="mb-2 text-sm text-customBlack">Enter the maximum dose per period in words</div>
                                    <textarea
                                        value={values.otherMaxDose || ""}
                                        onChange={(e) => setFieldValue("otherMaxDose", e.target.value)}
                                        placeholder="Enter the maximum dose allowance and over what period?"
                                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                        rows={4}
                                    />
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="rounded border border-customNavy px-4 py-2 text-sm text-customNavy hover:bg-gray-50"
                                    onClick={() => {
                                        setFieldValue("maxDoseCount", "");
                                        setFieldValue("maxDosePeriod", "");
                                        setFieldValue("maxDoseUnit", "");
                                        setFieldValue("maxDoseType", "");
                                        setFieldValue("otherMaxDose", "");
                                        setOpenSection(null);
                                        if (!isEditMode) {
                                            moveToNextSection("prnmaxdose", "prnmedicalcondition");
                                        }
                                    }}
                                >
                                    Skip
                                </button>
                                <button
                                    type="button"
                                    disabled={
                                        !values.maxDoseType ||
                                        (values.maxDoseType === "by_count" &&
                                          (!values.maxDoseCount || !values.maxDosePeriod || !values.maxDoseUnit)) ||
                                        (values.maxDoseType === "other" && !values.otherMaxDose)
                                      }
                                      
                                    className="rounded bg-customDropdownBorder px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-400"
                                    onClick={() => {
                                        setOpenSection(null);
                                        if (!isEditMode) {
                                            moveToNextSection("prnmaxdose", "prnmedicalcondition");
                                        }
                                    }}
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* PRN Medical Condition Section */}
            {unlockedSections.has("prnmedicalcondition") && (
                <div className="mb-4 rounded border border-gray-200">
                    <button
                        type="button"
                        className="flex w-full items-center justify-between px-6 py-4 text-left focus:outline-none"
                        onClick={() => handleSectionToggle("prnmedicalcondition")}
                    >
                        <div className="flex-1">
                            <span className="poppins-medium text-sm text-customBlack">Why is this medication needed?</span>
                            {openSection !== "prnmedicalcondition" && (
                                <div className="mt-1 text-sm text-customGrey1">
                                    {Array.isArray(values.medicalCondition) && values.medicalCondition.length > 0
                                        ? values.medicalCondition.join(", ")
                                        : values.medicalCondition || "Not specified"}
                                </div>
                            )}
                        </div>
                        <svg
                            className={`ml-2 h-5 w-5 transition-transform ${openSection === "prnmedicalcondition" ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>
                    {openSection === "prnmedicalcondition" && (
                        <div className="border-t border-gray-200 px-6 py-4">
                            <SearchableDropdown
                                label="What is the underlying medical condition this medication is needed for?"
                                name="medicalCondition"
                                options={options}
                                value={Array.isArray(values.medicalCondition) ? values.medicalCondition : []}
                                valueChange={(value) => setFieldValue("medicalCondition", value)}
                                alsoKnownAsMap={alsoKnownAsMap}
                                // isMulti
                                restrictClinicalSearch={values.restrictClinicalSearch}
                                setRestrictClinicalSearch={(value) => setFieldValue("restrictClinicalSearch", value)}
                            />
                            <div className="mb-4 mt-4">
                                <div className="mb-2 text-sm text-customBlack">Additional Details</div>
                                <TextAreaField
                                    name="medicalConditionDetails"
                                    value={values.medicalConditionDetails}
                                    placeHolder="Add details..."
                                    valueChange={(e) => setFieldValue("medicalConditionDetails", e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="rounded border border-customNavy px-4 py-2 text-sm text-customNavy hover:bg-gray-50"
                                    onClick={() => {
                                        setFieldValue("medicalCondition", "");
                                        setFieldValue("medicalConditionDetails", "");
                                        setOpenSection(null);
                                        if (!isEditMode) {
                                            moveToNextSection("prnmedicalcondition", "prncircumstances");
                                        }
                                    }}
                                >
                                    Skip
                                </button>
                                <button
                                    type="button"
                                    className="rounded bg-customDropdownBorder px-4 py-2 text-sm text-white"
                                    onClick={() => {
                                        setOpenSection(null);
                                        if (!isEditMode) {
                                            moveToNextSection("prnmedicalcondition", "prncircumstances");
                                        }
                                    }}
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* PRN Circumstances Section */}
            {unlockedSections.has("prncircumstances") && (
                <div className="mb-4 rounded border border-gray-200">
                    <button
                        type="button"
                        className="flex w-full items-center justify-between px-6 py-4 text-left focus:outline-none"
                        onClick={() => handleSectionToggle("prncircumstances")}
                    >
                        <div className="flex-1">
                            <span className="poppins-medium text-sm text-customBlack">In which circumstances should this medicine be given?</span>
                            {openSection !== "prncircumstances" && (
                                <div className="mt-1 text-sm text-customGrey1">{values.circumstances || "Not specified"}</div>
                            )}
                        </div>
                        <svg
                            className={`ml-2 h-5 w-5 transition-transform ${openSection === "prncircumstances" ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>
                    {openSection === "prncircumstances" && (
                        <div className="border-t border-gray-200 px-6 py-4">
                            <div className="mb-4">
                                <div className="mb-2 text-sm text-customBlack">Are there any specific symptoms to look for?</div>
                                <TextField
                                    name="circumstances"
                                    value={values.circumstances}
                                    placeHolder="e.g. asthma attack"
                                    valueChange={(e) => setFieldValue("circumstances", e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <div className="mb-2 text-sm text-customBlack">How would client express they need this medication?</div>
                                <TextField
                                    name="clientExpression"
                                    value={values.clientExpression}
                                    placeHolder="e.g. observe non-verbal cues"
                                    valueChange={(e) => setFieldValue("clientExpression", e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="rounded border border-customNavy px-4 py-2 text-sm text-customNavy hover:bg-gray-50"
                                    onClick={() => {
                                        setFieldValue("circumstances", "");
                                        setFieldValue("clientExpression", "");
                                        setOpenSection(null);
                                        if (!isEditMode) {
                                            moveToNextSection("prncircumstances", "prngpliaison");
                                        }
                                    }}
                                >
                                    Skip
                                </button>
                                <button
                                    type="button"
                                    className="rounded bg-customDropdownBorder px-4 py-2 text-sm text-white"
                                    onClick={() => {
                                        setOpenSection(null);
                                        if (!isEditMode) {
                                            moveToNextSection("prncircumstances", "prngpliaison");
                                        }
                                    }}
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* PRN GP Liaison Section */}
            {unlockedSections.has("prngpliaison") && (
                <div className="mb-4 rounded border border-gray-200">
                    <button
                        type="button"
                        className="flex w-full items-center justify-between px-6 py-4 text-left focus:outline-none"
                        onClick={() => handleSectionToggle("prngpliaison")}
                    >
                        <div className="flex-1">
                            <span className="poppins-medium text-sm text-customBlack">When to liaise with GP?</span>
                            {openSection !== "prngpliaison" && (
                                <div className="mt-1 text-sm text-customGrey1">
                                    {values.gpLiaison.length > 0 ? values.gpLiaison.join(", ") : "Not specified"}
                                </div>
                            )}
                        </div>
                        <svg
                            className={`ml-2 h-5 w-5 transition-transform ${openSection === "prngpliaison" ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>
                    {openSection === "prngpliaison" && (
                        <div className="border-t border-gray-200 px-6 py-4">
                            <CheckboxButtonGroup
                                label=""
                                name="gpLiaison"
                                value={values.gpLiaison}
                                options={[
                                    { value: "Persistent need for upper dosage", label: "Persistent need for upper dosage" },
                                    { value: "No desired outcome", label: "No desired outcome" },
                                    { value: "Never requests dosage", label: "Never requests dosage" },
                                    { value: "Requesting too often", label: "Requesting too often" },
                                    { value: "Side effects / Adverse reaction", label: "Side effects / Adverse reaction" },
                                    { value: "Other", label: "Other" },
                                ]}
                                valueChange={(e) => setFieldValue("gpLiaison", e.target.value)}
                            />
                            <div className="mt-4 flex gap-2">
                                <button
                                    type="button"
                                    className="rounded border border-customNavy px-4 py-2 text-sm text-customNavy hover:bg-gray-50"
                                    onClick={() => {
                                        setFieldValue("gpLiaison", []);
                                        setOpenSection(null);
                                        if (!isEditMode) {
                                            moveToNextSection("prngpliaison", "prnschedule");
                                        }
                                    }}
                                >
                                    Skip
                                </button>
                                <button
                                    type="button"
                                    className="rounded bg-customDropdownBorder px-4 py-2 text-sm text-white"
                                    onClick={() => {
                                        setOpenSection(null);
                                        if (!isEditMode) {
                                            moveToNextSection("prngpliaison", "prnschedule");
                                        }
                                    }}
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* PRN Schedule Section */}
            {unlockedSections.has("prnschedule") && !isEditMode && (
                <div className="mb-4 rounded border border-gray-200">
                    <button
                        type="button"
                        className="flex w-full items-center justify-between px-6 py-4 text-left focus:outline-none"
                        onClick={() => handleSectionToggle("prnschedule")}
                    >
                        <div className="flex-1">
                            <span className="poppins-medium text-sm text-customBlack">
                                When should the dose be administered? <span className="text-red-500">*</span>
                            </span>
                            {openSection !== "prnschedule" && (
                                <div className="mt-1 text-sm text-customGrey1">
                                    {values.prnStartDate
                                        ? `Start: ${values.prnStartDate}${values.prnEndDate ? ` | End: ${values.prnEndDate}` : ""}`
                                        : "Not specified"}
                                </div>
                            )}
                        </div>
                        <svg
                            className={`ml-2 h-5 w-5 transition-transform ${openSection === "prnschedule" ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>
                    {openSection === "prnschedule" && (
                        <div className="border-t border-gray-200 px-6 py-4">
                            <div className="mb-4">
                                <div className="mb-2 text-sm text-customBlack">Start date</div>
                                <input
                                    type="date"
                                    value={values.prnStartDate}
                                    min={new Date().toISOString().split("T")[0]}
                                    required
                                    onChange={(e) => setFieldValue("prnStartDate", e.target.value)}
                                    className="w-full rounded border border-gray-300 px-3 py-3 text-sm text-customTextGrey"
                                />
                            </div>
                            <div className="mb-4">
                                <div className="mb-2 text-sm text-customBlack">End date (optional)</div>
                                <input
                                    type="date"
                                    value={values.prnEndDate}
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => setFieldValue("prnEndDate", e.target.value)}
                                    className="w-full rounded border border-gray-300 px-3 py-3 text-sm text-customTextGrey"
                                />
                            </div>
                            <div className="mb-4 text-sm text-customGrey1">
                                Start and end dates are inclusive - any doses planned for that time will be included in the MAR chart.
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={!values.prnStartDate}
                                    className="rounded bg-customDropdownBorder px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-400"
                                    onClick={() => {
                                        setOpenSection(null);
                                        if (!isEditMode) {
                                            moveToNextSection("prnschedule", "additionalInstructions");
                                        }
                                    }}
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Additional Instructions Section for PRN */}
            {unlockedSections.has("additionalInstructions") && (
                <div className="mb-4 rounded border border-gray-200">
                    <button
                        type="button"
                        className="flex w-full items-center justify-between px-6 py-4 text-left focus:outline-none"
                        onClick={() => handleSectionToggle("additionalInstructions")}
                    >
                        <div className="flex-1">
                            <span className="poppins-medium text-sm text-customBlack">Are there any additional instructions?</span>
                            {openSection !== "additionalInstructions" && values.additionalInstructions && (
                                <div className="mt-1 text-sm text-customGrey1">{values.additionalInstructions}</div>
                            )}
                        </div>
                        <svg
                            className={`ml-2 h-5 w-5 transition-transform ${openSection === "additionalInstructions" ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>
                    {openSection === "additionalInstructions" && (
                        <div className="space-y-4 border-t border-gray-200 px-6 py-4">
                            {/* Create body map */}
                            <div>
                                <div className="mb-2 text-sm text-customBlack">Create a body map (optional)</div>
                                <button
                                    type="button"
                                    className="rounded border border-gray-300 px-4 py-2 text-sm text-customBlack hover:bg-gray-50"
                                    onClick={() => setFieldValue("showBodyMapModal", true)}
                                >
                                    Create body map
                                </button>
                            </div>

                            {/* Add additional instructions */}
                            <div>
                                <div className="mb-2 text-sm text-customBlack">Add additional instructions (optional)</div>
                                <TextAreaField
                                    name="additionalInstructions"
                                    value={values.additionalInstructions}
                                    placeHolder="Add a note...."
                                    valueChange={(e) => setFieldValue("additionalInstructions", e.target.value)}
                                />
                            </div>

                            {/* Confirm instructions button */}
                            <button
                                type="button"
                                className="rounded bg-customDropdownBorder px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-400"
                                onClick={() => {
                                    setShowConfirmation(true);
                                    setOpenSection(null);
                                }}
                            >
                                {isEditMode ? "Confirm amended instructions" : "Confirm instructions"}
                            </button>

                            {/* Help text */}
                            <div className="mt-4 flex items-start text-sm text-customGrey1">
                                <span className="mr-2">&#9432;</span>
                                <div>
                                    <p className="mb-1">
                                        Please record any additional directions from the prescription and dispensing label on how the medicine should
                                        be taken or given.
                                    </p>
                                    <p>
                                        For example: medication purpose, medication appearance, minimum time between doses, the maximum number of
                                        doses to be given (in 24 hrs) etc. For more information please review the{" "}
                                        <a
                                            href="https://www.nice.org.uk/"
                                            className="text-customNavy hover:underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            NICE guidelines
                                        </a>
                                        .
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {showConfirmation && (
                <div className="mt-6">
                    <div className="flex items-start rounded-md border border-[#976811] bg-[#FFF8EB] p-4 text-sm text-[#976811]">
                        <span className="mr-2 text-lg">⚠️</span>
                        <p>
                            These changes will not be synced to the mobile app automatically. Caregivers must manually refresh the visits list in the
                            mobile application to receive the latest changes. If you are concerned that carers may not see this change then contact
                            them directly.
                        </p>
                    </div>

                    <div className="mt-4 flex gap-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            // onClick={() => setShowConfirmation(false)}
                            className="poppins-semibold rounded bg-customDropdownBorder px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-opacity-80"
                        >
                            {isSubmitting ? (
                                <InnerLoader
                                    loading={isSubmitting}
                                    text={isEditMode ? "Updating..." : "Scheduling..."}
                                />
                            ) : (
                                isEditMode ? "Yes, amend schedule" : "Yes, create schedule"
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowConfirmation(false)}
                            className="poppins-semibold text-sm text-customTextLightNavy underline"
                        >
                            Cancel changes
                        </button>
                    </div>
                </div>
            )}

            {/* Body Map Modal */}
            {values.showBodyMapModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="poppins-medium text-lg text-customBlack">Create Body Map</h3>
                            <button
                                type="button"
                                onClick={() => setFieldValue("showBodyMapModal", false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className="py-8 text-center">
                            <p className="text-customGrey1">Body map functionality will be implemented here.</p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setFieldValue("showBodyMapModal", false)}
                                className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => setFieldValue("showBodyMapModal", false)}
                                className="rounded bg-customDropdownBorder px-4 py-2 text-sm text-white"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PRNSections;
