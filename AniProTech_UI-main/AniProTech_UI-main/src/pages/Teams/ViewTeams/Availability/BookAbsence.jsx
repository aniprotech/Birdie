import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import TextAreaField from "../../../../components/TextInput/TextAreaField";
import DropdownField from "../../../../components/DropdownInput/Dropdown";
import DateField from "../../../../components/DateField/DateField";
import { ChevronLeft } from "lucide-react";
import { fetchData } from "../../../../utils/FetchData";
import { useNavigationHelpers } from "../../../../hooks/useNavigationHelpers";
import APIConfig from "../../../../utils/ApiConfig";
import { showSuccess } from "../../../../utils/toaster";
import { leaveOptions } from "../../../../data/teams/availabilityData";
import { _post } from "../../../../utils/ApiService";
import { addDays, format } from "date-fns";
import { isNotEmpty } from "../../../../utils/common";

const BookAbsence = () => {
    const { navigate, id } = useNavigationHelpers();
    const location = useLocation();
    const paramsData = location?.state;
    const [loading, setLoading] = useState(false);
    const isReadOnly = isNotEmpty(paramsData);

    const today = new Date();
    const tomorrow = addDays(today, 1);

    const initialValues = {
        startDate: paramsData?.startDate || format(tomorrow, "yyyy-MM-dd"),
        startTime: paramsData?.startTime || "00:00",
        endDate: paramsData?.endDate || format(tomorrow, "yyyy-MM-dd"),
        endTime: paramsData?.endTime || "23:59",
        type: paramsData?.type || "ANNUAL_LEAVE",
        reason: paramsData?.reason || "",
    };

    const handleSubmit = async (values) => {
        const payload = {
            startDate: values.startDate,
            startTime: values.startTime + ":00",
            endDate: values.endDate,
            endTime: values.endTime + ":00",
            reason: values.reason,
            type: values.type,
        };

        const response = await fetchData(
            (data) => _post(APIConfig.TEAMS.TEAM_AVAILABILITY_BOOKING_CREATE(id), data),
            null,
            setLoading,
            null,
            payload,
            false,
        );

        if (response?.data?.error === false) {
            showSuccess(response?.data?.message);
            navigate(-1);
        }
    };

    return (
        <div className="mx-auto max-w-4xl p-2 py-10 md:px-6">
            <button
                className="mb-6 flex items-center gap-1 rounded border border-customNavy py-1 pl-1 pr-2.5 text-sm font-semibold text-customTextNavy hover:bg-customCarerFeedBg"
                onClick={() => navigate(-1)}
            >
                <ChevronLeft size={18} /> Back
            </button>

            <h2 className="mb-6 text-2xl font-semibold">Booking details</h2>

            <div className="space-y-6 border-t pt-6">
                <Formik
                    initialValues={initialValues}
                    // validationSchema={bookingAbsenceValidationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, handleChange, setFieldValue }) => (
                        <Form className="space-y-7">
                            <div className="flex flex-col gap-4 lg:flex-row">
                                <div className="flex flex-wrap items-center justify-center gap-4 md:flex-nowrap">
                                    <div className="flex-1">
                                        <DateField
                                            name="startDate"
                                            label="Starting Date"
                                            value={values?.startDate}
                                            onChange={handleChange}
                                            required
                                            access={true}
                                            style={"mt"}
                                            disable={isReadOnly}
                                        />
                                    </div>
                                    <div className="w-full">
                                        <Field name="startTime">
                                            {({ field }) => (
                                                <input
                                                    {...field}
                                                    type="time"
                                                    className="h-[46px] w-full rounded border border-gray-300 p-3 text-sm md:mt-[11px]"
                                                    disabled={isReadOnly}
                                                />
                                            )}
                                        </Field>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-4 md:flex-nowrap">
                                    <div className="flex-1">
                                        <DateField
                                            name="endDate"
                                            label="Ending Date"
                                            value={values?.endDate}
                                            onChange={handleChange}
                                            required
                                            access={true}
                                            style={"mt"}
                                            disable={isReadOnly}
                                        />
                                    </div>
                                    <div className="w-full">
                                        <Field name="endTime">
                                            {({ field }) => (
                                                <input
                                                    {...field}
                                                    type="time"
                                                    className="h-[46px] w-full rounded border border-gray-300 p-3 text-sm md:mt-[11px]"
                                                    disabled={isReadOnly}
                                                />
                                            )}
                                        </Field>
                                    </div>
                                </div>
                            </div>

                            <DropdownField
                                name="type"
                                label="Type"
                                value={values?.type}
                                valueChange={handleChange}
                                options={leaveOptions}
                                componentName="FormikValidation"
                                disable={isReadOnly}
                            />

                            <TextAreaField
                                label="Reason"
                                name="reason"
                                placeHolder="Add a reason for the time off"
                                value={values?.reason}
                                valueChange={handleChange}
                                rows={7}
                                disable={isReadOnly}
                            />

                            {!isReadOnly && (
                                <div className="text-right">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="rounded bg-customDropdownBorder px-5 py-2.5 text-sm font-medium text-white"
                                    >
                                        {loading ? "Updating..." : "Book and unallocate visits"}
                                    </button>
                                </div>
                            )}
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default BookAbsence;
