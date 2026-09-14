import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import { useLocation } from "react-router-dom";
import { onBoardingValidationSchema } from "../../../../../utils/validations/teams/operationValidation";
import InnerLoader from "../../../../../components/Loader/InnerLoader";
import EmploymentForm from "./EmploymentForm";
import RightToWorkForm from "./RightToWorkForm";
import AdditionalDocumentsForm from "./AdditionalDocumentsForm";
import { useNavigationHelpers } from "../../../../../hooks/useNavigationHelpers";
import { fetchData } from "../../../../../utils/FetchData";
import { _postForm } from "../../../../../utils/ApiService";
import APIConfig from "../../../../../utils/ApiConfig";
import { showSuccess } from "../../../../../utils/toaster";
import useScrollToTop from "../../../../../hooks/useScrollToTop";

const EditOnboarding = () => {
    const { navigate, id } = useNavigationHelpers();
    const [loading, setLoading] = useState(false);
    const [uploadedList, setUploadedList] = useState([]);
    const location = useLocation();
    const paramsData = location?.state?.data || {};
    const filesPayload = ["id_file", "driving_licence", "bank_statement", "utility_bill", "references_file", "dbs_record", "contract"];
    const [finalDocuments, setFinalDocuments] = useState([]);

    useScrollToTop();
    const initialValues = {
        // Employment Details
        started: paramsData?.started || "",
        niNumber: paramsData?.niNumber || "",
        socialWorkerNumber: paramsData?.socialWorkerNumber || "",
        employeeNumber: paramsData?.employeeNumber || "",
        role: paramsData?.role || null,
        contractType: paramsData?.contractType || null,
        weeklyContractedHours: paramsData?.weeklyContractedHours || "",
        contract: paramsData?.contractFilePath || null,
        covidVaccinationStatus: paramsData?.covidVaccinationStatus || null,

        // Right to Work
        id_file: paramsData?.idFilePath || null,
        driving_licence: paramsData?.drivingLicenceFilePath || null,
        bank_statement: paramsData?.bankStatementFilePath || null,
        utility_bill: paramsData?.utilityBillFilePath || null,
        references_file: paramsData?.referencesFilePath || null,
        dbs_record: paramsData?.dbsRecordFilePath || null,

        // Additional Documents
        additionalDocumentDescription: "",
        additionalDocumentCategory: null,
        additionalDocumentExpires: false,
        additionalDocumentExpiresOn: null,
        additionalDocumentFiles: null,
    };

    const handleSubmit = async (values) => {
        const formData = new FormData();

        // Identify empty file fields to remove
        const filesToRemove = [];
        filesPayload.forEach((fileKey) => {
            const fileValue = values[fileKey];
            if (!fileValue) {
                filesToRemove.push(fileKey);
            }
        });

        formData.append("filesToRemove", JSON.stringify(filesToRemove));

        // Keys related to uploaded documents
        const docKeys = [
            "uploadedList",
            "additionalDocumentDescription",
            "additionalDocumentCategory",
            "additionalDocumentExpires",
            "additionalDocumentExpiresOn",
            "additionalDocumentFiles",
        ];

        // Remove doc-related keys from values
        const cleanValues = Object.keys(values)
            .filter((key) => !docKeys.includes(key))
            .reduce((acc, key) => {
                acc[key] = values[key];
                return acc;
            }, {});

        // Remove doc-related keys from paramsData too
        const cleanParamsData = Object.keys(paramsData || {})
            .filter((key) => !docKeys.includes(key))
            .reduce((acc, key) => {
                acc[key] = paramsData[key];
                return acc;
            }, {});

        const mergedData = { ...cleanParamsData, ...cleanValues };

        // Add mergedData to FormData
        Object.keys(mergedData).forEach((key) => {
            const value = mergedData[key];

            if (value instanceof File) {
                formData.append(key, value);
            } else if (value instanceof Date) {
                formData.append(key, value.toISOString());
            } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
            } else {
                const finalValue = value === null || value === undefined ? "null" : value;
                formData.append(key, finalValue);
            }
        });

        // Add all documents from finalDocuments
        let docIndex = 0;

        finalDocuments.forEach((doc) => {
            formData.append(`additionalDocumentDescription[${docIndex}]`, doc.additionalDocumentDescription || "");
            formData.append(`additionalDocumentCategory[${docIndex}]`, doc.additionalDocumentCategory || "");
            formData.append(`additionalDocumentExpires[${docIndex}]`, doc.additionalDocumentExpires || false);
            formData.append(`additionalDocumentExpiresOn[${docIndex}]`, doc.additionalDocumentExpiresOn || "");

            // If file is a File object (newly uploaded), append file
            if (doc.additionalDocumentFiles instanceof File) {
                formData.append(`additionalDocumentFiles[${docIndex}]`, doc.additionalDocumentFiles);
            } else {
                // If from API (already uploaded), send existing file path and doc ID
                formData.append(`additionalDocumentFiles[${docIndex}]`, doc.additionalDocumentFilePath || "");
                formData.append(`additionalDocumentId[${docIndex}]`, doc.id || "");
            }

            docIndex++;
        });

        // Send to API
        const response = await fetchData(
            (data) => _postForm(APIConfig?.TEAMS?.TEAM_ONBOARDING_UPDATE(id), data),
            null,
            setLoading,
            null,
            formData,
            false,
        );

        if (response?.data?.error === false) {
            navigate(-1);
            showSuccess(response?.data?.message);
        } else {
            console.error("API error:", response || "Unknown error");
        }
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={onBoardingValidationSchema}
            onSubmit={handleSubmit}
        >
            {({ values, handleChange, errors, setFieldValue }) => {

                return (
                    <Form>
                        <div className="space-y-6 bg-white p-4 md:px-20 md:py-10 lg:px-32 xl:px-80">
                            <EmploymentForm
                                values={values}
                                handleChange={handleChange}
                                setFieldValue={setFieldValue}
                                errors={errors}
                            />
                            <div className="py-5">
                                <hr className="border-t border-gray-300" />
                            </div>
                            <RightToWorkForm
                                values={values}
                                handleChange={handleChange}
                                setFieldValue={setFieldValue}
                                errors={errors}
                            />
                            <div className="py-5">
                                <hr className="border-t border-gray-300" />
                            </div>
                            <AdditionalDocumentsForm
                                values={values}
                                handleChange={handleChange}
                                setFieldValue={setFieldValue}
                                errors={errors}
                                uploadedList={uploadedList}
                                setUploadedList={setUploadedList}
                                paramsData={paramsData}
                                setFinalDocuments={setFinalDocuments}
                                finalDocuments={finalDocuments}
                            />
                        </div>

                        {/* Sticky Footer */}
                        <div className="sticky bottom-0 left-0 right-0 bg-white p-4 md:px-20 lg:px-32 xl:px-80">
                            <div className="flex items-center justify-between gap-4 border-t border-customNavy/40 py-4">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/admin/teams/${id}/onboarding`)}
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
                );
            }}
        </Formik>
    );
};

export default EditOnboarding;
