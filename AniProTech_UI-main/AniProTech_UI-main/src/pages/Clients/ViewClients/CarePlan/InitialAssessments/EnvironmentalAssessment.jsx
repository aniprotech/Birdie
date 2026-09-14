import { useGlobalStore } from "../../../../../stores/useGlobalStore";
import AssessmentLayout from "../components/AssessmentLayout";

const EnvironmentalAssessment = () => {
    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : "the client";

    const handleReviewAssessment = () => {
        console.log("Opening review assessment form");
    };

    return (
        <AssessmentLayout
            title="Environmental assessment"
            description={`Capture outcomes, tasks and risks related to ${clientName}'s environmental needs and safety.`}
            previousAssessments={[]}
            onReviewAssessment={handleReviewAssessment}
            assessmentType="environmental"
        />
    );
};

export default EnvironmentalAssessment;
