import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import TextField from "../../../../components/TextInput/TextInput";
import DropdownField from "../../../../components/DropdownInput/Dropdown";
import RadioButtonGroup from "../../../../components/TextInput/RadioButtonGroup";
import PhoneNumberDropdown from "../../../../components/DropdownInput/PhoneNumberDropdown";
import { useGlobalStore } from "../../../../stores/useGlobalStore";
import { fetchData } from "../../../../utils/FetchData";
import { _get, _post, _put } from "../../../../utils/ApiService";
import APIConfig from "../../../../utils/ApiConfig";
import { showSuccess, showError } from "../../../../utils/toaster";

const CreateCareCircle = () => {
    const navigate = useNavigate();
    const { id, memberId } = useParams();
    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData ? clientsPersonalDetailData.firstName : "Dummy";

    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        relationship: "",
        phoneCode: "+44",
        phoneNumber: "",
        phoneType: "",
        email: "",
        isEmergencyContact: "",
        isLPA: "",
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (memberId) {
            setIsEditMode(true);
            setLoading(true);

            fetchData(
                () => _get(APIConfig?.CLIENT_CARE_CIRCLE?.GET_BY_ID(memberId)),
                (memberData) => {
                    if (memberData) {
                        setFormData({
                            firstName: memberData.firstName || "",
                            lastName: memberData.lastName || "",
                            relationship: memberData.relationship || "",
                            phoneCode: memberData.phoneCode || "+44",
                            phoneNumber: memberData.phoneNumber?.toString() || "",
                            phoneType: memberData.phoneType || "",
                            email: memberData.email || "",
                            isEmergencyContact: memberData.isEmergencyContact ? "yes" : "no",
                            isLPA: memberData.isLPA ? "yes" : "no",
                        });
                    } else {
                        showError("Failed to load care circle member data");
                        navigate(`/admin/clients/${id}/care-circle`);
                    }
                },
                setLoading,
                null,
            );
        }
    }, [memberId, id, navigate]);

    const relationshipOptions = [
        { value: "CHILD", label: "Child" },
        { value: "SPOUSE", label: "Spouse/Partner" },
        { value: "SIBLING", label: "Sibling" },
        { value: "GRANDCHILD", label: "Parent" },
        { value: "FRIEND", label: "Friend" },
        { value: "COUSIN", label: "Cousin" },
        { value: "OTHER", label: "Other" },
    ];

    const phoneTypeOptions = [
        { value: "MOBILE", label: "Mobile" },
        { value: "HOME", label: "Home" },
        { value: "WORK", label: "Work" },
        { value: "OTHER", label: "Other" },
    ];

    const radioOptions = [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
    ];

    const handleInputChange = (e) => {
        if (e && e.target) {
            const { name, value } = e.target;
            setFormData({
                ...formData,
                [name]: value,
            });

            if (errors[name]) {
                setErrors({
                    ...errors,
                    [name]: "",
                });
            }
        }
    };

    const handleDropdownChange = (value, name) => {
        if (typeof value === "string" && typeof name === "string") {
            setFormData({
                ...formData,
                [name]: value,
            });

            if (errors[name]) {
                setErrors({
                    ...errors,
                    [name]: "",
                });
            }
        }
    };

    const handlePhoneChange = (value, code) => {
        setFormData({
            ...formData,
            phoneNumber: value,
            phoneCode: code,
        });

        if (errors.phoneNumber) {
            setErrors({
                ...errors,
                phoneNumber: "",
            });
        }
    };

    const handlePhoneTypeChange = (value) => {
        setFormData({
            ...formData,
            phoneType: value,
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = "First name is required";
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        }

        if (!formData.relationship) {
            newErrors.relationship = "Relationship is required";
        }

        const phoneNumberStr = String(formData.phoneNumber || "");
        if (!phoneNumberStr || phoneNumberStr.trim() === "") {
            newErrors.phoneNumber = "Phone number is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!formData.isEmergencyContact) {
            newErrors.isEmergencyContact = "Please select an option";
        }

        if (!formData.isLPA) {
            newErrors.isLPA = "Please select an option";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm() && !submitting) {
            setSubmitting(true);

            const payload = {
                userId: id,
                firstName: formData.firstName,
                lastName: formData.lastName,
                relationship: formData.relationship,
                phoneCode: formData.phoneCode,
                phoneNumber: parseInt(String(formData.phoneNumber).replace(/\D/g, ""), 10) || 0,
                phoneType: formData.phoneType,
                email: formData.email,
                isLPA: formData.isLPA === "yes",
                isEmergencyContact: formData.isEmergencyContact === "yes",
            };

            if (isEditMode) {
                fetchData(
                    () => _put(APIConfig?.CLIENT_CARE_CIRCLE?.UPDATE(memberId), payload),
                    (data) => {
                        if (data) {
                            showSuccess("Care circle member updated successfully");
                            navigate(`/admin/clients/${id}/care-circle`);
                        } else {
                            showError("Failed to update care circle member");
                            setSubmitting(false);
                        }
                    },
                    setSubmitting,
                    null,
                );
            } else {
                fetchData(
                    () => _post(APIConfig?.CLIENT_CARE_CIRCLE?.CREATE, payload),
                    (data) => {
                        if (data) {
                            showSuccess("Care circle member created successfully");
                            navigate(`/admin/clients/${id}/care-circle`);
                        } else {
                            showError("Failed to create care circle member");
                            setSubmitting(false);
                        }
                    },
                    setSubmitting,
                    null,
                );
            }
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 text-customTextNavy"></div>
            </div>
        );
    }

    const renderEmergencyContactRadio = () => {
        return (
            <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">Contact this person in an emergency?</label>
                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={() => handleInputChange({ target: { name: "isEmergencyContact", value: "yes" } })}
                        className={`flex w-24 items-center justify-center rounded-md border px-4 py-2 ${
                            formData.isEmergencyContact === "yes"
                                ? "border-gray-300 bg-teal-100 text-gray-700"
                                : "border-gray-300 bg-white text-gray-700"
                        }`}
                    >
                        Yes
                    </button>
                    <button
                        type="button"
                        onClick={() => handleInputChange({ target: { name: "isEmergencyContact", value: "no" } })}
                        className={`flex w-24 items-center justify-center rounded-md border px-4 py-2 ${
                            formData.isEmergencyContact === "no"
                                ? "border-gray-300 bg-teal-100 text-gray-700"
                                : "border-gray-300 bg-white text-gray-700"
                        }`}
                    >
                        No
                    </button>
                </div>
                {errors.isEmergencyContact && <p className="mt-1 text-sm text-red-600">{errors.isEmergencyContact}</p>}
            </div>
        );
    };

    const renderLPARadio = () => {
        return (
            <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Does this person have lasting power of attorney for {clientName}'s health and wellbeing?
                </label>
                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={() => handleInputChange({ target: { name: "isLPA", value: "yes" } })}
                        className={`flex w-24 items-center justify-center rounded-md border px-4 py-2 ${
                            formData.isLPA === "yes" ? "border-gray-300 bg-teal-100 text-gray-700" : "border-gray-300 bg-white text-gray-700"
                        }`}
                    >
                        Yes
                    </button>
                    <button
                        type="button"
                        onClick={() => handleInputChange({ target: { name: "isLPA", value: "no" } })}
                        className={`flex w-24 items-center justify-center rounded-md border px-4 py-2 ${
                            formData.isLPA === "no" ? "border-gray-300 bg-teal-100 text-gray-700" : "border-gray-300 bg-white text-gray-700"
                        }`}
                    >
                        No
                    </button>
                </div>
                {errors.isLPA && <p className="mt-1 text-sm text-red-600">{errors.isLPA}</p>}
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <Link
                to={`/admin/clients/${id}/care-circle`}
                className="mb-6 flex items-center text-customTextNavy"
            >
                <span className="mr-2">←</span>
                <span>Back to Care Circle</span>
            </Link>

            <h1 className="mb-2 text-2xl font-medium text-customNavy">
                {isEditMode ? "Edit care circle member" : "Create a new care circle member"}
            </h1>
            <p className="mb-8 text-gray-500">Care circle members have full access to {clientName}'s care notes</p>

            <div className="md:ml-[20%]">
                <form
                    onSubmit={handleSubmit}
                    className="max-w-xl"
                >
                    <div className="mb-8 border-gray-200 bg-white p-6">
                        <h2 className="mb-6 w-full text-lg font-medium text-gray-900 underline underline-offset-2">Personal details</h2>

                        <div className="space-y-6">
                            <TextField
                                label="First name"
                                name="firstName"
                                placeHolder="e.g. John"
                                value={formData.firstName}
                                valueChange={handleInputChange}
                                error={errors.firstName}
                                required
                            />

                            <TextField
                                label="Last name"
                                name="lastName"
                                placeHolder="e.g. Smith"
                                value={formData.lastName}
                                valueChange={handleInputChange}
                                error={errors.lastName}
                                required
                            />

                            <DropdownField
                                label={`Relationship to ${clientName}`}
                                name="relationship"
                                options={relationshipOptions}
                                value={formData.relationship}
                                valueChange={handleDropdownChange}
                                error={errors.relationship}
                                required
                                placeholder="Select"
                            />

                            <div className="space-y-4">
                                <PhoneNumberDropdown
                                    label="Mobile Number"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    selectedCountry={formData.phoneCode}
                                    onChange={handlePhoneChange}
                                    error={errors.phoneNumber}
                                    required
                                    initialCountry="GB"
                                />
                            </div>

                            <TextField
                                label="Email address"
                                name="email"
                                placeHolder="e.g. john@email.com"
                                value={formData.email}
                                valueChange={handleInputChange}
                                error={errors.email}
                            />

                            {renderEmergencyContactRadio()}
                            {renderLPARadio()}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-between">
                        <button
                            type="button"
                            onClick={() => navigate(`/admin/clients/${id}/care-circle`)}
                            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-md bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 disabled:opacity-50"
                            disabled={submitting}
                        >
                            {submitting ? "Processing..." : isEditMode ? "Save changes" : "Save & continue"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCareCircle;
