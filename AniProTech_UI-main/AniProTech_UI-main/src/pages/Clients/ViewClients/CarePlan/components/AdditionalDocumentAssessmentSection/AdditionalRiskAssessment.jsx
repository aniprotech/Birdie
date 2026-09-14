import PropTypes from "prop-types";

const AdditionalRiskAssessment = ({
    hasRisks = false,
    onAddRisk,
}) => {
    return (
        <section id="risks" className="mb-10 lg:mb-20 xl:mb-32">
            <h2 className="poppins-medium text-lg text-customBlack">Risks and mitigations</h2>
            <p className="text-customFeedCardGreyText1 mb-3 text-sm">
                Record any risks the client presents with, and the measures taken to mitigate them. If you feel the client&apos;s risk
                level has changed, you should consider the need to review the Care Plan and RAG status in Birdie and update accordingly.
            </p>

            <button
                onClick={onAddRisk}
                className="rounded border border-customNavy/50 px-4 py-2 text-sm text-customNavy hover:bg-customTextLightNavy/10"
            >
                Add new risk
            </button>

            {!hasRisks && (
                <div className="mt-6 rounded-md border border-gray-200 p-8 text-center text-customGrey1">
                    No risk added
                </div>
            )}
        </section>
    );
};

AdditionalRiskAssessment.propTypes = {
    hasRisks: PropTypes.bool,
    onAddRisk: PropTypes.func.isRequired,
};

export default AdditionalRiskAssessment; 