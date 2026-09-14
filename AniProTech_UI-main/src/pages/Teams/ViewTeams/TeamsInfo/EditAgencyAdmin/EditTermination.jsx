import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import clsx from "clsx";
import TextAreaField from "../../../../../components/TextInput/TextAreaField";
import DateField from "../../../../../components/DateField/DateField";
import CheckboxButtonGroup from "../../../../../components/TextInput/CheckboxButtonGroup";
import StatusToggleButtonGroup from "../../../../../components/TextInput/StatusToggleButtonGroup";
import { teamsTypeDismissedReasonOptions, teamsTypeOptions, teamTypeResignedReasonOptions } from "../../../../../constants/teamConstants";
import { teamsProfileEditValidationSchema } from "../../../../../utils/validationSchema";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useScrollToTop from "../../../../../hooks/useScrollToTop";
import APIConfig from "../../../../../utils/ApiConfig";
import { _put } from "../../../../../utils/ApiService";
import { fetchData } from "../../../../../utils/FetchData";
import InnerLoader from "../../../../../components/Loader/InnerLoader";
import { showSuccess } from "../../../../../utils/toaster";
import { Info } from "lucide-react";

const EditTermination = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const paramsData = location?.state?.data;
    const shouldTransform = true;
    const [loading, setLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            lastWorkingDay: paramsData?.termination?.lastWorkingDay ||null,
            type: paramsData?.termination?.type || null,
            resignedReasons: paramsData?.termination?.reason || [],
            dismissedReasons: paramsData?.termination?.reason || [],
            note: paramsData?.termination?.note || null,
        },
        // validationSchema: teamsProfileEditValidationSchema,
            onSubmit: async (values) => {
                // Create final payload
                const payload = {
                    lastWorkingDay: values?.lastWorkingDay || null,
                    type: values?.type ? values?.type : null,
                    note: values?.note ? values?.note : null,
                    reason: values?.type === "RESIGNED" ? values?.resignedReasons : values?.dismissedReasons
                };
            
                const tempPayload = {
                    termination: payload
                };
        
                // Conditionally add reason if type is not empty
                // if (values.type) {
                //     payload.reason = values.type === "RESIGNED" ? values.resignedReasons : values.dismissedReasons;
                // }

                const finalPayload = {
                    ...paramsData,
                    ...tempPayload,
                };

                const response = await fetchData(
                    (data) => _put(APIConfig?.USERS?.UPDATE(id), data),
                    null, // setData
                    setLoading, // setLoading
                    null, // setGlobalData
                    finalPayload, // payload
                    shouldTransform, // transformUpdatePayload
                );

                if (response?.data?.error === false) {
                    navigate(-1);
                    showSuccess(response?.data?.message);
                }
            },
        validateOnChange: true,
        validateOnBlur: true,
    });


    const { values, errors, handleChange, handleSubmit, setFieldValue } = formik;

    useScrollToTop();

    return (
        <form
            onSubmit={handleSubmit}
            className="relative flex min-h-screen flex-col bg-white md:px-20 xl:px-40"
        >
            {/* Sticky Tab Header */}
            <div className="sticky top-0 z-10 border-b border-gray-300 bg-white">
                <div className="container mx-auto px-6 pt-6">
                    <div
                        className={clsx(
                            "relative inline-block pb-2 text-base font-semibold text-customTextNavy",
                            "after:absolute after:inset-x-0 after:-bottom-[1px] after:h-[3px] after:bg-customTextNavy",
                        )}
                    >
                        Basic profile
                    </div>
                </div>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-7 px-6 pb-32 pt-8 lg:space-y-12">
            <div className="">
  <DateField
    name="lastWorkingDay"
    label="Last Working Day"
    value={values?.lastWorkingDay || ""}
    onChange={handleChange}
    error={errors.lastWorkingDay}
    style="textSize"
  />
  <div className="flex items-start text-base text-customTextGrey/80 mt-1">
    <Info className="mt-0.5 mr-2 w-5 h-5" />
    <span>
      If a last working date is entered or changed, availability and visits assigned after that date will be removed once submitted.
    </span>
  </div>
</div>

                <StatusToggleButtonGroup
                    label="Type"
                    name="type"
                    value={values?.type}
                    onChange={(e) => {
                        const newType = e.target.value;
                        setFieldValue("type", newType);
                        setFieldValue("resignedReasons", []);
                        setFieldValue("dismissedReasons", []);
                    }}
                    options={teamsTypeOptions}
                    error={errors.type}
                    style="textSize"
                />

                {values.type === "RESIGNED" && (
                    <CheckboxButtonGroup
                        label="Reason for Resignation"
                        name="resignedReasons"
                        value={values?.resignedReasons}
                        valueChange={handleChange}
                        error={errors.resignedReasons}
                        options={teamTypeResignedReasonOptions}
                        style="textSize"
                    />
                )}

                {values.type === "DISMISSED" && (
                    <CheckboxButtonGroup
                        label="Reason for Dismissal"
                        name="dismissedReasons"
                        value={values?.dismissedReasons}
                        valueChange={handleChange}
                        error={errors.dismissedReasons}
                        options={teamsTypeDismissedReasonOptions}
                        style="textSize"
                    />
                )}

                <TextAreaField
                    label="Note"
                    name="note"
                    placeHolder="Enter key note here..."
                    value={values?.note || ""}
                    valueChange={handleChange}
                    rows={5}
                    style="textSize"
                />
            </div>

            {/* Sticky Footer Buttons */}
            <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white py-4 md:py-7">
                <div className="container mx-auto flex justify-between px-6 py-4">
                    <button
                        onClick={() => {
                            navigate(`/admin/teams/${id}/teams-info`);
                        }}
                        type="button"
                        className="rounded border border-customNavy px-4 py-2 text-sm font-medium text-customTextNavy hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded bg-customDropdownBorder px-6 py-2 text-sm font-medium text-white hover:bg-customDropdownBorder/90 disabled:cursor-not-allowed disabled:opacity-80"
                    >
                        {loading ? (
                            <InnerLoader
                                loading={loading}
                                text="Updating..."
                            />
                        ) : (
                            "Submit"
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default EditTermination;
