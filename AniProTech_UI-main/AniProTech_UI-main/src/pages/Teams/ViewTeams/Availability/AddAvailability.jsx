import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Formik } from "formik";
import { useLocation } from "react-router-dom";
import { format } from "date-fns";

import TimeRangeField from "../../../../components/DateRange/TimeRangeField";
import DateTimeRangeSelector from "../../../../components/DateRange/DateTimeRangeSelector";
import useDisableScroll from "../../../../hooks/useDisableScroll";
import FrequencySelector from "../../../../components/TextInput/FrequencySelector";
import { availabilityValidationSchema } from "../../../../utils/validations/teams/operationValidation";
import { useNavigationHelpers } from "../../../../hooks/useNavigationHelpers";
import { _post } from "../../../../utils/ApiService";
import APIConfig from "../../../../utils/ApiConfig";
import { fetchData } from "../../../../utils/FetchData";
import { showSuccess } from "../../../../utils/toaster";

const AddAvailability = ({ onClose }) => {
    const popupRef = useRef(null);
    useDisableScroll();

    const { navigate, id } = useNavigationHelpers();
    const [loading, setLoading] = useState(false);
    const [internalError, setInternalError] = useState(null);

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
    };

    const handleSubmit = async (values) => {
        const {
            schedule: { frequency, repeatEvery, repeatUnit, selectedDays },
            startDate,
            endDate,
            startTime,
            endTime,
            isEnds,
        } = values;

        const finalPayload = {
            frequency,
            startDate,
            endDate: isEnds ? endDate : null,
            startTime,
            endTime,
            isEnds,
        };

        // Add repeatEvery and repeatUnit if frequency is CUSTOM
        if (frequency === "CUSTOM") {
            finalPayload.repeatEvery = repeatEvery;
            finalPayload.repeatUnit = repeatUnit;
        }

        // Add selectedDays only if frequency is WEEKLY
        if (frequency === "WEEKLY" || frequency === "CUSTOM") {
            finalPayload.selectedDays = selectedDays;
        }

        const response = await fetchData(
            (data) => _post(APIConfig?.TEAMS?.TEAM_AVAILABILITY_CREATE(id), data),
            null,
            setLoading,
            null,
            finalPayload,
            false,
        );

        if (response?.data?.error === false) {
            onClose();
            navigate(`/admin/teams/${id}/availability`);
            showSuccess(response?.data?.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="relative flex max-h-[80vh] w-full max-w-2xl flex-col overflow-y-auto rounded bg-white shadow-lg z-50">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
                    <h2 className="text-lg font-semibold">Create Availability Schedule</h2>
                    <X
                        className="cursor-pointer"
                        onClick={() => {
                            onClose();
                            navigate(`/admin/teams/${id}/availability`);
                        }}
                    />
                </div>

                <Formik
                    initialValues={initialValues}
                    validationSchema={availabilityValidationSchema}
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
                                        label="Select time"
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
                                </div>

                                <div className="sticky bottom-0 flex justify-end border-t bg-white px-6 py-4">
                                    <button
                                        type="submit"
                                        className="rounded bg-customDropdownBorder px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-opacity-70"
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

export default AddAvailability;
