import React, { useState } from "react";
import InnerLoader from "../../../../../components/Loader/InnerLoader";
import DropdownField from "../../../../../components/DropdownInput/Dropdown";
import { Formik, Form } from "formik";
import { useNavigationHelpers } from "../../../../../hooks/useNavigationHelpers";
import { operationRateInfoValidationSchema } from "../../../../../utils/validations/teams/operationValidation";
import { fetchData } from "../../../../../utils/FetchData";
import { _put } from "../../../../../utils/ApiService";
import APIConfig from "../../../../../utils/ApiConfig";
import { showSuccess } from "../../../../../utils/toaster";
import { teamsOperationRateCardOptions } from "../../../../../constants/teamConstants";
import { useLocation } from "react-router-dom";

const EditRates = () => {
    const { navigate, id } = useNavigationHelpers();
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const paramsData = location?.state?.data;

    const initialValues = {
        rateCard: paramsData?.rateCard || "",
        travelRateCard: paramsData?.travelRateCard || "",
    };

    const handleSubmit = async (values) => {
        const finalPayload = {
            ...paramsData,
            ...values,
        };
        const response = await fetchData(
            (data) => _put(APIConfig?.TEAMS?.TEAM_OPERATION_UPDATE(id), data),
            null, // setData
            setLoading, // setLoading
            null, // setGlobalData
            finalPayload, // payload
            false, // transformUpdatePayload
        );

        if (response?.data?.error === false) {
            navigate(-1);
            showSuccess(response?.data?.message);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-white px-2 pt-5 md:px-20 md:pt-14 lg:px-40 xl:px-60">
            <div className="flex-1 overflow-auto">
                <div className="mb-6 flex items-center justify-between text-base md:text-xl">
                    <h2 className="poppins-medium text-customTextColor">Rates</h2>
                </div>

                <Formik
                    initialValues={initialValues}
                    // validationSchema={operationRateInfoValidationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, errors, setFieldValue, handleChange }) => (
                        <Form className="space-y-5 md:pt-5">
                            <DropdownField
                                label="Rate Card"
                                name="rateCard"
                                options={teamsOperationRateCardOptions}
                                value={values?.rateCard}
                                valueChange={handleChange}
                                // error={errors?.rateCard}
                                componentName="FormikValidation"
                                style="textSize"
                            />
                            <DropdownField
                                label="Travel Rate Card"
                                name="travelRateCard"
                                options={teamsOperationRateCardOptions}
                                value={values?.travelRateCard}
                                valueChange={handleChange}
                                // error={errors?.travelRateCard}
                                componentName="FormikValidation"
                                style="textSize"
                            />

                            {/* Sticky Button Footer */}
                            <div className="sticky bottom-0 border-t border-customNavy/40 bg-white px-4 py-4 md:px-6">
                                <div className="flex items-center justify-between gap-4 py-4 md:py-7">
                                    <button
                                        onClick={() => navigate(`/admin/teams/${id}/operations`)}
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
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default EditRates;
