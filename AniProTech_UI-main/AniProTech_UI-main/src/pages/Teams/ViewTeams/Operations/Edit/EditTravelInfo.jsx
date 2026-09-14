import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import InnerLoader from "../../../../../components/Loader/InnerLoader";
import DropdownField from "../../../../../components/DropdownInput/Dropdown";
import { operationTransportMethod } from "../../../../../data/teams/operations";
import TextAddressField from "../../../../../components/TextInput/TextAddressInput";
import { useNavigationHelpers } from "../../../../../hooks/useNavigationHelpers";
import { fetchData } from "../../../../../utils/FetchData";
import APIConfig from "../../../../../utils/ApiConfig";
import { showSuccess } from "../../../../../utils/toaster";
import { _put } from "../../../../../utils/ApiService";
import { operationTravelInfoValidationSchema } from "../../../../../utils/validations/teams/operationValidation";
import { useLocation } from "react-router-dom";

const EditTravelInfo = ({ data }) => {
    const { navigate, id } = useNavigationHelpers();
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const paramsData = location?.state?.data;

    const initialValues = {
        address: paramsData?.address || "",
        transportMethod: paramsData?.transportMethod || "BICYCLE",
    };

    const handleSubmit = async (values, { setSubmitting }) => {
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
            <Formik
                initialValues={initialValues}
                validationSchema={operationTravelInfoValidationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, errors, handleChange }) => (
                    <Form className="flex flex-1 flex-col">
                        {/* Scrollable Content */}
                        <div className="flex-1 space-y-6 overflow-auto pb-14 md:pt-5">
                            <div className="poppins-medium mb-6 text-base text-customTextColor md:text-xl">Travel Info</div>
                            <TextAddressField
                                label="Address"
                                name="address"
                                value={values?.address}
                                valueChange={handleChange}
                                required
                                error={errors?.address}
                            />

                            {values.address && (
                                <div className="flex h-64 w-full items-center justify-center rounded border bg-gray-100 text-gray-500">
                                    Map preview for: <span className="ml-2 font-medium">{values.address}</span>
                                </div>
                            )}
                            <DropdownField
                                label="Transport Method"
                                name="transportMethod"
                                value={values?.transportMethod || "BICYCLE"}
                                valueChange={handleChange}
                                options={operationTransportMethod}
                                componentName="FormikValidation"
                                required={true}
                                error={errors?.transportMethod}
                            />
                        </div>
                        {/* Sticky Footer */}
                        <div className="sticky bottom-0 left-0 right-0 border-t border-customNavy/40 bg-white px-4 py-4 md:px-6">
                            <div className="flex items-center justify-between gap-4 py-4 md:py-7">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/admin/teams/${id}/operations`)}
                                    className="text-customTextNavy rounded border border-customNavy px-4 py-2 text-sm font-medium hover:bg-gray-100"
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
                                            loading
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
    );
};

export default EditTravelInfo;
