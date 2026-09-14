import AdditionalDocumentsAssessmentLayout from "../components/AdditionalDocumentsAssessmentLayout";

const EndOfLifeAssessment = () => {
    const handleReviewAssessment = () => {
        console.log("Opening review assessment form");
    };

    return (
        <AdditionalDocumentsAssessmentLayout
            title="End of life"
            description={`Use this assessment to document end of life wishes and preferences.`}
            previousAssessments={[]}
            onReviewAssessment={handleReviewAssessment}
            assessmentType="end_of_life"
        />
    );
};

export default EndOfLifeAssessment;
