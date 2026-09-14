import React from "react";
import PropTypes from "prop-types";
import { useFormikContext } from "formik";
import DropdownField from "../../../../../components/DropdownInput/Dropdown";
import TextField from "../../../../../components/TextInput/TextInput";
import PhoneNumberField from "../../../../../components/DropdownInput/PhoneNumberDropdown";
import StatusToggleButtonGroup from "../../../../../components/TextInput/StatusToggleButtonGroup";
import { teamsRelationshipOptions } from "../../../../../constants/teamConstants";
import { clientskeysContactOptions } from "../../../../../constants/clientConstants";
import { useGlobalStore } from "../../../../../stores/useGlobalStore";

const EditOtherProfessionalForm = ({ index }) => {
    const { values, setFieldValue } = useFormikContext();
    const professional = values.keyContacts?.clientProfessionals?.[index] || {};
    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : 'the client';

    return (
        <div className="space-y-6">
            <TextField
                name={`keyContacts.clientProfessionals.${index}.firstName`}
                label="First Name"
                value={professional.firstName || ""}
                valueChange={(e) => setFieldValue(`keyContacts.clientProfessionals.${index}.firstName`, e.target.value)}
            />

            <TextField
                name={`keyContacts.clientProfessionals.${index}.lastName`}
                label="Last Name"
                value={professional.lastName || ""}
                valueChange={(e) => setFieldValue(`keyContacts.clientProfessionals.${index}.lastName`, e.target.value)}
            />

            <TextField
                name={`keyContacts.clientProfessionals.${index}.serviceName`}
                label="Service name"
                value={professional.serviceName || ""}
                valueChange={(e) => setFieldValue(`keyContacts.clientProfessionals.${index}.serviceName`, e.target.value)}
            />

            <DropdownField
                label="Role"
                name={`keyContacts.clientProfessionals.${index}.role`}
                options={teamsRelationshipOptions}
                value={professional.role || ""}
                valueChange={(e) => setFieldValue(`keyContacts.clientProfessionals.${index}.role`, e.target.value)}
                componentName="FormikValidation"
            />

            <PhoneNumberField
                label="Mobile number"
                phoneName={`keyContacts.clientProfessionals.${index}.phoneNumber`}
                phoneValue={professional.phoneNumber || ""}
                phoneChange={(e) => setFieldValue(`keyContacts.clientProfessionals.${index}.phoneNumber`, e.target.value)}
                countryValue={professional.phoneCode || "+44"}
                countryChange={(val) => setFieldValue(`keyContacts.clientProfessionals.${index}.phoneCode`, val)}
            />

            <TextField
                name={`keyContacts.clientProfessionals.${index}.email`}
                label="Email address"
                value={professional.email || ""}
                valueChange={(e) => setFieldValue(`keyContacts.clientProfessionals.${index}.email`, e.target.value)}
            />

            <StatusToggleButtonGroup
                label={`Does ${clientName} or person making a best interests decision on their behalf agree that general care matters can be discussed with this professional?`}
                name={`keyContacts.clientProfessionals.${index}.careMattersDiscussionAgreement`}
                value={professional.careMattersDiscussionAgreement || false}
                options={clientskeysContactOptions}
                onChange={(e) => setFieldValue(`keyContacts.clientProfessionals.${index}.careMattersDiscussionAgreement`, e.target.value)}
            />
        </div>
    );
};

EditOtherProfessionalForm.propTypes = {
    index: PropTypes.number.isRequired,
};

export default EditOtherProfessionalForm;
