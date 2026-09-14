import React, { useRef, useState } from "react";
import { Link } from "react-scroll";
import { Filter } from "lucide-react";
import { Formik, Form } from "formik";
import { useNavigate } from "react-router-dom";
import ClientProfile from "./ClientProfile";
import ClientContact from "./ClientContact";
import ClientAddress from "./ClientAddress";
import ClientHighlights from "./ClientHighlights";
import { clientsProfileSections } from "../../../constants";
import { useClickOutside } from "../../../hooks/use-click-outside";
import { generateFullValidationSchema } from "../../../utils/validationSchema";
import { _post } from "../../../utils/ApiService";
import APIConfig from "../../../utils/ApiConfig";
import { showError, showSuccess } from "../../../utils/toaster";


const CreateClientIndex = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState("create");
    const [data] = useState({});
    const [activeComponent, setActiveComponent] = useState("ClientProfile");
    const [showMenu, setShowMenu] = useState(false);
    const dropdownRef = useRef(null);
    const dropdownBtnRef = useRef(null);
    useClickOutside([dropdownRef, dropdownBtnRef], () => setShowMenu(false));

    const handleSubmit = async (values) => {
        try {
            const formData = new FormData();

            // Handle non-address fields
            Object.keys(values).forEach((key) => {
                if (key === "profileImage" || key === "addresses" || key === "filesToRemove") {
                    return;
                }
                if (values[key] !== null && values[key] !== undefined) {
                    // Convert numbers to strings before appending
                    formData.append(key, String(values[key]));
                }
            });

            // Handle addresses with specific fields
            if (values.addresses && values.addresses.length > 0) {
                const cleanedAddresses = values.addresses.map((address, index) => {
                    return {
                        addressType: address.addressType || "MAIN_BUSINESS_PREMISES",
                        addressLine1: address.addressLine1 || "",
                        addressLine2: address.addressLine2 || "",
                        city: address.city || "",
                        county: address.county || "",
                        country: address.country || "",
                        postalCode: address.postalCode || "",
                        secureCheckin: address.secureCheckin || false,
                        accessDetails: address.accessDetails || "",
                        isPrimary: index === 0 
                    };
                });

                // Ensure addresses are properly stringified
                const addressesString = JSON.stringify(cleanedAddresses);
                formData.append("addresses", addressesString);
            }

            // Handle profile image and filesToRemove
            if (values.profileImage && values.profileImage instanceof File) {
                formData.append("profileImage", values.profileImage);
            }
            
            // Handle filesToRemove as an array
            const filesToRemove = [];
            if (values.profileImage === null && data.profileImage) {
                filesToRemove.push("profileImage");
            }
            // Ensure filesToRemove is sent as a proper JSON array string
            formData.append("filesToRemove", JSON.stringify(filesToRemove || []));

            // Log the actual data being sent
            const formDataObject = {};
            formData.forEach((value, key) => {
                if (key === "addresses") {
                    try {
                        formDataObject[key] = JSON.parse(value);
                    } catch {
                        formDataObject[key] = value;
                    }
                } else {
                    formDataObject[key] = value;
                }
            });

            const response = await _post(`${APIConfig?.CLIENTS?.CREATE}`, formData);

            if (response.data.error) {
                showError("Failed to save client information");
                return;
            }

            showSuccess("Client information saved successfully!");
            navigate("/admin/clients");
        } catch (error) {
            console.error("Error submitting form:", error);
            showError(error.message || "Failed to save client information");
        }
    };

    const initialValues = {
        id: data?.id || null, // UUID for updates
        profileImage: data?.profileImage || null, // File object for upload
        title: data?.title || "",
        firstName: data?.firstName || "",
        lastName: data?.lastName || "",
        preferredName: data?.preferredName || "",
        referredAs: data?.referredAs || "HE_HIM", // This replaces pronoun in your structure
        dateOfBirth: data?.dateOfBirth || "",
        email: data?.email || "",
        highlights: data?.highlights || "",

        // Primary Phone Details
        primaryPhone: data?.primaryPhone || "",
        primaryPhoneCode: data?.primaryPhoneCode || "+44",
        primaryPhoneType: data?.primaryPhoneType || "",

        // Secondary Phone Details (optional)
        secondaryPhone: data?.secondaryPhone || "",
        secondaryPhoneCode: data?.secondaryPhoneCode || "+44",
        secondaryPhoneType: data?.secondaryPhoneType || "",

        role: data?.role || "USER",
        addresses: data?.addresses || [{
            searchAddress: "",
            addressLine1: "",
            addressLine2: "",
            city: "",
            county: "",
            country: "",
            postalCode: "",
            secureCheckin: false,
            accessDetails: "",
            addressType: "MAIN_BUSINESS_PREMISES",
            isPrimary: true
        }],
        filesToRemove: data?.filesToRemove || [],
    };

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validationSchema={generateFullValidationSchema(initialValues, true)}
            validateOnChange={true}
            validateOnBlur={false}
            enableReinitialize={true}
        >
            {({ values }) => (
                <Form onChange={() => console.log("Current form values:", values)}>
                    <div className="relative flex min-h-screen flex-col gap-8 scroll-smooth bg-customBgGrey px-4 pb-10 md:px-12 md:py-10 lg:flex-row lg:px-40 lg:py-24 xl:px-64">
                        {/* Left Column - Forms */}
                        <div className="flex-1 space-y-10 bg-customBgGrey">
                            {/* Header */}
                            <div className="sticky:py-10 relative sticky top-14 z-10 flex items-center justify-between bg-customBgGrey py-5 xl:static xl:bg-customBgGrey xl:py-0">
                                <h1 className="poppins-semibold text-2xl text-gray-900 md:text-2xl">Basic information</h1>
                                <button
                                    ref={dropdownBtnRef}
                                    onClick={() => setShowMenu((prev) => !prev)}
                                    className="text-customTextNavy xl:hidden"
                                >
                                    <Filter className="h-6 w-6" />
                                </button>
                                {showMenu && (
                                    <div
                                        ref={dropdownRef}
                                        className="absolute right-0 top-full z-10 mt-2 w-48 space-y-3 rounded-md border border-customNavy bg-white p-2 shadow-lg xl:hidden"
                                    >
                                        {clientsProfileSections.map((section) => (
                                            <Link
                                                key={section.id}
                                                to={section.id}
                                                smooth={true}
                                                offset={-80}
                                                duration={500}
                                                onClick={() => {
                                                    setActiveComponent(section.id);
                                                    setShowMenu(false);
                                                }}
                                                className={`block cursor-pointer text-sm font-medium text-customNavy transition hover:underline ${activeComponent === section.id ? "border-l-4 border-customNavy bg-customNavy1/10 py-2 pl-2" : ""}`}
                                            >
                                                {section.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Form Sections */}
                            <div className="space-y-8">
                                <ClientProfile
                                    name="ClientProfile"
                                    id="ClientProfile"
                                    activeComponent={activeComponent}
                                    setActiveComponent={setActiveComponent}
                                    mode={mode}
                                    setMode={setMode}
                                />
                                <ClientContact
                                    name="ClientContact"
                                    id="ClientContact"
                                    activeComponent={activeComponent}
                                    setActiveComponent={setActiveComponent}
                                    mode={mode}
                                    setMode={setMode}
                                />
                                <ClientAddress
                                    name="ClientAddress"
                                    id="ClientAddress"
                                    activeComponent={activeComponent}
                                    setActiveComponent={setActiveComponent}
                                    mode={mode}
                                    setMode={setMode}
                                />
                                <ClientHighlights
                                    name="ClientHighlights"
                                    id="ClientHighlights"
                                    activeComponent={activeComponent}
                                    setActiveComponent={setActiveComponent}
                                    mode={mode}
                                    setMode={setMode}
                                />
                            </div>

                            <div className="w-full space-y-4">
                                <p className="text-sm italic text-customTextGrey1">
                                    <span className="text-red-500">*</span> Note: Please make sure the required fields are filled.
                                </p>
                                <button
                                    type="submit"
                                    className="w-full max-w-60 bg-customNavy1 py-2.5 text-sm font-semibold text-white"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>

                        {/* Right Column - Sticky Nav */}
                        <div className="hidden w-1/4 xl:block">
                            <div className="sticky top-20">
                                <div className="space-y-3 rounded-md bg-white p-4 shadow">
                                    {clientsProfileSections?.map((section) => (
                                        <Link
                                            key={section.id}
                                            to={section.id}
                                            smooth={true}
                                            offset={-80}
                                            duration={500}
                                            onClick={() => setActiveComponent(section.id)}
                                            className={`block cursor-pointer text-sm font-medium text-customNavy transition hover:underline ${activeComponent === section.id ? "border-l-4 border-customNavy bg-customNavy1/10 py-2 pl-2" : ""}`}
                                        >
                                            {section.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default CreateClientIndex;
