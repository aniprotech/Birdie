import React from "react";
import { useFormikContext } from "formik";
import useScrollToTop from "../../../../../hooks/useScrollToTop";
import DropdownField from "../../../../../components/DropdownInput/Dropdown";
import TextAreaField from "../../../../../components/TextInput/TextAreaField";
import { clientsEthnicityOptions, clientsReligionOptions, clientsSexOptions } from "../../../../../constants/clientConstants";
import RadioButtonGroup from "../../../../../components/TextInput/RadioButtonGroup";
import TextField from "../../../../../components/TextInput/TextInput";
import { useGlobalStore } from "../../../../../stores/useGlobalStore";

const EditPersonalIdentity = () => {
    useScrollToTop();

    const { values, setFieldValue } = useFormikContext();
    const personalIdentity = values.personalIdentity || {};
    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : "the client";

    return (
        <div className="space-y-8 pb-20">
            {/* Culture and Religion Section */}
            <div
                id="culture-religion-section"
                className="scroll-mt-40 space-y-6 rounded-lg border border-gray-200 bg-white p-2 shadow md:p-6"
            >
                <h2 className="poppins-medium text-xl text-neutral-800">Culture and Religion</h2>

                <div className="">
                    <p className="pb-3 text-lg text-customDefaultTextColor">Ethnicity</p>
                    <DropdownField
                        label={`What ethnic group does ${clientName} identify with?`}
                        name="personalIdentity.ethnicity"
                        options={clientsEthnicityOptions}
                        value={personalIdentity.ethnicity || ""}
                        valueChange={(e) => setFieldValue("personalIdentity.ethnicity", e.target.value)}
                        componentName="FormikValidation"
                    />
                </div>

                <div>
                    <p className="pb-3 text-lg text-customDefaultTextColor">Religion</p>

                    <DropdownField
                        label={`What religion or belief does ${clientName} identify with?`}
                        name="personalIdentity.religion"
                        options={clientsReligionOptions}
                        value={personalIdentity.religion || ""}
                        valueChange={(e) => setFieldValue("personalIdentity.religion", e.target.value)}
                        // required
                        componentName="FormikValidation"
                    />
                    <div className="pt-6">
                        <TextAreaField
                            label={`How do culture and/or religion(s) impact ${clientName}'s care needs?`}
                            name="personalIdentity.cultureImpact"
                            value={personalIdentity.cultureImpact || ""}
                            valueChange={(e) => setFieldValue("personalIdentity.cultureImpact", e.target.value)}
                            // required
                        />
                    </div>
                </div>
            </div>

            {/* Sexuality Section */}
            <div
                id="sexuality-section"
                className="scroll-mt-40 space-y-6 rounded-lg border border-gray-200 bg-white p-2 shadow md:p-6"
            >
                <div>
                    <h2 className="poppins-medium text-xl text-neutral-800">Sexuality</h2>
                    <p className="text-base text-customDefaultTextColor">
                        If you do not collect this information already, this section can be skipped.
                    </p>
                </div>
                <div className="space-y-6">
                    <div>
                        <p className="pb-3 text-lg text-customDefaultTextColor">Sex</p>
                        <RadioButtonGroup
                            label={`What sex has ${clientName} been assigned at birth?`}
                            name="personalIdentity.sex"
                            options={clientsSexOptions}
                            value={personalIdentity.sex || ""}
                            valueChange={(e) => setFieldValue("personalIdentity.sex", e.target.value)}
                        />
                    </div>

                    <div>
                        <p className="pb-3 text-lg text-customDefaultTextColor">Gender</p>
                        <RadioButtonGroup
                            label={`Which of these best describes ${clientName}'s current gender?`}
                            name="personalIdentity.gender"
                            options={clientsSexOptions}
                            value={personalIdentity.gender || ""}
                            valueChange={(e) => setFieldValue("personalIdentity.gender", e.target.value)}
                        />
                    </div>
                    <div>
                        <p className="pb-3 text-lg text-customDefaultTextColor">Sexual Orientation</p>

                        <TextField
                            label={`What best describes ${clientName}'s current sexual orientation?`}
                            name="personalIdentity.sexualOrientation"
                            value={personalIdentity.sexualOrientation || ""}
                            valueChange={(e) => setFieldValue("personalIdentity.sexualOrientation", e.target.value)}
                            componentName="FormikValidation"
                            placeHolder="eg: Homosexual"
                        />
                        <div className="pt-6">
                            <TextAreaField
                                label={`How does sex, gender or sexual orientation impact ${clientName}'s care needs?`}
                                name="personalIdentity.sexualOrientationImpact"
                                value={personalIdentity.sexualOrientationImpact || ""}
                                valueChange={(e) => setFieldValue("personalIdentity.sexualOrientationImpact", e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Life History Section */}
            <div
                id="life-history-section"
                className="scroll-mt-40 space-y-6 rounded-lg border border-gray-200 bg-white p-2 shadow md:p-6"
            >
                <h2 className="poppins-medium text-xl text-neutral-800">Life History</h2>

                <div>
                    <p className="pb-3 text-lg text-customDefaultTextColor">Jobs and occupations</p>
                    <TextAreaField
                        label={`Does ${clientName} have any current jobs or past jobs that are important to them? How do they impact their care needs?`}
                        name="personalIdentity.jobsAndOccupations"
                        value={personalIdentity.jobsAndOccupations || ""}
                        valueChange={(e) => setFieldValue("personalIdentity.jobsAndOccupations", e.target.value)}
                        placeHolder={`Describe ${clientName}'s work history and any jobs that are important to them? How do they impact their care needs?`}
                    />
                </div>

                <div>
                    <p className="pb-3 text-lg text-customDefaultTextColor">Important people</p>
                    <TextAreaField
                        label={`Does ${clientName} have any people who are important to them? How do they impact their care needs?`}
                        name="personalIdentity.importantPeople"
                        value={personalIdentity.importantPeople || ""}
                        valueChange={(e) => setFieldValue("personalIdentity.importantPeople", e.target.value)}
                        placeHolder="Describe anyone important to the client, their relationship and why they are important?"
                    />
                </div>

                <div>
                    <p className="pb-3 text-lg text-customDefaultTextColor">Significant places</p>
                    <TextAreaField
                        label={`Does ${clientName} have any places that are important to them? How do they impact their care needs?`}
                        name="personalIdentity.significantPlaces"
                        value={personalIdentity.significantPlaces || ""}
                        valueChange={(e) => setFieldValue("personalIdentity.significantPlaces", e.target.value)}
                        rows={5}
                        placeHolder="The places people live and the places they go to are important to them. Places can be in the UK or abroad, and include places of work, places of worship, places they have lived, places they like visiting and places that are important to them for other reasons. These places help to understand who they are and what is important to them."
                    />
                </div>

                <div>
                    <p className="pb-3 text-lg text-customDefaultTextColor">Other notes</p>
                    <TextAreaField
                        label={`Are there any other notes about ${clientName}'s life history that are important? How do they impact ${clientName}'s care needs?`}
                        name="personalIdentity.otherNotes"
                        value={personalIdentity.otherNotes || ""}
                        valueChange={(e) => setFieldValue("personalIdentity.otherNotes", e.target.value)}
                        placeHolder={`Other notes about ${clientName}'s life history that are important when caring for them.`}
                    />
                </div>
            </div>

            {/* Preferences Section */}
            <div
                id="preferences-section"
                className="scroll-mt-40 space-y-6 rounded-lg border border-gray-200 bg-white p-2 shadow md:p-6"
            >
                <h2 className="poppins-medium text-xl text-neutral-800">Preferences</h2>

                <div>
                    <p className="pb-3 text-lg text-customDefaultTextColor">Routines and preferences</p>
                    <TextAreaField
                        label={`Does ${clientName} have any specific routines or preferences that are important to them? How do they impact their care needs?`}
                        name="personalIdentity.routinesAndPreferences"
                        value={personalIdentity.routinesAndPreferences || ""}
                        valueChange={(e) => setFieldValue("personalIdentity.routinesAndPreferences", e.target.value)}
                        // required
                        placeHolder={`The way in which ${clientName} likes their care to be given. This may include morning and evening routines and routines when eating and drinking.`}
                    />
                </div>

                <div>
                    <p className="pb-3 text-lg text-customDefaultTextColor">Dislikes</p>
                    <TextAreaField
                        label={`Does ${clientName} have anything that may worry or upset them? How do they impact their care needs?`}
                        name="personalIdentity.dislikes"
                        value={personalIdentity.dislikes || ""}
                        valueChange={(e) => setFieldValue("personalIdentity.dislikes", e.target.value)}
                        // required
                        placeHolder="Does anything troubling or making the client feels anxious, such as open doors, loud noises, or dark?"
                    />
                </div>

                <div>
                    <p className="pb-3 text-lg text-customDefaultTextColor">Hobbies and interests</p>
                    <TextAreaField
                        label={`Does ${clientName} have any hobbies or interests? How do they impact their care needs?`}
                        name="personalIdentity.hobbiesAndInterests"
                        value={personalIdentity.hobbiesAndInterests || ""}
                        valueChange={(e) => setFieldValue("personalIdentity.hobbiesAndInterests", e.target.value)}
                        placeHolder={`Engaging in hobbies and interests helps to make ${clientName} feel well and live a meaningful life. Please describe what they like doing and how they like to spend their time.`}
                    />
                </div>
            </div>
        </div>
    );
};

export default EditPersonalIdentity;
