import AdditionalDocumentsAssessmentLayout from "../components/AdditionalDocumentsAssessmentLayout";

const FinancialAssessment = () => {
    const handleReviewAssessment = () => {
        console.log("Opening review assessment form");
    };

    return (
        <AdditionalDocumentsAssessmentLayout
            title="Financial assessment"
            description={`Use this assessment to help identify financial needs.`}
            previousAssessments={[]}
            onReviewAssessment={handleReviewAssessment}
            assessmentType="financial"
        />
    );
};

export default FinancialAssessment;
