import React from "react";
import { useFormikContext } from "formik";
import useScrollToTop from "../../../../../hooks/useScrollToTop";
import RadioButtonGroup from "../../../../../components/TextInput/RadioButtonGroup";
import { clientsYesNoOptions } from "../../../../../constants/clientConstants";
import { useGlobalStore } from "../../../../../stores/useGlobalStore";

const EditFuturePlanning = () => {
    useScrollToTop();
    const { values, setFieldValue } = useFormikContext();
    const futurePlanning = values.futurePlanning || {};
    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : 'the client';

    return (
        <div className="space-y-8 pb-20">
            {/* Capacity and Documentation Section */}
            <div
                id="capacity-documentation-section"
                className="scroll-mt-40 space-y-6 rounded-lg border border-gray-200 bg-white p-2 shadow md:p-6"
            >
                <h2 className="poppins-medium text-xl text-customDefaultTextColor">Capacity and Documentation</h2>

                <div className="space-y-6">
                    <RadioButtonGroup
                        label={`Has ${clientName} been assessed as having capacity to make decisions about their health and care?`}
                        name="futurePlanning.healthCapacityDecision"
                        value={futurePlanning.healthCapacityDecision || ""}
                        options={clientsYesNoOptions}
                        valueChange={(e) => setFieldValue("futurePlanning.healthCapacityDecision", e.target.value)}
                    />

                    <RadioButtonGroup
                        label={`Does ${clientName} have a health and welfare lasting power of attorney?`}
                        name="futurePlanning.healthWelfareLpa"
                        value={futurePlanning.healthWelfareLpa || ""}
                        options={clientsYesNoOptions}
                        valueChange={(e) => setFieldValue("futurePlanning.healthWelfareLpa", e.target.value)}
                    />

                    <RadioButtonGroup
                        label={`Does ${clientName} have a property and financial lasting power of attorney?`}
                        name="futurePlanning.propertyFinancialLpa"
                        value={futurePlanning.propertyFinancialLpa || ""}
                        options={clientsYesNoOptions}
                        valueChange={(e) => setFieldValue("futurePlanning.propertyFinancialLpa", e.target.value)}
                    />

                    <RadioButtonGroup
                        label={`Does ${clientName} have a DNACPR (Do Not Attempt Cardiopulmonary Resuscitation) form?`}
                        name="futurePlanning.dnacpr"
                        value={futurePlanning.dnacpr || ""}
                        options={clientsYesNoOptions}
                        valueChange={(e) => setFieldValue("futurePlanning.dnacpr", e.target.value)}
                    />

                    <RadioButtonGroup
                        label={`Does ${clientName} have an ADRT (Advance Decision to Refuse Treatment)?`}
                        name="futurePlanning.adrt"
                        value={futurePlanning.adrt || ""}
                        options={clientsYesNoOptions}
                        valueChange={(e) => setFieldValue("futurePlanning.adrt", e.target.value)}
                    />

                    <RadioButtonGroup
                        label={`Does ${clientName} have a ReSPECT (Recommended Summary Plan for Emergency Care and Treatment) form?`}
                        name="futurePlanning.respect"
                        value={futurePlanning.respect || ""}
                        options={clientsYesNoOptions}
                        valueChange={(e) => setFieldValue("futurePlanning.respect", e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default EditFuturePlanning;
