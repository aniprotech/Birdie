import PropTypes from "prop-types";
import { X } from "lucide-react";
import { Formik, Form } from "formik";
import TextAreaField from "../../../../../components/TextInput/TextAreaField";
import FrequencySelector from "../../../../../components/TextInput/FrequencySelector";
import DateTimeRangeSelector from "../../../../../components/DateRange/DateTimeRangeSelector";
import { clientsCarePlanValidationSchema } from "../../../../../utils/validations/clients/clientsCarePlanValidation";
import { _post, _put } from "../../../../../utils/ApiService";
import APIConfig from "../../../../../utils/ApiConfig";
import { showSuccess, showError } from "../../../../../utils/toaster";
import { getAssessmentNameFromRoute } from "./initialAssessmentApiEndpoint/initialAssessmentAPI";
import { capitalizeFirstLetter } from "../../../../../utils/common";

const TaskEditModal = ({
    isEdit,
    setIsEdit,
    isOpen,
    onClose,
    task,
    taskData,
    onSave,
    fetchDataBasedOnClientId,
    title,
    userId,
    assessmentType,
    dataId
}) => {
    const isStartDateLocked = !!task?.startDate;

    const sessions = ["NIGHT", "MORNING", "LUNCH", "AFTERNOON", "EVENING"];

    const initialValues = {
        title: taskData?.title || "",
        details: taskData?.details || "",
        startDate: taskData?.startDate || new Date().toISOString().split("T")[0],
        endDate: taskData?.endDate || "",
        isEnds: !!taskData?.endDate,
        isEssential: taskData?.isEssential || false,
        timeType: taskData?.isAnyTime === false ? "sessions" : "anytime",
        schedule: {
            frequency: taskData?.frequency || "DAILY",
            repeatEvery: taskData?.repeatEvery || 1,
            repeatUnit: taskData?.repeatUnit || "DAYS",
            selectedDays: taskData?.selectedDays || [],
            selectedSessions: taskData?.sessions || [],
        },
    };

    const handleSubmit = async (values) => {
        const idField = getAssessmentNameFromRoute(assessmentType);

        const payload = {
            taskId: task?.id || taskData?.taskId,
            userId,
            [idField]: dataId,
            details: values.details,
            isEssential: values.isEssential,
            isAnyTime: values.timeType === "anytime",
            sessions: values.timeType === "sessions" ? values.schedule.selectedSessions : [],
            frequency: values.schedule.frequency,
            selectedDays: values.schedule.selectedDays,
            repeatEvery: values.schedule.repeatEvery,
            repeatUnit: values.schedule.repeatUnit,
            startDate: values.startDate,
            endDate: values.isEnds ? values.endDate : "",
        };

        try {
            const response = isEdit
                ? await _put(APIConfig.CLIENT_TASK_PLAN.UPDATE(taskData?.id), payload)
                : await _post(APIConfig.CLIENT_TASK_PLAN.CREATE, payload);

            if (response?.data?.error) {
                showError(response.data.message);
            } else {
                showSuccess(response.data.message);
                fetchDataBasedOnClientId();
                onSave(payload);
                setIsEdit(false);
                onClose();
            }
        } catch (error) {
            showError(error?.response?.data?.error || "Something went wrong");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative flex max-h-[80vh] w-full max-w-2xl flex-col overflow-y-auto rounded-md bg-white">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
                    <h2 className="text-base font-semibold text-customBlack">
                        {isEdit ? "Edit task" : "Schedule task"}
                    </h2>
                    <button onClick={onClose} className="text-customGrey1 hover:text-customBlack">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <Formik
                    initialValues={initialValues}
                    validationSchema={clientsCarePlanValidationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({ values, setFieldValue, errors, touched }) => {
                        const isEndDateInvalid =
                            values?.isEnds &&
                            values?.endDate &&
                            values?.startDate &&
                            new Date(values.endDate) < new Date(values.startDate);

                        return (
                            <Form className="flex flex-col flex-1">
                                <div className="flex-1 overflow-y-auto px-6 py-6">
                                    <p className="mb-4 text-xl font-semibold text-customBlack">{title}</p>

                                    {/* Details */}
                                    <div>
                                        <label className="block text-sm font-semibold text-customBlack">
                                            Add details <span className="text-xs text-gray-400">(optional)</span>
                                        </label>
                                        <p className="mt-1 text-sm text-customBlack1">
                                            The carer will see this note in the app each time they complete this task.
                                        </p>
                                        <TextAreaField
                                            name="details"
                                            value={values.details}
                                            valueChange={(e) => setFieldValue("details", e.target.value)}
                                            placeholder="e.g. Client needs support with getting dressed in the morning."
                                            rows={5}
                                            style="mt"
                                        />
                                    </div>

                                    {/* Essential Checkbox */}
                                    <div className="my-3 flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="essential"
                                            checked={values.isEssential}
                                            onChange={(e) => setFieldValue("isEssential", e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-customDropdownBorder focus:ring-customDropdownBorder"
                                        />
                                        <div>
                                            <label htmlFor="essential" className="text-sm font-semibold text-customBlack">
                                                Mark as essential
                                            </label>
                                            <p className="text-sm text-customBlack1">
                                                Raise alert and receive an outcome if task is not completed.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Frequency Selector */}
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

                                    {/* Time Type Selection */}
                                    <div className="mt-5">
                                        <label className="mb-2 block text-sm font-medium text-customBlack">
                                            Select time<span className="text-red-500">*</span>
                                        </label>
                                        <div className="space-y-4">
                                            {["anytime", "sessions"].map((type) => (
                                                <label key={type} className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        checked={values.timeType === type}
                                                        onChange={() => {
                                                            setFieldValue("timeType", type);
                                                            if (type === "anytime")
                                                                setFieldValue("schedule.selectedSessions", []);
                                                        }}
                                                        className="h-4 w-4 text-customDropdownBorder accent-customDropdownBorder focus:ring-customDropdownBorder"
                                                    />
                                                    <span className="text-sm capitalize">{type}</span>
                                                </label>
                                            ))}

                                            {values.timeType === "sessions" && (
                                                <div className="flex flex-wrap w-max overflow-x-auto rounded-md border border-gray-300">
                                                    {sessions.map((session) => (
                                                        <button
                                                            key={session}
                                                            type="button"
                                                            onClick={() => {
                                                                const current = values.schedule.selectedSessions;
                                                                const updated = current.includes(session)
                                                                    ? current.filter((s) => s !== session)
                                                                    : [...current, session];
                                                                setFieldValue("schedule.selectedSessions", updated);
                                                            }}
                                                            className={`border-r px-4 py-2 text-sm last:border-r-0 ${
                                                                values.schedule.selectedSessions.includes(session)
                                                                    ? "poppins-medium bg-customDropdown text-customDropdownBorder"
                                                                    : "bg-white text-customTextGrey"
                                                            }`}
                                                        >
                                                            {capitalizeFirstLetter(session)}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {touched.schedule?.selectedSessions && errors.schedule?.selectedSessions && (
                                                <p className="text-sm text-red-500">{errors.schedule.selectedSessions}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* DateTime Selector */}
                                    <DateTimeRangeSelector
                                        values={values}
                                        handleChange={(e) => setFieldValue(e.target.name, e.target.value)}
                                        onDateChange={(date, type = "start") =>
                                            setFieldValue(type === "start" ? "startDate" : "endDate", date)
                                        }
                                        endType={values.isEnds}
                                        onEndTypeChange={(val) => setFieldValue("isEnds", val)}
                                        isEndDateInvalid={isEndDateInvalid}
                                    />
                                    {isStartDateLocked && (
                                        <p className="text-sm text-customGrey1">
                                            Start date cannot be amended as the task schedule has already started
                                        </p>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="sticky bottom-0 z-10 flex justify-end gap-3 border-t bg-white px-6 py-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="rounded-md border border-customDropdownBorder px-4 py-2 text-sm text-customDropdownBorder hover:bg-customDropdown"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isEndDateInvalid}
                                        className="rounded-md bg-customDropdownBorder px-4 py-2 text-sm text-white hover:bg-customDropdownBorder/90 disabled:bg-gray-300"
                                    >
                                        Save changes
                                    </button>
                                </div>
                            </Form>
                        );
                    }}
                </Formik>
            </div>
        </div>
    );
};

TaskEditModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    task: PropTypes.object,
    taskData: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    title: PropTypes.string,
    userId: PropTypes.string.isRequired,
    dataId: PropTypes.string.isRequired,
    assessmentType: PropTypes.string.isRequired,
    isEdit: PropTypes.bool.isRequired,
    setIsEdit: PropTypes.func.isRequired,
    fetchDataBasedOnClientId: PropTypes.func.isRequired,
};

export default TaskEditModal;
