import React from "react";
import { useFormikContext } from "formik";
import TextAreaField from "../../../../../components/TextInput/TextAreaField";
import TextField from "../../../../../components/TextInput/TextInput";
import useScrollToTop from "../../../../../hooks/useScrollToTop";
import SearchableDropdown from "../../../../../components/DropdownInput/SearchableDropdown";
import RadioButtonGroup from "../../../../../components/TextInput/RadioButtonGroup";
import PhoneNumberField from "../../../../../components/DropdownInput/PhoneNumberDropdown";
import { clientsClinicalMedicalSupportOptions } from "../../../../../constants/clientConstants";
import { useGlobalStore } from "../../../../../stores/useGlobalStore";

const EditClinicalDetails = () => {
    useScrollToTop();
    const { values, setFieldValue } = useFormikContext();
    const clinicalDetails = values.clinicalDetails || {};
    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : 'the client';

    const options = [
        { value: "fever", label: "Fever" },
        { value: "stroke", label: "Stroke" },
        { value: "malaria", label: "Malarial fever" },
    ];

    const alsoKnownAsMap = {
        Fever: ["Febrile", "Pyrexia", "Pyrexial"],
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Health Details Section */}
            <div
                id="health-details-section"
                className="scroll-mt-40 space-y-6 rounded-lg border border-gray-200 bg-white p-2 shadow md:p-6"
            >
                <h2 className="poppins-medium text-xl text-customDefaultTextColor">Health Details</h2>

                <TextField
                    label={`${clientName}'s NHS number`}
                    name="clinicalDetails.nhsNumber"
                    type="number"
                    value={clinicalDetails.nhsNumber || ""}
                    valueChange={(e) => setFieldValue("clinicalDetails.nhsNumber", parseInt(e.target.value, 10))}
                />

                <SearchableDropdown
                    label={`${clientName}'s medical history`}
                    name="clinicalDetails.medicalHistory"
                    options={options}
                    value={clinicalDetails.medicalHistory || []}
                    onChange={(value) => setFieldValue("clinicalDetails.medicalHistory", value)}
                    alsoKnownAsMap={alsoKnownAsMap}
                    isMulti
                />

                <RadioButtonGroup
                    label={`Does ${clientName} require medical support?`}
                    name="clinicalDetails.medicalSupport"
                    value={clinicalDetails.medicalSupport || false}
                    options={clientsClinicalMedicalSupportOptions}
                    valueChange={(e) => setFieldValue("clinicalDetails.medicalSupport", e.target.value)}
                />
            </div>

            {/* Allergies and Intolerances Section */}
            <div
                id="allergies-section"
                className="scroll-mt-40 space-y-6 rounded-lg border border-gray-200 bg-white p-2 shadow md:p-6"
            >
                <h2 className="poppins-medium text-xl text-customDefaultTextColor">Allergies and Intolerances</h2>

                <TextAreaField
                    label={`Does ${clientName} have any allergies or intolerances? How do they impact their care needs?`}
                    name="clinicalDetails.allergiesIntolerances"
                    value={clinicalDetails.allergiesIntolerances || ""}
                    valueChange={(e) => setFieldValue("clinicalDetails.allergiesIntolerances", e.target.value)}
                />
            </div>

            {/* Doctor/GP Section */}
            <div
                id="doctor-gp-section"
                className="scroll-mt-40 space-y-6 rounded-lg border border-gray-200 bg-white p-2 shadow md:p-6"
            >
                <h2 className="poppins-medium text-xl text-customDefaultTextColor">Doctor/GP</h2>

                <TextField
                    label={`${clientName}'s GP practice name`}
                    name="clinicalDetails.gpPracticeName"
                    type="text"
                    value={clinicalDetails.gpPracticeName || ""}
                    valueChange={(e) => setFieldValue("clinicalDetails.gpPracticeName", e.target.value)}
                />

                <TextField
                    label={`${clientName}'s GP practice identifier`}
                    name="clinicalDetails.gpPracticeIdentifier"
                    type="text"
                    value={clinicalDetails.gpPracticeIdentifier || ""}
                    valueChange={(e) => setFieldValue("clinicalDetails.gpPracticeIdentifier", e.target.value)}
                />

                <TextField
                    label={`${clientName}'s GP's name`}
                    name="clinicalDetails.gpName"
                    type="text"
                    value={clinicalDetails.gpName || ""}
                    valueChange={(e) => setFieldValue("clinicalDetails.gpName", e.target.value)}
                />

                <TextField
                    label="Phone number"
                    name="clinicalDetails.gpPhoneNumber"
                    type="number"
                    value={clinicalDetails.gpPhoneNumber || ""}
                    valueChange={(e) => setFieldValue("clinicalDetails.gpPhoneNumber", parseInt(e.target.value, 10))}
                />
            </div>

            {/* Pharmacist Section */}
            <div
                id="pharmacist-section"
                className="scroll-mt-40 space-y-6 rounded-lg border border-gray-200 bg-white p-2 shadow md:p-6"
            >
                <h2 className="poppins-medium text-xl text-customDefaultTextColor">Pharmacist</h2>

                <TextField
                    label={`${clientName}'s pharmacy name`}
                    name="clinicalDetails.pharmacyName"
                    type="text"
                    value={clinicalDetails.pharmacyName || ""}
                    valueChange={(e) => setFieldValue("clinicalDetails.pharmacyName", e.target.value)}
                />

                <PhoneNumberField
                    label="Phone number"
                    phoneName="clinicalDetails.pharmacyPhoneNumber"
                    phoneValue={clinicalDetails.pharmacyPhoneNumber || ""}
                    phoneChange={(e) => setFieldValue("clinicalDetails.pharmacyPhoneNumber", e.target.value)}
                    countryValue={clinicalDetails.pharmacyPhoneCode || "+44"}
                    countryChange={(val) => setFieldValue("clinicalDetails.pharmacyPhoneCode", val)}
                />

                <TextField
                    label="Address"
                    name="clinicalDetails.pharmacyAddress"
                    type="text"
                    value={clinicalDetails.pharmacyAddress || ""}
                    valueChange={(e) => setFieldValue("clinicalDetails.pharmacyAddress", e.target.value)}
                />

                <TextField
                    label="Post code"
                    name="clinicalDetails.pharmacyPostCode"
                    type="text"
                    value={clinicalDetails.pharmacyPostCode || ""}
                    valueChange={(e) => setFieldValue("clinicalDetails.pharmacyPostCode", e.target.value)}
                />
            </div>
        </div>
    );
};

export default EditClinicalDetails;
