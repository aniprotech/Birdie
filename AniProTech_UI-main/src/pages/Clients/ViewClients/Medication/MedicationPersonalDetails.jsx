import { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import TextAreaField from "../../../../components/TextInput/TextAreaField";
import TextField from "../../../../components/TextInput/TextInput";
import RadioButtonGroup from "../../../../components/TextInput/RadioButtonGroup";
import { medicationPrivacyOptions } from "../../../../constants/clientConstants";
import { useGlobalStore } from "../../../../stores/useGlobalStore";
import { useNavigationHelpers } from "../../../../hooks/useNavigationHelpers";
import { fetchData } from "../../../../utils/FetchData";
import APIConfig from "../../../../utils/ApiConfig";
import { showSuccess, showError } from "../../../../utils/toaster";
import { _get, _post, _put } from "../../../../utils/ApiService";
import InnerLoader from "../../../../components/Loader/InnerLoader";
import DotLoader from "../../../../components/Loader/DotLoader";

const MedicationPersonalDetails = ({ setIsPersonalDetails }) => {
    const { id, navigate } = useNavigationHelpers();
    const [data, setData] = useState(null);
    const [medicationId, setMedicationId] = useState(null);
    const [loading, setLoading] = useState(false);
    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : "the client";
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchExistingData = async () => {
            try {
                setIsLoading(true);
                const res = await _get(APIConfig.CLIENTS.MEDICATION_GET_BY_ID(id));
                if (res?.data?.error === false) {
                    setData(res.data?.results?.data);
                    setMedicationId(res.data?.results?.data?.id);
                }
            } catch (err) {
                console.error("Error fetching medication details", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchExistingData();
    }, [id]);


    if (isLoading) {
        return <DotLoader loading={isLoading} style="bg-white"/>;
    }

    const initialValues = {
        allergies: data?.allergies || "",
        gpsName: data?.gpsName || "",
        gpsContact: data?.gpsContact || "",
        pharmacyName: data?.pharmacyName || "",
        pharmacyAddress: data?.pharmacyAddress || "",
        pharmacyPostcode: data?.pharmacyPostcode || "",
        isMedicineSupportProvided: data?.isMedicineSupportProvided ?? false,
    };

    const handleSubmit = async (values) => {
        const payload = {
            allergies: values.allergies,
            gpsName: values.gpsName,
            gpsContact: values.gpsContact,
            pharmacyName: values.pharmacyName,
            pharmacyAddress: values.pharmacyAddress,
            pharmacyPostcode: values.pharmacyPostcode,
            isMedicineSupportProvided: values.isMedicineSupportProvided,
        };

        const isUpdate = !!data;
        const apiEndpoint = isUpdate
            ? APIConfig.CLIENTS.MEDICATION_UPDATE(medicationId)
            : APIConfig.CLIENTS.MEDICATION_CREATE(id);
    
        const response = await fetchData(
            (data) => isUpdate ? _put(apiEndpoint, data) : _post(apiEndpoint, data),
            null,
            setLoading,
            null,
            payload,
            false
        );
    
        if (response?.data?.error === false) {
            showSuccess(response?.data?.message || "Details saved successfully");
            navigate(`/admin/clients/${id}/medication`);
        } else {
            showError(response?.data?.message || "Failed to save details");
        }
    };

    return (
        <div className="min-h-screen bg-customBgLightBlue p-6 md:p-12">
            <div className="mx-auto max-w-4xl">
                <h1 className="poppins-medium mb-1 text-lg font-semibold text-customBlack md:text-xl">
                    {data ? "Edit Medical information" : "Medical information"}
                </h1>
                <p className="mb-6 text-sm text-customGrey1">View and update {clientName}&apos;s personal medical details.</p>
            </div>

            <div className="mx-auto max-w-4xl rounded-lg border border-gray-300 bg-white p-6 md:px-8 md:py-8">
                <Formik
                    enableReinitialize
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                >
                    {({ values, errors, handleChange }) => (
                        <Form className="space-y-6">
                            {/* 1. Allergies */}
                            <div className="space-y-3">
                                <h2 className="poppins-medium mb-2 border-b pb-2 text-lg font-semibold text-customBlack">1. Allergies</h2>
                                <TextAreaField
                                    name="allergies"
                                    placeHolder='Write "None known." if no allergies'
                                    value={values.allergies}
                                    valueChange={handleChange}
                                    rows={4}
                                    error={errors.allergies}
                                />
                                <p className="mt-1 text-sm text-customGrey1">
                                    If {clientName} has any allergies, you are required to add them here. If they don’t have any, please write, “None
                                    known.”
                                </p>
                            </div>

                            {/* 2. Doctor/GP */}
                            <div className="space-y-3">
                                <h2 className="poppins-medium mb-2 border-b pb-2 text-lg font-semibold text-customBlack">2. Doctor/GP</h2>
                                <TextField
                                    label="GP’s name"
                                    name="gpsName"
                                    value={values.gpsName}
                                    valueChange={handleChange}
                                    componentName="FormikValidation"
                                    error={errors.gpsName}
                                />
                                <TextField
                                    label="Contact number"
                                    name="gpsContact"
                                    value={values.gpsContact}
                                    valueChange={handleChange}
                                    componentName="FormikValidation"
                                    error={errors.gpsContact}
                                />
                            </div>

                            {/* 3. Pharmacist */}
                            <div className="space-y-3">
                                <h2 className="poppins-medium mb-2 border-b pb-2 text-lg font-semibold text-customBlack">3. Pharmacist</h2>
                                <TextField
                                    label="Pharmacy name"
                                    name="pharmacyName"
                                    value={values.pharmacyName}
                                    valueChange={handleChange}
                                    componentName="FormikValidation"
                                    error={errors.pharmacyName}
                                />
                                <TextField
                                    label="Address"
                                    name="pharmacyAddress"
                                    value={values.pharmacyAddress}
                                    valueChange={handleChange}
                                    componentName="FormikValidation"
                                    error={errors.pharmacyAddress}
                                />
                                <TextField
                                    label="Post code"
                                    name="pharmacyPostcode"
                                    value={values.pharmacyPostcode}
                                    valueChange={handleChange}
                                    componentName="FormikValidation"
                                    error={errors.pharmacyPostcode}
                                />
                            </div>

                            {/* 4. Medicine Support */}
                            <div className="space-y-3">
                                <h2 className="poppins-medium mb-2 border-b pb-2 text-lg font-semibold text-customBlack">4. Medicines support</h2>
                                <p className="mb-2 text-sm text-customBlack1">Please select from the following options below.</p>
                                <RadioButtonGroup
                                    name="isMedicineSupportProvided"
                                    value={values?.isMedicineSupportProvided}
                                    valueChange={handleChange}
                                    error={errors.isMedicineSupportProvided}
                                    options={medicationPrivacyOptions}
                                />
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    onClick={() => setIsPersonalDetails(true)}
                                    disabled={loading}
                                    className="rounded bg-customDropdownBorder px-6 py-2 text-sm font-medium text-white hover:bg-customDropdownBorder/90 disabled:cursor-not-allowed disabled:opacity-80"
                                >
                                    {loading ? (
                                        <InnerLoader
                                            loading={loading}
                                            text="Saving..."
                                        />
                                    ) : (
                                        "Save changes"
                                    )}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default MedicationPersonalDetails;
