import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import clsx from "clsx";
import { teamsRolesStatusValidationSchema } from "../../../../../utils/validationSchema";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import StatusToggleButtonGroup from "../../../../../components/TextInput/StatusToggleButtonGroup";
import { adminStatusForTeams, statusForTeams } from "../../../../../constants";
import useScrollToTop from "../../../../../hooks/useScrollToTop";
import InnerLoader from "../../../../../components/Loader/InnerLoader";
import { showSuccess } from "../../../../../utils/toaster";
import { fetchData } from "../../../../../utils/FetchData";
import APIConfig from "../../../../../utils/ApiConfig";
import { _put } from "../../../../../utils/ApiService";

const EditRolesAndStatus = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const paramsData = location?.state?.data;
    const shouldTransform = true;
    const [loading, setLoading] = useState(false);

    const initialIsActive = paramsData?.isActive === "" ? false : paramsData?.isActive || false;
    const formik = useFormik({
        initialValues: {
            isActive: initialIsActive,
            role: paramsData?.role || null,
        },
        // validationSchema: teamsRolesStatusValidationSchema,
        onSubmit: async (values) => {

            const finalPayload = {
                ...paramsData,
                ...values,
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
                        Roles & Status
                    </div>
                </div>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-7 px-6 pb-32 pt-8 lg:space-y-12">
                <StatusToggleButtonGroup
                    label="Status"
                    name="isActive"
                    value={values?.isActive}
                    onChange={handleChange}
                    options={statusForTeams}
                    // error={errors.status}
                />

                {/* Admin Button Group */}
                <StatusToggleButtonGroup
                    label="Admin"
                    name="role"
                    value={values?.role}
                    onChange={handleChange}
                    options={adminStatusForTeams}
                    // error={errors.role}
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

export default EditRolesAndStatus;
