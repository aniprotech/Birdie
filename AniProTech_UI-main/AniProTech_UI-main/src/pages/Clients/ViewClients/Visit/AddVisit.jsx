import { useRef, useState } from "react";
import { MessageCircleQuestion, X } from "lucide-react";
import { Formik } from "formik";
import { useLocation } from "react-router-dom";
import { format } from "date-fns";
import * as Yup from "yup";

import TimeRangeField from "../../../../components/DateRange/TimeRangeField";
import DateTimeRangeSelector from "../../../../components/DateRange/DateTimeRangeSelector";
import useDisableScroll from "../../../../hooks/useDisableScroll";
import FrequencySelector from "../../../../components/TextInput/FrequencySelector";
import { useNavigationHelpers } from "../../../../hooks/useNavigationHelpers";
import { _post } from "../../../../utils/ApiService";
import APIConfig from "../../../../utils/ApiConfig";
import { fetchData } from "../../../../utils/FetchData";
import { showSuccess } from "../../../../utils/toaster";
import DropdownField from "../../../../components/DropdownInput/Dropdown";

const visitValidationSchema = Yup.object().shape({
    schedule: Yup.object().shape({
        frequency: Yup.string().required("Frequency is required"),
        repeatEvery: Yup.number().when("frequency", {
            is: "CUSTOM",
            then: Yup.number().required("Repeat every is required").min(1, "Must be at least 1"),
        }),
        repeatUnit: Yup.string().when("frequency", {
            is: "CUSTOM",
            then: Yup.string().required("Repeat unit is required"),
        }),
        selectedDays: Yup.array().when("frequency", {
            is: (frequency) => frequency === "WEEKLY" || frequency === "CUSTOM",
            then: Yup.array().min(1, "Please select at least one day"),
        }),
    }),
    startDate: Yup.string().required("Start date is required"),
    endDate: Yup.string().when("isEnds", {
        is: true,
        then: Yup.string().required("End date is required"),
    }),
    startTime: Yup.string().required("Start time is required"),
    endTime: Yup.string().required("End time is required"),
    carersRequired: Yup.number().required("Number of carers is required").min(1, "At least 1 carer is required"),
    funding: Yup.string().required("Funding source is required"),
});

const fundingOptions = [
    { value: "local-authority", label: "Local Authority" },
    { value: "private", label: "Private" },
    { value: "insurance", label: "Insurance" },
    { value: "nhs", label: "NHS" },
    { value: "other", label: "Other" },
];

const carerOptions = Array.from({ length: 5 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} ${i + 1 === 1 ? "Carer" : "Carers"}`,
}));

const AddVisit = ({ onClose }) => {
    const popupRef = useRef(null);
    useDisableScroll();

    const { navigate, id } = useNavigationHelpers();
    const [loading, setLoading] = useState(false);
    const [internalError, setInternalError] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [checked, setChecked] = useState(false);
    const location = useLocation();
    const paramsData = location?.state?.data;

    const today = new Date();

    const initialValues = {
        schedule: {
            frequency: paramsData?.frequency || "DAILY",
            repeatEvery: paramsData?.repeatEvery || 1,
            repeatUnit: paramsData?.repeatUnit || "WEEKS",
            selectedDays: paramsData?.selectedDays || [],
        },
        startDate: paramsData?.startDate || format(today, "yyyy-MM-dd"),
        endDate: paramsData?.endDate || format(today, "yyyy-MM-dd"),
        startTime: paramsData?.startTime || "09:00:00",
        endTime: paramsData?.endTime || "09:30:00",
        isEnds: paramsData?.isEnds || false,
        carersRequired: paramsData?.carersRequired || 1,
        funding: paramsData?.funding || "",
    };

    const handleSubmit = async (values) => {
        const {
            schedule: { frequency, repeatEvery, repeatUnit, selectedDays },
            startDate,
            endDate,
            startTime,
            endTime,
            isEnds,
            carersRequired,
            funding,
        } = values;

        const finalPayload = {
            frequency,
            startDate,
            endDate: isEnds ? endDate : null,
            startTime,
            endTime,
            isEnds,
            carersRequired,
            funding,
        };

        if (frequency === "CUSTOM") {
            finalPayload.repeatEvery = repeatEvery;
            finalPayload.repeatUnit = repeatUnit;
        }

        if (frequency === "WEEKLY" || frequency === "CUSTOM") {
            finalPayload.selectedDays = selectedDays;
        }

        const response = await fetchData(
            (data) => _post(APIConfig?.CLIENTS?.CLIENT_VISIT_CREATE(id), data),
            null,
            setLoading,
            null,
            finalPayload,
            false,
        );

        if (response?.data?.error === false) {
            onClose();
            navigate(`/admin/clients/${id}/visits`);
            showSuccess(response?.data?.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="relative flex max-h-[80vh] w-full max-w-2xl flex-col overflow-y-auto rounded bg-white shadow-lg">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
                    <h2 className="text-lg font-semibold">Add Visit</h2>
                    <X
                        className="cursor-pointer"
                        onClick={() => {
                            onClose();
                            navigate(`/admin/clients/${id}/visits`);
                        }}
                    />
                </div>

                <Formik
                    initialValues={initialValues}
                    validationSchema={visitValidationSchema}
                    onSubmit={handleSubmit}
                    validateOnChange
                    validateOnBlur
                >
                    {({ values, setFieldValue, handleSubmit, errors }) => {
                        const isEndDateInvalid =
                            values?.isEnds && values?.endDate && values?.startDate && new Date(values?.endDate) < new Date(values?.startDate);

                        return (
                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-1 flex-col"
                            >
                                <div
                                    className="flex-1 space-y-6 overflow-y-auto p-6"
                                    ref={popupRef}
                                >
                                    <FrequencySelector
                                        value={values.schedule}
                                        values={values}
                                        onChange={(val) =>
                                            setFieldValue("schedule", {
                                                ...values.schedule,
                                                ...val,
                                            })
                                        }
                                        error={errors?.schedule?.selectedDays}
                                    />

                                    <TimeRangeField
                                        label="Visit time"
                                        startTime={values.startTime}
                                        endTime={values.endTime}
                                        onStartTimeChange={(val) => setFieldValue("startTime", val)}
                                        onEndTimeChange={(val) => setFieldValue("endTime", val)}
                                        required
                                        internalError={internalError}
                                        setInternalError={setInternalError}
                                    />

                                    <DateTimeRangeSelector
                                        values={values}
                                        handleChange={(e) => setFieldValue(e.target.name, e.target.value)}
                                        onDateChange={(date, type = "start") => setFieldValue(type === "start" ? "startDate" : "endDate", date)}
                                        endType={values.isEnds}
                                        onEndTypeChange={(val) => setFieldValue("isEnds", val)}
                                        isEndDateInvalid={isEndDateInvalid}
                                    />

                                    <DropdownField
                                        label="Carers required"
                                        name="carersRequired"
                                        value={values.carersRequired}
                                        options={carerOptions}
                                        valueChange={(val) => setFieldValue("carersRequired", val)}
                                        required
                                        error={errors.carersRequired}
                                    />

                                    <DropdownField
                                        label="Funding"
                                        name="funding"
                                        value={values.funding}
                                        options={fundingOptions}
                                        valueChange={(val) => setFieldValue("funding", val)}
                                        required
                                        error={errors.funding}
                                    />

                                    <div className="relative flex items-center gap-2">
                                        {/* Checkbox */}
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => setChecked(!checked)}
                                            className="h-4 w-4 rounded border-gray-300 accent-customDropdownBorder"
                                        />

                                        {/* Label + Info */}
                                        <label className="flex items-center gap-1.5 text-sm text-customGrey1 poppins-medium">
                                            Override rate cards for this schedule
                                            {/* Info Icon with Tooltip */}
                                            <div
                                                className="relative"
                                                onMouseEnter={() => setShowTooltip(true)}
                                                onMouseLeave={() => setShowTooltip(false)}
                                            >
                                                <MessageCircleQuestion className="h-4 w-4 cursor-pointer text-gray-500" />
                                                {showTooltip && (
                                                    <div className="absolute left-5 top-1/2 z-50 w-80 -translate-y-1/2 rounded-md bg-customBlack1 px-3 py-2 text-xs text-white shadow-lg">
                                                        This allows you to override how much carers are paid or payers are charged for visits
                                                        belonging to this schedule.
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="sticky bottom-0 flex justify-end border-t bg-white px-6 py-4">
                                    <button
                                        type="submit"
                                        className="rounded bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-opacity-70"
                                        disabled={loading || isEndDateInvalid || internalError}
                                    >
                                        {loading ? "Submitting..." : "Submit"}
                                    </button>
                                </div>
                            </form>
                        );
                    }}
                </Formik>
            </div>
        </div>
    );
};

export default AddVisit;
