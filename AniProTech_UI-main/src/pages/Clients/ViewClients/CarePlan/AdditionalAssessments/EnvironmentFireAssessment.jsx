import AdditionalDocumentsAssessmentLayout from "../components/AdditionalDocumentsAssessmentLayout";

const EnvironmentFireAssessment = () => {
    const handleReviewAssessment = () => {
        console.log("Opening review assessment form");
        
    };

    return (
        <AdditionalDocumentsAssessmentLayout
            title="Environment and fire"
            description={`Use this assessment to document risks and mitigations associated with environment and fire.`}
            previousAssessments={[]}
            onReviewAssessment={handleReviewAssessment}
            assessmentType="environmental"
        />
    );
};

export default EnvironmentFireAssessment;
