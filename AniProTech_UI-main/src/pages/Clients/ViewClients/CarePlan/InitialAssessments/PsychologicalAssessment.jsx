import { useGlobalStore } from "../../../../../stores/useGlobalStore";
import AssessmentLayout from "../components/AssessmentLayout";

const PsychologicalAssessment = () => {
    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : "the client";

    const handleReviewAssessment = () => {
        console.log("Opening review assessment form");
    };

    return (
        <AssessmentLayout
            title="Psychological assessment"
            description={`Capture outcomes, tasks and risks related to ${clientName}'s psychological and emotional wellbeing.`}
            previousAssessments={[]}
            onReviewAssessment={handleReviewAssessment}
            assessmentType="psychological"
        />
    );
};

export default PsychologicalAssessment;
