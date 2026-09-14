import React from "react";
import { FieldArray, useFormikContext } from "formik";
import { Trash2 } from "lucide-react";
import EditClientKeyContactForm from "./EditClientKeyContactForm";
import EditOtherProfessionalForm from "./EditOtherProfessionalForm";
import { useGlobalStore } from "../../../../../stores/useGlobalStore";

const defaultEmergencyContact = {
    firstName: "",
    lastName: "",
    relationShip: null,         
    phoneNumber: "",
    phoneCode: "+44",
    email: "",
    typeOfContact: [],       
    careMattersDiscussionAgreement: false,
};

const defaultOtherProfessional = {
    firstName: "",
    lastName: "",
    serviceName: "",
    role: "",
    phoneNumber: "",
    phoneCode: "+44",
    email: "",
    careMattersDiscussionAgreement: false,
};

const EditKeyContacts = () => {
    const { values } = useFormikContext();
    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : 'the client';

    return (
        <div className="flex min-h-screen flex-col pb-20">
            {/* Emergency Contacts Section */}
            <div className="flex-1 overflow-y-auto" id="next-of-kin-section">
                <h2 className="text-base font-medium">Next of kin / Emergency contacts</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Add emergency contacts for {clientName}. These contacts will be used in case of emergencies.
                </p>

                <FieldArray name="keyContacts.clientEmergencyContacts">
                    {({ push, remove }) => (
                        <div className="mt-4 space-y-4">
                            {values.keyContacts?.clientEmergencyContacts?.map((contact, index) => (
                                <div
                                    key={index}
                                    className="relative rounded-lg border border-gray-200 bg-white p-4 shadow"
                                >
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                    <EditClientKeyContactForm index={index} />
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => push(defaultEmergencyContact)}
                                className="mt-4 inline-flex items-center rounded-md bg-customDropdownBorder px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-80 focus:outline-none"
                            >
                                Add Emergency Contact
                            </button>
                        </div>
                    )}
                </FieldArray>
            </div>

            {/* Other Professionals Section */}
            <div className="flex-1 overflow-y-auto pt-8" id="other-professionals-section">
                <h2 className="text-base font-medium">Other Professionals</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Add other professionals involved in {clientName}'s care. These could include social workers, occupational therapists, etc.
                </p>

                <FieldArray name="keyContacts.clientProfessionals">
                    {({ push, remove }) => (
                        <div className="mt-4 space-y-4">
                            {values.keyContacts?.clientProfessionals?.map((professional, index) => (
                                <div
                                    key={index}
                                    className="relative rounded-lg border border-gray-200 bg-white p-4 shadow"
                                >
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                    <EditOtherProfessionalForm index={index} />
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => push(defaultOtherProfessional)}
                                className="mt-4 inline-flex items-center rounded-md bg-customDropdownBorder px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-80 focus:outline-none"
                            >
                                Add Professional
                            </button>
                        </div>
                    )}
                </FieldArray>
            </div>
        </div>
    );
};

export default EditKeyContacts;
