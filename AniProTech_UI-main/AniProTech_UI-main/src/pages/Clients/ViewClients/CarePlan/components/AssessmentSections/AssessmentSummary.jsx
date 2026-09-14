import PropTypes from "prop-types";
import TextAreaField from "../../../../../../components/TextInput/TextAreaField";

const AssessmentSummary = ({
    assessmentSummaryOutcomes,
    onSummaryChange,
    onSaveChanges,
}) => {
    return (
        <section id="summary" className="mb-10 lg:mb-20 xl:mb-32">
            <h2 className="poppins-medium text-lg text-customBlack">2. Assessment summary and outcomes</h2>
            <p className="text-customFeedCardGreyText1 mb-3 text-sm">Describe how your team can support the client.</p>
            <TextAreaField
                label=""
                name="assessmentSummaryOutcomes"
                value={assessmentSummaryOutcomes}
                valueChange={onSummaryChange}
                placeholder="e.g. Client needs support with getting dressed in the morning."
                maxLength={3000}
                rows={10}
            />
            <div className="mt-4 flex items-center justify-between">
                <button
                    onClick={onSaveChanges}
                    disabled={!assessmentSummaryOutcomes?.length}
                    className="poppins-medium rounded border border-gray-500 px-4 py-2 text-sm text-customNavy1 disabled:bg-customTextLightNavy/10"
                >
                    Save changes
                </button>
                <span className="text-sm text-customGrey1">{assessmentSummaryOutcomes?.length || 0} / 3000 characters</span>
            </div>
        </section>
    );
};

AssessmentSummary.propTypes = {
    assessmentSummaryOutcomes: PropTypes.string,
    onSummaryChange: PropTypes.func.isRequired,
    onSaveChanges: PropTypes.func.isRequired,
};

export default AssessmentSummary; 