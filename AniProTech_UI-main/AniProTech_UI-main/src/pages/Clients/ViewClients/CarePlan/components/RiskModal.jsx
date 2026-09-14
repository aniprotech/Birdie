import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { X } from "lucide-react";
import { Formik, Form } from "formik";
import DropdownField from "../../../../../components/DropdownInput/Dropdown";
import TextField from "../../../../../components/TextInput/TextInput";
import TextAreaField from "../../../../../components/TextInput/TextAreaField";
import { ASSESSMENT_OPTIONS, RISK_LEVEL_OPTIONS } from "../../../../../constants/clientCarePlan";
import { useLocation } from "react-router-dom";
import MultiSelect from "../../../../../components/MultiSelect/MultiSelect";
import { formatDisplayName } from "../../../../../utils/common";

const RiskModal = ({ data = {}, isOpen, onClose, onSave }) => {
    const [selectedAssessments, setSelectedAssessments] = useState([]);
    const location = useLocation();

    const getAssessmentFromPath = () => {
        const pathParts = location.pathname.split("/");
        const assessmentType = pathParts[pathParts.length - 1];
        return assessmentType
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const initialValues = {
        assessment: getAssessmentFromPath(),
        risk: data?.risk || "",
        mitigation: data?.mitigation || "",
        riskLevel: data?.riskLevel || "",
        relatedAssessments: data?.relatedAssessments || [],
    };

    useEffect(() => {
        // When modal opens and editing, set related assessments properly
        if (data?.relatedAssessments?.length > 0) {
            setSelectedAssessments(data.relatedAssessments);
        } else {
            setSelectedAssessments([]);
        }
    }, [data]);

    const handleSubmit = (values) => {
        const payload = {
            ...values,
            relatedAssessments: selectedAssessments,
        };
        if (data?.id) {
            payload.id = data.id;
        }
        onSave(payload);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative flex max-h-[80vh] w-full max-w-2xl flex-col overflow-y-auto rounded-md bg-white">
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
                    <h2 className="text-base font-semibold text-customBlack">Risk and mitigations</h2>
                    <button onClick={onClose} className="text-customGrey1 hover:text-customBlack">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <Formik initialValues={initialValues} onSubmit={handleSubmit}>
                    {({ values, setFieldValue }) => (
                        <Form className="flex flex-1 flex-col">
                            <div className="flex-1 overflow-y-auto px-6 py-6">
                                <div className="space-y-4">

                                    {/* Assessment Display or Related Tags */}
                                    <div className="mb-4">
                                        <label className="mb-1 block text-sm font-medium text-customBlack">Assessment</label>

                                        {data?.relatedAssessments?.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {data.relatedAssessments.map((item) => (
                                                    <span
                                                        key={item}
                                                        className="poppins-semibold inline-block rounded border border-customGrey1 bg-gray-200 px-2 py-1 text-xs text-gray-700"
                                                    >
                                                        {formatDisplayName(item)}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="poppins-semibold inline-block rounded border border-customGrey1 bg-gray-200 px-2 py-1 text-xs text-gray-700">
                                                {values.assessment}
                                            </div>
                                        )}
                                    </div>

                                    {/* Risk Input */}
                                    <TextField
                                        label="Risk"
                                        name="risk"
                                        type="text"
                                        value={values.risk}
                                        valueChange={(e) => setFieldValue("risk", e)}
                                        placeHolder="e.g. Loss of independence."
                                        required
                                        componentName="NormalValidation"
                                    />

                                    {/* Mitigation TextArea */}
                                    <TextAreaField
                                        label="Mitigation"
                                        name="mitigation"
                                        value={values.mitigation}
                                        valueChange={(e) => setFieldValue("mitigation", e.target.value)}
                                        placeHolder="e.g. Care worker to support with personal care tasks..."
                                        required
                                        rows={4}
                                    />

                                    {/* Related Assessments */}
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-customBlack">Related assessments (optional)</label>
                                        <p className="mb-2 text-sm text-customGrey1">
                                            What other assessment(s) does this risk relate to?
                                        </p>

                                        <MultiSelect
                                            name="relatedAssessments"
                                            value={selectedAssessments}
                                            valueChange={(e) => setSelectedAssessments(e)}
                                            componentName="NormalValidation"
                                            options={ASSESSMENT_OPTIONS}
                                            placeholder="Select assessments"
                                        />
                                    </div>

                                    {/* Risk Level Dropdown */}
                                    <div className="pb-10">
                                        <DropdownField
                                            label="Risk Level"
                                            name="riskLevel"
                                            value={values.riskLevel}
                                            valueChange={(value) => setFieldValue("riskLevel", value)}
                                            options={RISK_LEVEL_OPTIONS}
                                            required
                                            placeholder="Select risk level"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="sticky bottom-0 z-10 flex justify-end gap-3 border-t bg-white px-6 py-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="poppins-medium rounded border border-customNavy px-4 py-1.5 text-sm text-customNavy hover:bg-customNavy/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={!values.risk || !values.mitigation || !values.riskLevel}
                                    {...(!values.risk || !values.mitigation || !values.riskLevel ? { title: "Please fill in the risk and mitigation fields" } : {})}
                                    type="submit"
                                    className="poppins-medium rounded bg-customDropdownBorder px-5 py-1.5 text-sm text-white hover:bg-customDropdownBorder/90 disabled:bg-customDropdownBorder/50"
                                >
                                    Save
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

RiskModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    data: PropTypes.object,
};

export default RiskModal;
