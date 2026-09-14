import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import StatusToggleButtonGroup from "../../../../components/TextInput/StatusToggleButtonGroup";
import { AddMedicationSchema } from "../../../../utils/validations/clients/clientMedicationValidation";
import { SUPPORT_OPTIONS, TYPE_OPTIONS, ROUTE_OPTIONS } from "../../../../constants/clientMedication";
import { useGlobalStore } from "../../../../stores/useGlobalStore";
import TextField from "../../../../components/TextInput/TextInput";
import { _get, _post, _put } from "../../../../utils/ApiService";
import APIConfig from "../../../../utils/ApiConfig";
import { showError, showSuccess } from "../../../../utils/toaster";
import { fetchData } from "../../../../utils/FetchData";
import InnerLoader from "../../../../components/Loader/InnerLoader";
import { useNavigationHelpers } from "../../../../hooks/useNavigationHelpers";
import PRNSections from "./PRNSections";
import RegularMedicationSections from "./RegularMedicationSections";
import AddMedicationHeader from "./AddMedicationHeader";
import DotLoader from "../../../../components/Loader/DotLoader";
import { displayValue, formatMedicationType, getRouteOptions } from "../../../../data/clients/clientMedication";
import { isNotEmpty } from "../../../../utils/common";
import { isEmpty } from "lodash";
import { ChevronsLeft } from "lucide-react";
import StopScheduleDialog from "./StopScheduleDialog";

const AddMedicationForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id, userData } = useNavigationHelpers();
    const { scheduleId } = useParams();
    const [openInfo, setOpenInfo] = useState(true);
    const [openSection, setOpenSection] = useState("support");
    const [tempDose, setTempDose] = useState("");
    const [loading, setLoading] = useState(false);
    const [unlockedSections, setUnlockedSections] = useState(new Set(["support"]));
    const [doseTab, setDoseTab] = useState("quantity");
    const [isLoading, setIsLoading] = useState(false);
    const [showStopDialog, setShowStopDialog] = useState(false);
    const [data, setData] = useState(null);
    const medication = location.state?.medication || data;

    // Check if we're in edit mode
    // const isEditMode = !!(data || location.state?.medication);

    const isEditMode = !!scheduleId;

    const { clientsPersonalDetailData } = useGlobalStore();

    const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : "the client";

    const handleTypeChange = (newType, setFieldValue) => {
        // Reset all type-dependent fields
        setFieldValue("type", newType.toUpperCase());
        setFieldValue("dose", "");
        setFieldValue("quantityAmount", "");
        setFieldValue("rangeFrom", "");
        setFieldValue("rangeTo", "");
        setFieldValue("otherDose", "");
        setFieldValue("additionalDetails", "");
        setFieldValue("route", "");
        setFieldValue("routeType", "");
        setFieldValue("frequencyType", "");
        setFieldValue("dailyTimes", "");
        setFieldValue("timingPreference", "");
        setFieldValue("selectedTimeSlots", []);
        setFieldValue("exactTimes", {});
        setFieldValue("firstDoseDate", "");
        setFieldValue("firstDoseTime", "");
        setFieldValue("lastDoseDate", "");
        setFieldValue("lastDoseTime", "");
        setFieldValue("pastAdministrations", []);

        // Reset PRN specific fields
        if (newType !== "PRN") {
            setFieldValue("timeBetweenDoses", "");
            setFieldValue("timeBetweenUnit", "hours");
            setFieldValue("maxDoseCount", "");
            setFieldValue("maxDosePeriod", "");
            setFieldValue("maxDoseUnit", "hours");
            setFieldValue("maxDoseType", "");
            setFieldValue("medicalCondition", "");
            setFieldValue("medicalConditionDetails", "");
            setFieldValue("circumstances", "");
            setFieldValue("clientExpression", "");
            setFieldValue("gpLiaison", []);
            setFieldValue("prnStartDate", "");
            setFieldValue("prnEndDate", "");
        }

        // Reset unlocked sections to only show dose section next
        setUnlockedSections(new Set(["support", "type", "dose"]));
        moveToNextSection("type", "dose");
    };

    useEffect(() => {
        const fetchExistingData = async () => {
            if (scheduleId) {
                try {
                    setIsLoading(true);
                    const res = await _get(APIConfig.CLIENT_MEDICATION_SCHEDULING.GET_BY_ID(scheduleId));
                    if (res?.data?.error === false) {
                        setData(res.data?.results?.data);
                    }
                } catch (err) {
                    console.error("Error fetching medication details", err);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchExistingData();
    }, [scheduleId]);

    // Set up initial sections for edit mode
    useEffect(() => {
        if (isEditMode && medication) {
            // Unlock all sections that have data
            const sectionsToUnlock = new Set(["support"]);

            if (medication.type) sectionsToUnlock.add("type");
            if (medication.dose) sectionsToUnlock.add("dose");
            if (medication.route || medication.routeType) sectionsToUnlock.add("route");

            if (medication.type === "PRN") {
                if (medication.timeBetweenDoses) sectionsToUnlock.add("prntimebetween");
                if (medication.maxDoseCount || medication.maxDosePeriod || medication.otherMaxDose) sectionsToUnlock.add("prnmaxdose");
                if (medication.medicalCondition?.length > 0 || medication.medicalConditionDetails) sectionsToUnlock.add("prnmedicalcondition");
                if (medication.circumstances || medication.clientExpression) sectionsToUnlock.add("prncircumstances");
                if (medication.gpLiaison?.length > 0) sectionsToUnlock.add("prngpliaison");
                if (medication.prnStartDate) sectionsToUnlock.add("prnschedule");
                sectionsToUnlock.add("additionalInstructions");
            } else {
                if (medication.frequencyType || medication.dailyTimes) sectionsToUnlock.add("frequency");
                if (medication.timingPreference) sectionsToUnlock.add("schedulemedication");
                if (medication.firstDoseDate) sectionsToUnlock.add("doseschedule");
                if (medication.pastAdministrations?.length > 0) sectionsToUnlock.add("pastadministrations");
                sectionsToUnlock.add("additionalInstructions");
            }

            setUnlockedSections(sectionsToUnlock);

            // Set dose tab for PRN if needed
            if (medication.type === "PRN" && medication.quantityAmount) {
                setDoseTab("quantity");
            } else if (medication.type === "PRN" && (medication.rangeFrom || medication.rangeTo)) {
                setDoseTab("range");
            } else if (medication.type === "PRN" && medication.otherDose) {
                setDoseTab("other");
            }
        }
    }, [isEditMode, medication]);

    useEffect(() => {
        if (isEditMode && data?.dose) {
            setTempDose(data?.dose);
        } else {
            setTempDose("");
        }
    }, [isEditMode, data?.dose, data]);

    if (isLoading) {
        return (
            <DotLoader
                loading={isLoading}
                style="bg-white"
            />
        );
    }

    const initialValues = {
        // Medication Details
        medicationName: medication?.medicationName || medication?.name || "",
        support: medication?.support || "",
        type: medication?.type || "",
        dose: medication?.dose || "",
        routeType: medication?.routeType || "",
        route: medication?.route || "",
        frequencyType: medication?.frequencyType || "",
        dailyTimes: medication?.dailyTimes || "",
        customRepeat: medication?.customRepeat || 1,
        customUnit: medication?.customUnit || "days",
        pastAdministrations: medication?.pastAdministrations || [],
        // Schedule Medication fields
        timingPreference: medication?.timingPreference || "",
        selectedTimeSlots: medication?.selectedTimeSlots || [],
        exactTimes: medication?.exactTimes || {},
        firstDoseDate: medication?.firstDoseDate || "",
        lastDoseDate: medication?.lastDoseDate || "",
        firstDoseTime: medication?.firstDoseTime || "",
        lastDoseTime: medication?.lastDoseTime || "",
        // Body map
        bodyMapData: medication?.bodyMapData || null,

        // PRN fields
        quantityAmount: medication?.quantityAmount || "",
        rangeFrom: medication?.rangeFrom || "",
        rangeTo: medication?.rangeTo || "",
        otherDose: medication?.otherDose || "",
        additionalDetails: medication?.additionalDetails || "",

        // PRN specific fields
        timeBetweenDoses: medication?.timeBetweenDoses || "",
        timeBetweenUnit: medication?.timeBetweenUnit || "hours",
        maxDoseCount: medication?.maxDoseCount || "",
        maxDosePeriod: medication?.maxDosePeriod || "",
        maxDoseUnit: medication?.maxDoseUnit || "hours",
        maxDoseType: medication?.maxDoseType || "",
        otherMaxDose: medication?.otherMaxDose || "",
        medicalCondition: medication?.medicalCondition || [],
        restrictClinicalSearch: medication?.restrictClinicalSearch ?? true,
        medicalConditionDetails: medication?.medicalConditionDetails || "",
        circumstances: medication?.circumstances || "",
        clientExpression: medication?.clientExpression || "",
        gpLiaison: medication?.gpLiaison || [],
        prnStartDate: medication?.prnStartDate || "",
        prnEndDate: medication?.prnEndDate || "",

        // Additional instructions
        additionalInstructions: medication?.additionalInstructions || "",
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const payload = {
                // Client/Medication info
                clientFirstName: userData?.user?.firstName,
                clientLastName: userData?.user?.lastName,
                medicationDescription: medication?.medicationDescription || medication?.description,

                medicationName: values.medicationName,
                support: values.support,
                type: values.type,
                dose: values.dose,
                route: values.route,
                routeType: values.routeType,
                additionalInstructions: values.additionalInstructions,
                bodyMapData: values.bodyMapData,

                // Past
                pastAdministrations: values.pastAdministrations,

                // Frequency (flattened)
                frequencyType: values.frequencyType,
                dailyTimes: values.dailyTimes,
                customRepeat: values.customRepeat,
                customUnit: values.customUnit,

                // Timing (flattened)
                timingPreference: values.timingPreference,
                selectedTimeSlots: values.selectedTimeSlots,
                exactTimes: values.exactTimes,

                // Schedule (flattened)
                firstDoseDate: values.firstDoseDate,
                firstDoseTime: values.firstDoseTime,
                lastDoseDate: values.lastDoseDate,
                lastDoseTime: values.lastDoseTime,

                // PRN-specific
                quantityAmount: values.quantityAmount,
                rangeFrom: values.rangeFrom,
                rangeTo: values.rangeTo,
                otherDose: values.otherDose,
                additionalDetails: values.additionalDetails,

                timeBetweenDoses: values.timeBetweenDoses,
                timeBetweenUnit: values.timeBetweenUnit,
                maxDoseCount: values.maxDoseCount,
                maxDosePeriod: values.maxDosePeriod,
                maxDoseUnit: values.maxDoseUnit,
                maxDoseType: values.maxDoseType,
                otherMaxDose: values.otherMaxDose,

                medicalCondition: values.medicalCondition || [],
                restrictClinicalSearch: values.restrictClinicalSearch,
                medicalConditionDetails: values.medicalConditionDetails,
                circumstances: values.circumstances,
                clientExpression: values.clientExpression,
                gpLiaison: values.gpLiaison,
                prnStartDate: values.prnStartDate,
                prnEndDate: values.prnEndDate,
            };


            const apiCall = isEditMode
                ? () => _put(APIConfig.CLIENT_MEDICATION_SCHEDULING.UPDATE(medication?.id), payload)
                : () => _post(APIConfig.CLIENT_MEDICATION_SCHEDULING.CREATE(id), payload);

            const response = await fetchData(apiCall, null, setLoading, null, null, false);

            if (response?.data?.error === false) {
                const successMessage = isEditMode
                    ? response?.data?.message || "Medication updated successfully"
                    : response?.data?.message || "Medication added successfully";
                showSuccess(successMessage);
                navigate(`/admin/clients/${id}/medication`);
            } else {
                const errorMessage = isEditMode
                    ? response?.data?.message || "Failed to update medication"
                    : response?.data?.message || "Failed to add medication";
                showError(errorMessage);
            }
        } catch (error) {
            console.error("Error submitting medication:", error);
            const errorMessage = isEditMode ? "An error occurred while updating the medication" : "An error occurred while adding the medication";
            showError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const moveToNextSection = (currentSection, nextSection) => {
        setUnlockedSections((prev) => new Set([...prev, nextSection]));
        setOpenSection(nextSection);
    };

    const quantityOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

    return (
        <div className="min-h-screen px-2 pb-10 md:px-10 md:py-10 xl:px-20">
            {isEmpty(data) && !isEditMode && (
                <>
                    <h1 className="poppins-medium mb-1 text-2xl text-customBlack">Add a medication</h1>
                    <p className="mb-6 text-sm text-customGrey1">Create a schedule to match {clientName}&apos;s prescription.</p>
                </>
            )}

            <div className="">
                {isEmpty(data) && !isEditMode && (
                    <>
                        {/* Medication Details Collapsible */}
                        <AddMedicationHeader
                            setOpenInfo={setOpenInfo}
                            medication={medication}
                            openInfo={openInfo}
                        />
                    </>
                )}

                {(isNotEmpty(data) || isEditMode) && (
                    <>
                        <div className="pb-6">
                            <div className="poppins-medium text-lg text-customBlack">
                                {medication?.medicationDescription || medication?.description || "—"}
                            </div>
                            <div className="mb-1 text-base text-customBlack1">Edit medication schedule</div>
                        </div>
                    </>
                )}

                {(isNotEmpty(data) || isEditMode) && (
                    <>
                        <div className="mb-6 flex items-center justify-between gap-2">
                            <button
                                className="poppins-semibold flex items-center gap-1 text-sm text-customTextLightNavy"
                                onClick={() => navigate(-1)}
                            >
                                <ChevronsLeft className="mb-0.5 h-5 w-5" />
                                Back to medication schedules
                            </button>
                            <button
                                className="poppins-semibold text-sm text-customTextLightNavy"
                                onClick={() => setShowStopDialog(true)}
                            >
                                Stop medication schedule
                            </button>
                        </div>

                        {showStopDialog && (
                            <StopScheduleDialog
                                onClose={() => setShowStopDialog(false)}
                                scheduleId={medication?.id}
                            />
                        )}
                    </>
                )}

                <Formik
                    initialValues={initialValues}
                    // validationSchema={AddMedicationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({ values, errors, touched, setFieldValue, isSubmitting }) => (
                        <>
                            <Form>
                                {/* Support Section */}
                                <div className="mb-4 rounded border border-gray-200">
                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-between px-6 py-4 text-left focus:outline-none"
                                        onClick={() => setOpenSection(openSection === "support" ? null : "support")}
                                    >
                                        <div className="flex-1">
                                            <span className="poppins-medium text-sm text-customBlack">
                                                {values.support ? "Support" : "What support is required with this medication?"}{" "}
                                                <span className="text-red-500">*</span>
                                            </span>
                                            {values.support && openSection !== "support" && (
                                                <div className="mt-1 text-sm text-customGrey1">
                                                    {values.support === "ADMINISTER"
                                                        ? "Administer"
                                                        : values.support === "ASSIST"
                                                          ? "Assist"
                                                          : "Prompt"}
                                                </div>
                                            )}
                                        </div>
                                        <svg
                                            className={`ml-2 h-5 w-5 transition-transform ${openSection === "support" ? "rotate-180" : ""}`}
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
                                    {((!values.support && !isEditMode) || openSection === "support") && (
                                        <div className="border-t border-gray-200 px-6 py-4">
                                            <StatusToggleButtonGroup
                                                label=""
                                                name="support"
                                                value={values.support}
                                                options={SUPPORT_OPTIONS}
                                                onChange={(e) => {
                                                    setFieldValue("support", e.target.value.toUpperCase());
                                                    if (!isEditMode) {
                                                        moveToNextSection("support", "type");
                                                    }
                                                }}
                                                error={errors.support && touched.support ? errors.support : undefined}
                                                style="textSize"
                                            />
                                            <div className="mt-3 flex items-start text-sm text-customGrey1">
                                                <span className="mr-2">&#9432;</span>
                                                <span>
                                                    If you&apos;re unsure, we recommend reading the{" "}
                                                    <a
                                                        href="https://www.cqc.org.uk/guidance-providers/adult-social-care/managing-medicines-home-care-providers"
                                                        className="hover:poppins-semibold cursor-pointer text-customNavy hover:text-customTextLightNavy hover:underline"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        CQC&apos;s guidance
                                                    </a>{" "}
                                                    on medicines support.
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {!isEditMode ? (
                                    <>
                                        {/* Type Section */}
                                        {values.support && unlockedSections.has("type") && (
                                            <div className="mb-4 rounded border border-gray-200">
                                                <button
                                                    type="button"
                                                    className="flex w-full items-center justify-between px-6 py-4 text-left focus:outline-none"
                                                    onClick={() => setOpenSection(openSection === "type" ? null : "type")}
                                                >
                                                    <div className="flex-1">
                                                        <span className="poppins-medium text-sm text-customBlack">
                                                            Type <span className="text-red-500">*</span>
                                                        </span>
                                                        {values.type && openSection !== "type" && (
                                                            <div className="mt-1 text-sm text-customGrey1">{formatMedicationType(values.type)}</div>
                                                        )}
                                                    </div>
                                                    <svg
                                                        className={`ml-2 h-5 w-5 transition-transform ${openSection === "type" ? "rotate-180" : ""}`}
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
                                                {((!values.type && !isEditMode) || openSection === "type") && (
                                                    <div className="border-t border-gray-200 px-6 py-4">
                                                        <div className="poppins-medium mb-3 text-sm text-customBlack">
                                                            What type of medication is this? <span className="text-red-500">*</span>
                                                        </div>
                                                        <StatusToggleButtonGroup
                                                            label=""
                                                            name="type"
                                                            value={values.type}
                                                            options={TYPE_OPTIONS}
                                                            onChange={(e) => {
                                                                if (isEditMode) {
                                                                    setFieldValue("type", e.target.value.toUpperCase());
                                                                } else {
                                                                    handleTypeChange(e.target.value, setFieldValue);
                                                                }
                                                            }}
                                                            error={errors.type && touched.type ? errors.type : undefined}
                                                            style="textSize"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <></>
                                )}
                                {/* Dose Section */}
                                {values.type && unlockedSections.has("dose") && (
                                    <div className="mb-4 rounded border border-gray-200">
                                        <button
                                            type="button"
                                            className="flex w-full items-center justify-between px-6 py-4 text-left focus:outline-none"
                                            onClick={() => setOpenSection(openSection === "dose" ? null : "dose")}
                                        >
                                            <div className="flex-1">
                                                <span className="poppins-medium text-sm text-customBlack">
                                                    What is the dose for this medication?
                                                    {values.type === "PRN" && <span className="text-red-500"> *</span>}
                                                </span>
                                                {values.dose && openSection !== "dose" && (
                                                    <div className="mt-1 text-sm text-customGrey1">{values.dose}</div>
                                                )}
                                            </div>
                                            <svg
                                                className={`ml-2 h-5 w-5 transition-transform ${openSection === "dose" ? "rotate-180" : ""}`}
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
                                        {((!values.dose && !isEditMode) || openSection === "dose") && (
                                            <div className="border-t border-gray-200 px-6 py-4">
                                                {values.type === "PRN" && medication?.doseForm === "TABLET" ? (
                                                    // PRN Dose UI with StatusToggle
                                                    <>
                                                        <div className="mb-4">
                                                            <StatusToggleButtonGroup
                                                                label=""
                                                                name="doseType"
                                                                value={doseTab}
                                                                options={[
                                                                    { value: "quantity", label: "Quantity" },
                                                                    { value: "range", label: "Range" },
                                                                    { value: "other", label: "Other" },
                                                                ]}
                                                                onChange={(e) => setDoseTab(e.target.value)}
                                                                style="textSize"
                                                            />
                                                        </div>

                                                        {/* Quantity Tab */}
                                                        {doseTab === "quantity" && (
                                                            <div className="mb-4 flex items-center gap-2">
                                                                <select
                                                                    value={values.quantityAmount}
                                                                    onChange={(e) => setFieldValue("quantityAmount", e.target.value)}
                                                                    className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                                                                >
                                                                    <option value="">0</option>
                                                                    {quantityOptions?.map((n) => (
                                                                        <option
                                                                            key={n}
                                                                            value={n}
                                                                        >
                                                                            {n}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <span className="text-sm text-customGrey1">modified-release tablet</span>
                                                            </div>
                                                        )}

                                                        {/* Range Tab */}
                                                        {doseTab === "range" && (
                                                            <div className="space-y-4">
                                                                <div className="flex items-center gap-2">
                                                                    <select
                                                                        value={values.rangeFrom}
                                                                        onChange={(e) => setFieldValue("rangeFrom", e.target.value)}
                                                                        className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                                                                    >
                                                                        <option value="">0</option>
                                                                        {quantityOptions?.map((n) => (
                                                                            <option
                                                                                key={n}
                                                                                value={n}
                                                                            >
                                                                                {n}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <span className="text-sm text-customGrey1">to</span>
                                                                    <select
                                                                        value={values.rangeTo}
                                                                        onChange={(e) => setFieldValue("rangeTo", e.target.value)}
                                                                        className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                                                                    >
                                                                        <option value="">0</option>
                                                                        {quantityOptions?.map((n) => (
                                                                            <option
                                                                                key={n}
                                                                                value={n}
                                                                            >
                                                                                {n}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    <span className="text-sm text-customGrey1">modified-release tablet</span>
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-medium text-customBlack">Additional details</div>
                                                                    <div className="mb-2 text-sm text-customGrey1">
                                                                        Specify how much of the medication within the given range should be
                                                                        administered in different circumstances.
                                                                    </div>
                                                                    <textarea
                                                                        value={values.additionalDetails}
                                                                        onChange={(e) => setFieldValue("additionalDetails", e.target.value)}
                                                                        placeholder="E.g. administer one tablet when... and two tablets when..."
                                                                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                                                        rows={4}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Other Tab */}
                                                        {doseTab === "other" && (
                                                            <div className="mb-4 w-full md:w-80">
                                                                <TextField
                                                                    name="otherDose"
                                                                    value={values.otherDose}
                                                                    placeHolder="E.g. one or two tablets"
                                                                    valueChange={(e) => setFieldValue("otherDose", e.target.value)}
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    // Set dose value based on selected tab
                                                                    let doseValue = "";
                                                                    if (doseTab === "quantity" && values.quantityAmount) {
                                                                        doseValue = `${values.quantityAmount} modified-release tablet`;
                                                                    } else if (doseTab === "range" && values.rangeFrom && values.rangeTo) {
                                                                        doseValue = `${values.rangeFrom} to ${values.rangeTo} modified-release tablet`;
                                                                    } else if (doseTab === "other" && values.otherDose) {
                                                                        doseValue = values.otherDose;
                                                                    }

                                                                    if (doseValue) {
                                                                        setFieldValue("dose", doseValue);
                                                                        if (!isEditMode) {
                                                                            moveToNextSection("dose", "route");
                                                                        }
                                                                    }
                                                                }}
                                                                disabled={
                                                                    (doseTab === "quantity" && !values.quantityAmount) ||
                                                                    (doseTab === "range" && (!values.rangeFrom || !values.rangeTo)) ||
                                                                    (doseTab === "other" && !values.otherDose)
                                                                }
                                                                className="rounded bg-customDropdownBorder px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-400"
                                                            >
                                                                {isEditMode ? "Update dose" : "Add dose"}
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    // Regular Dose UI
                                                    <>
                                                        <div className="mb-3 w-full md:w-80">
                                                            <TextField
                                                                name="dose"
                                                                value={tempDose !== undefined ? tempDose : values.dose}
                                                                placeHolder="eg: one or two tablets"
                                                                valueChange={(e) => setTempDose(e.target.value)}
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            disabled={!tempDose || tempDose.trim() === ""}
                                                            className="poppins-medium rounded bg-customDropdownBorder px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-400"
                                                            onClick={() => {
                                                                if (tempDose) {
                                                                    setFieldValue("dose", tempDose);
                                                                    moveToNextSection("dose", "route");
                                                                }
                                                            }}
                                                        >
                                                            {isEditMode ? "Update dose" : "Add dose"}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Route Section */}
                                {values.dose && unlockedSections.has("route") && (
                                    <div className="mb-4 rounded border border-gray-200">
                                        <button
                                            type="button"
                                            className="flex w-full items-center justify-between px-6 py-4 text-left focus:outline-none"
                                            onClick={() => setOpenSection(openSection === "route" ? null : "route")}
                                        >
                                            <div className="flex-1">
                                                <span className="poppins-medium text-sm text-customBlack">
                                                    Route <span className="text-red-500">*</span>
                                                </span>
                                                {(values.routeType || values.route) && openSection !== "route" && (
                                                    <div className="mt-1 text-sm text-customGrey1">
                                                        {values.routeType === "CUTANEOUS"
                                                            ? "Cutaneous"
                                                            : values.route
                                                              ? values.route
                                                                    .toLowerCase()
                                                                    .split("_")
                                                                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                                    .join(" ")
                                                              : ""}
                                                    </div>
                                                )}
                                            </div>
                                            <svg
                                                className={`ml-2 h-5 w-5 transition-transform ${openSection === "route" ? "rotate-180" : ""}`}
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
                                        {((!values.routeType && !values.route && !isEditMode) || openSection === "route") && (
                                            <div className="border-t border-gray-200 px-6 py-4">
                                                <div className="mb-4">
                                                    <StatusToggleButtonGroup
                                                        label=""
                                                        name="routeType"
                                                        value={values.routeType}
                                                        options={getRouteOptions(medication)}
                                                        onChange={(e) => {
                                                            setFieldValue("routeType", e.target.value);
                                                            if (e.target.value === "OTHERS") {
                                                                setFieldValue("route", "");
                                                            } else {
                                                                setFieldValue("route", e.target.value);
                                                                if (values.type === "PRN") {
                                                                    moveToNextSection("route", "prntimebetween");
                                                                } else {
                                                                    moveToNextSection("route", "frequency");
                                                                }
                                                            }
                                                        }}
                                                        style="textSize"
                                                    />
                                                </div>

                                                {values.routeType === "OTHERS" && !values.route && (
                                                    <div className="mb-4">
                                                        <select
                                                            name="route"
                                                            className="poppins-medium w-full rounded border px-3 py-2 text-sm text-customBlack"
                                                            value={values.route}
                                                            onChange={(e) => {
                                                                setFieldValue("route", e.target.value);
                                                                if (isEditMode) {
                                                                    setFieldValue("routeType", e.target.value);
                                                                    setOpenSection(null);
                                                                }
                                                                if (!isEditMode) {
                                                                    if (values.type === "PRN") {
                                                                        moveToNextSection("route", "prntimebetween");
                                                                    } else {
                                                                        moveToNextSection("route", "frequency");
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            <option value="">Select a route</option>
                                                            {ROUTE_OPTIONS?.map((opt) => (
                                                                <option
                                                                    key={opt.value}
                                                                    value={opt.value}
                                                                >
                                                                    {opt.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Render PRN Sections or Regular Medication Sections */}
                                {values.type === "PRN" ? (
                                    <PRNSections
                                        values={values}
                                        setFieldValue={setFieldValue}
                                        unlockedSections={unlockedSections}
                                        openSection={openSection}
                                        setOpenSection={setOpenSection}
                                        moveToNextSection={moveToNextSection}
                                        isSubmitting={isSubmitting}
                                        isEditMode={isEditMode}
                                    />
                                ) : (
                                    <RegularMedicationSections
                                        values={values}
                                        setFieldValue={setFieldValue}
                                        unlockedSections={unlockedSections}
                                        openSection={openSection}
                                        setOpenSection={setOpenSection}
                                        moveToNextSection={moveToNextSection}
                                        isSubmitting={isSubmitting}
                                        displayValue={displayValue}
                                        isEditMode={isEditMode}
                                    />
                                )}
                            </Form>
                        </>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default AddMedicationForm;
