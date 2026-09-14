import AdditionalDocumentsAssessmentLayout from "../components/AdditionalDocumentsAssessmentLayout";

const DrainageAssessment = () => {
    const handleReviewAssessment = () => {
        console.log("Opening review assessment form");
    };

    return (
        <AdditionalDocumentsAssessmentLayout
            title="Dysphagia"
            description={`Use this assessment to assess risk of dysphagia and plan how these risks can be managed. The IDDSI Framework can be found here.`}
            previousAssessments={[]}
            onReviewAssessment={handleReviewAssessment}
            assessmentType="dysphagia"
        />
    );
};

export default DrainageAssessment;
