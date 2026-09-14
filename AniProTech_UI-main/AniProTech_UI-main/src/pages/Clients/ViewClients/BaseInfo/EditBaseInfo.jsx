import React, { useRef, useState } from "react";
import { Link } from "react-scroll";
import { Filter } from "lucide-react";
import { Formik, Form } from "formik";
import ClientProfile from "../../CreateClients/ClientProfile";
import ClientContact from "../../CreateClients/ClientContact";
import ClientAddress from "../../CreateClients/ClientAddress";
import ClientHighlights from "../../CreateClients/ClientHighlights";
import { clientsProfileSections } from "../../../../constants";
import { generateFullValidationSchema } from "../../../../utils/validationSchema";
import { useClickOutside } from "../../../../hooks/use-click-outside";
import { useLocation, useNavigate } from "react-router-dom";
import useScrollToTop from "../../../../hooks/useScrollToTop";
import { showError, showSuccess } from "../../../../utils/toaster";
import { _post } from "../../../../utils/ApiService";
import APIConfig from "../../../../utils/ApiConfig";

const EditBaseInfo = () => {
    const [mode, setMode] = useState("create");
    const [activeComponent, setActiveComponent] = useState("ClientProfile");
    const [showMenu, setShowMenu] = useState(false);
    const dropdownRef = useRef(null);
    const dropdownBtnRef = useRef(null);
    const locaton = useLocation();
    const navigate = useNavigate();
    useClickOutside([dropdownRef, dropdownBtnRef], () => setShowMenu(false));

    const tData = locaton.state?.data;
    const initialValues = tData ? { ...tData, filesToRemove: [] } : {};

    const handleSubmit = async (values) => {
        try {
            const formData = new FormData();

            // Handle non-address fields
            Object.keys(values).forEach((key) => {
                if (key === "profileImage" || key === "addresses" || key === "filesToRemove") {
                    return;
                }
                if (values[key] !== null && values[key] !== undefined) {
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
            
            formData.append("filesToRemove", JSON.stringify(values.filesToRemove));

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

            showSuccess("Client information updated successfully!");
            navigate(-1);
        } catch (error) {
            console.error("Error submitting form:", error);
            showError(error.message || "Failed to save client information");
        }
    };

    useScrollToTop();

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validationSchema={generateFullValidationSchema(initialValues, true)}
            validateOnChange={true}
            validateOnBlur={false}
        >
            <Form>
                <div className="relative flex min-h-screen flex-col gap-8 scroll-smooth bg-customBgGrey px-4 pb-10 md:px-5 md:py-10 lg:flex-row">
                    {/* Left Column - Forms */}
                    <div className="flex-1 space-y-10 bg-customBgGrey">
                        {/* Header */}
                        <div className="sticky:py-10 relative sticky top-14 z-10 flex items-center justify-between bg-customBgGrey py-5 xl:static xl:bg-customBgGrey xl:py-0">
                            <h1 className="z-0 text-2xl font-bold text-gray-900 md:text-3xl">Basic information</h1>
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
                                    {clientsProfileSections?.map((section) => (
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
                                            className={`block cursor-pointer text-sm font-medium text-customTextNavy transition hover:underline ${activeComponent === section.id ? "border-l-4 border-customNavy bg-customNavy1/10 py-2 pl-2" : ""}`}
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
                                mode="Edit"
                                setMode={setMode}
                                data={tData}
                            />
                            <ClientContact
                                name="ClientContact"
                                id="ClientContact"
                                activeComponent={activeComponent}
                                setActiveComponent={setActiveComponent}
                                mode={mode}
                                setMode={setMode}
                                data={tData}
                            />
                            <ClientAddress
                                name="ClientAddress"
                                id="ClientAddress"
                                activeComponent={activeComponent}
                                setActiveComponent={setActiveComponent}
                                mode={mode}
                                setMode={setMode}
                                data={tData}
                            />
                            <ClientHighlights
                                name="ClientHighlights"
                                id="ClientHighlights"
                                activeComponent={activeComponent}
                                setActiveComponent={setActiveComponent}
                                mode={mode}
                                setMode={setMode}
                                data={tData}
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
                                {clientsProfileSections.map((section) => (
                                    <Link
                                        key={section.id}
                                        to={section.id}
                                        smooth={true}
                                        offset={-80}
                                        duration={500}
                                        onClick={() => setActiveComponent(section.id)}
                                        className={`block cursor-pointer text-sm font-medium text-customTextNavy transition hover:underline ${activeComponent === section.id ? "border-l-4 border-customNavy bg-customNavy1/10 py-2 pl-2" : ""}`}
                                    >
                                        {section.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Form>
        </Formik>
    );
};

export default EditBaseInfo;
