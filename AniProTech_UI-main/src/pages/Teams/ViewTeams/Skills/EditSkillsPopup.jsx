import React, { useRef, useState } from "react";
import { Formik } from "formik";
import { X } from "lucide-react";
import DropdownField from "../../../../components/DropdownInput/Dropdown";
import ExpirySelector from "../../../../components/DateRange/ExpirySelector";
import FileUploadField from "../../../../components/FileUploads/FileUploadField";
import { skillValidationSchema } from "../../../../utils/validations/teams/operationValidation";
import { skillOptions } from "../../../../data/teams";
import { useClickOutside } from "../../../../hooks/use-click-outside";
import useDisableScroll from "../../../../hooks/useDisableScroll";
import { _postForm } from "../../../../utils/ApiService";
import APIConfig from "../../../../utils/ApiConfig";
import { showSuccess } from "../../../../utils/toaster";
import { useNavigationHelpers } from "../../../../hooks/useNavigationHelpers";
import { useLocation } from "react-router-dom";
import { fetchData } from "../../../../utils/FetchData";

const EditSkillsPopup = ({ onClose, data, setData,setMode,refetch }) => {
    const modalRef = useRef(null);
    const { navigate, id } = useNavigationHelpers();
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const paramsData = location?.state?.data || data;

    useDisableScroll();
    useClickOutside([modalRef], onClose);

    const initialValues = {
        name: paramsData?.name || "",
        endsOn: paramsData?.endsOn || null,
        endsAt: paramsData?.endsAt || false,
        skillsFile: paramsData?.skillsFilePath || null,
        filesToRemove: [],
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        const formData = new FormData();

        // Track files to remove
        const fileKeys = ["skillsFile"];
        const filesToRemove = [];
        fileKeys.forEach((fileKey) => {
            const fileValue = values[fileKey];
            if (!fileValue) {
                filesToRemove.push(fileKey);
            }
        });

        formData.append("filesToRemove", JSON.stringify(filesToRemove));

        // Merge new values with existing paramsData
        const mergedData = { ...paramsData, ...values };

        Object.keys(mergedData).forEach((key) => {
            const value = mergedData[key];
            if (value instanceof File) {
                formData.append(key, value);
            } else if (typeof value === "object" && value !== null && !(value instanceof Date)) {
                formData.append(key, JSON.stringify(value));
            } else {
                const finalValue = value === null || value === undefined ? "null" : value;
                formData.append(key, finalValue);
            }
        });

        const response = await fetchData(
            (data) => _postForm(APIConfig.TEAMS.TEAM_SKILLS_UPDATE(id), data),
            null,
            setLoading,
            null,
            formData,
            false,
        );

        if (response?.data?.error === false) {
            showSuccess(response?.data?.message || "Updated successfully");
            onClose();
            setMode("view");
            refetch();
        } else {
            console.error("API error:", response);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center rounded-lg bg-black/40">
            <div
                ref={modalRef}
                className="relative w-full max-w-lg rounded-lg bg-white shadow-md"
            >
                <Formik
                    initialValues={initialValues}
                    validationSchema={skillValidationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, errors, handleChange, handleSubmit, setFieldValue }) => (
                        <form
                            onSubmit={handleSubmit}
                            className="flex h-full flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b bg-white p-4">
                                <h2 className="poppins-medium text-lg text-customNavy">Edit</h2>
                                <button
                                    type="button"
                                    onClick={onClose}
                                >
                                    <X
                                        // onClick={() => {
                                        //     setData([]);
                                        // }}
                                        className="h-5 w-5 text-gray-500 hover:text-customTextNavy"
                                    />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="max-h-[70vh] flex-1 space-y-5 overflow-y-auto p-4">
                                <DropdownField
                                    label="Skills"
                                    name="name"
                                    value={values?.name}
                                    valueChange={handleChange}
                                    options={skillOptions}
                                    componentName="FormikValidation"
                                    error={errors.name}
                                    placeholder="skills"
                                />
                                <ExpirySelector
                                    dueDate={values?.endsOn}
                                    isNever={values?.endsAt}
                                    onNeverChange={(val) => setFieldValue("endsAt", val)}
                                    onDateChange={(date) => setFieldValue("endsOn", date)}
                                    label="End at"
                                    required
                                    // error={errors?.endsOn}
                                />

                                <FileUploadField
                                    label=""
                                    name="skillsFile"
                                    file={values?.skillsFile}
                                    setFile={(file) => setFieldValue("skillsFile", file)}
                                    accept="application/pdf,image/*"
                                    error={errors.skillsFile}
                                />
                            </div>

                            {/* Footer */}
                            <div className="sticky bottom-0 z-10 flex justify-end border-t bg-white p-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="rounded bg-customDropdownBorder px-6 py-2 text-sm font-medium text-white hover:bg-customDropdownBorder/90 disabled:cursor-not-allowed disabled:opacity-80"
                                >
                                    {loading ? "Updating..." : "Save"}
                                </button>
                            </div>
                        </form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default EditSkillsPopup;
