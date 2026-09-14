import React, { useState } from "react";
import PropTypes from "prop-types";
import { useFormikContext } from "formik";
import DropdownField from "../../../components/DropdownInput/Dropdown";
import TextField from "../../../components/TextInput/TextInput";
import DateField from "../../../components/DateField/DateField";
import { clientsProfileTitleOptions, teamsPronounOptions } from "../../../constants";
import { Edit, Trash2 } from "lucide-react";

const ClientProfile = ({ id, mode }) => {
    const { values, handleChange, handleBlur, errors, touched, setFieldValue } = useFormikContext();
    const [previewImage, setPreviewImage] = useState(
        values?.profileImage ? values?.profileImage : values?.profileImagePath ? values?.profileImagePath : null,
    );

    const BASE_URL = (import.meta.env.VITE_APP_BASE_LIVE_URL || "https://backend.aniprotech.com").replace(/\/$/, "");

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Create a preview URL for the UI
            const previewUrl = URL.createObjectURL(file);
            setPreviewImage(previewUrl);
            // Store the actual file object for upload
            setFieldValue("profileImage", file);
        }
    };

    const handleDeleteImage = () => {
        setPreviewImage(null);
        setFieldValue("profileImage", null);

        // If in Edit mode, track files to remove
        if (mode === "Edit") {
            const existingFilesToRemove = values.filesToRemove || [];
            if (!existingFilesToRemove.includes("profileImage")) {
                setFieldValue("filesToRemove", [...existingFilesToRemove, "profileImage"]);
            }
        }
    };

    const handleEditImage = () => {
        document.getElementById("imageInput").click();
    };

    return (
        <div
            className="w-full scroll-m-20 rounded-xl bg-white p-5"
            id={id}
        >
            <p className="mb-6 text-lg font-semibold text-customTextGrey1 md:text-xl">Profile</p>

            {/* Profile Image Section */}
            <div className="mb-6 flex flex-col items-center justify-center rounded-md border border-dashed border-gray-300 py-8 text-center">
                {previewImage ? (
                    <>
                        <img
                            src={mode === "Edit" && previewImage && !previewImage.startsWith("blob:") ? `${BASE_URL}/${previewImage}` : previewImage}
                            alt="Profile"
                            className="h-24 w-24 rounded-full object-cover"
                        />

                        <p className="mt-2 text-xs text-customTextGrey">JPG, PNG Max size of 12mb</p>
                        <div className="mt-3 flex gap-4">
                            <button
                                onClick={handleEditImage}
                                type="button"
                                className="flex items-center gap-1 rounded-md border px-4 py-2 text-sm text-customTextGrey"
                            >
                                <Edit className="h-4 w-4" /> Update
                            </button>
                            <button
                                onClick={handleDeleteImage}
                                type="button"
                                className="flex items-center gap-1 rounded-md border px-4 py-2 text-sm text-red-500"
                            >
                                <Trash2 className="h-4 w-4" /> Delete
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={() => document.getElementById("imageInput").click()}
                            className="rounded border border-gray-400 px-4 py-2 text-sm font-medium hover:bg-gray-100"
                        >
                            Upload profile image
                        </button>
                        <p className="mt-2 text-xs text-gray-500">JPG, PNG Max size of 12mb</p>
                    </>
                )}
                <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                />
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
                <DropdownField
                    label="Title"
                    name="title"
                    options={clientsProfileTitleOptions}
                    value={values.title || ""}
                    valueChange={handleChange}
                    componentName="FormikValidation"
                    error={touched.title && errors.title}
                    required
                />

                <TextField
                    name="firstName"
                    label="First Name"
                    value={values.firstName || ""}
                    valueChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.firstName && errors.firstName}
                    required
                />

                <TextField
                    name="lastName"
                    label="Last Name"
                    value={values.lastName || ""}
                    valueChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.lastName && errors.lastName}
                    required
                />

                <TextField
                    name="preferredName"
                    label="Preferred Name"
                    value={values.preferredName || ""}
                    valueChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.preferredName && errors.preferredName}
                />

                <DropdownField
                    name="referredAs"
                    label="Referred As"
                    value={values.referredAs || "HE_HIM"}
                    valueChange={handleChange}
                    options={teamsPronounOptions}
                    componentName="FormikValidation"
                    required
                />
                <DateField
                    label="Date of Birth"
                    name="dateOfBirth"
                    value={values.dateOfBirth || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.dateOfBirth && errors.dateOfBirth}
                    required
                />
            </div>
        </div>
    );
};

ClientProfile.propTypes = {
    id: PropTypes.string.isRequired,
    mode: PropTypes.string,
};

export default ClientProfile;
