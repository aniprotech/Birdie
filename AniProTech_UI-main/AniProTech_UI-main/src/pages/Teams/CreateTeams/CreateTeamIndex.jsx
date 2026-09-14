import React, { useMemo, useState } from "react";
import { Formik, Form } from "formik";
import { teamsValidationSchema } from "../../../utils/validationSchema";
import TeamPersonalDetails from "./TeamPersonalDetails";
import { teamsInitialValues } from "../../../data/teams";
import { _post } from "../../../utils/ApiService";
import APIConfig from "../../../utils/ApiConfig";
import { showError, showSuccess } from "../../../utils/toaster";
import InnerLoader from "../../../components/Loader/InnerLoader";
import { useNavigate } from "react-router-dom";

const CreateTeamIndex = () => {
    const [mode, setMode] = useState("create");
    const [data, setData] = useState([]);
    const [activeComponent, setActiveComponent] = useState("TeamPersonalDetails");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const initialValues = useMemo(() => teamsInitialValues(data), [data]);

    const handleCreateTeam = async (values) => {
        setLoading(true);
        try {
            const response = await _post(APIConfig?.USERS?.CREATE, values);
            if(response?.data?.error === false){
                navigate("/admin/teams")
            }
            setLoading(false);
            showSuccess(response?.data?.message)
        } catch (e) {
            setLoading(false);
            console.log(e?.response?.data?.message || "Network Error, please try again later.");
            showError(e?.response?.data?.message);
        }
    };

    const handleSubmit = (values) => {
        handleCreateTeam(values);
    };

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validationSchema={teamsValidationSchema}
            validateOnChange={true}
            validateOnBlur={false}
        >
            <Form>
                <div className="relative flex min-h-screen flex-col gap-8 scroll-smooth bg-customBgGrey px-4 pb-10 md:px-12 md:py-10 lg:flex-row lg:px-40 lg:py-24 xl:px-64">
                    <div className="flex-1 space-y-10 bg-customBgGrey">
                        {/* Header */}
                        <div className="sticky:py-10 relative sticky top-14 z-10 flex items-center justify-between bg-customBgGrey py-5 xl:static xl:bg-customBgGrey xl:py-0">
                            <h1 className="text-2xl poppins-semibold text-gray-900 md:text-2xl">Personal Details</h1>
                        </div>

                        {/* Form Sections */}
                        <div className="">
                            <TeamPersonalDetails
                                name="TeamPersonalDetails"
                                id="TeamPersonalDetails"
                                activeComponent={activeComponent}
                                setActiveComponent={setActiveComponent}
                                mode={mode}
                                setMode={setMode}
                                data={data}
                                setData={setData}
                            />
                        </div>

                        <div className="w-full space-y-4">
                            <p className="text-sm italic text-customTextGrey1">
                                <span className="text-red-500">*</span> Note: Please make sure the required fields are filled.
                            </p>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full max-w-60 bg-customNavy1 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-80"
                            >
                                {loading ? (
                                    <InnerLoader
                                        loading={loading}
                                        text="Submitting..."
                                    />
                                ) : (
                                    "Submit"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </Form>
        </Formik>
    );
};

export default CreateTeamIndex;
