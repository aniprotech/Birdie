import PropTypes from "prop-types";
import RiskCard from "../RiskCard";

const RisksSection = ({
    hasRisks = false,
    onAddRisk,
    risks,
    onEditRisk,
    onDeleteRisk,
}) => {
    return (
        <section id="risks" className="mb-10 lg:mb-20 xl:mb-32">
            <h2 className="poppins-medium text-lg text-customBlack"> Risks and mitigations</h2>
            <p className="text-customFeedCardGreyText1 mb-3 text-sm">
                Record any risks the client presents with, and the measures taken to mitigate them...
            </p>

            <button
                onClick={onAddRisk}
                className="rounded border border-customNavy/50 px-4 py-2 text-sm text-customNavy hover:bg-customTextLightNavy/10"
            >
                Add new risk
            </button>

            {!hasRisks ? (
                <div className="mt-6 rounded-md border border-gray-200 p-8 text-center text-customGrey1">
                    No risk added
                </div>
            ) : (
                <div className="mt-4 space-y-4">
                    {risks.map((risk) => (
                        <RiskCard
                            key={risk.id}
                            risk={risk}
                            onEdit={() => onEditRisk(risk)}
                            onDelete={() => onDeleteRisk(risk.id)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

RisksSection.propTypes = {
    hasRisks: PropTypes.bool,
    onAddRisk: PropTypes.func.isRequired,
    risks: PropTypes.array.isRequired,
    onEditRisk: PropTypes.func.isRequired,
    onDeleteRisk: PropTypes.func.isRequired,
};

export default RisksSection;
