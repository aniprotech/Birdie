import { useGlobalStore } from '../../../../../stores/useGlobalStore';
import AssessmentLayout from '../components/AssessmentLayout';

const MedicalAssessment = () => {
    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : 'the client';

    const handleSaveChanges = (summaryText) => {
        console.log('Saving summary:', summaryText);
        // Implement your save logic here
    };

    const handleReviewAssessment = () => {
        console.log('Opening review assessment form');
        // Implement your review logic here
    };

    const handleAddRisk = (risk) => {
        console.log('Adding new risk:', risk);
        // Implement risk addition logic here
    };

    return (
        <AssessmentLayout
            title="Medical assessment"
            description={`Capture outcomes, tasks and risks related to ${clientName}'s medical needs and health conditions.`}
            previousAssessments={[]}
            onSaveChanges={handleSaveChanges}
            onReviewAssessment={handleReviewAssessment}
            defaultTasks={[]}
            onAddRisk={handleAddRisk}
        />
    );
};

export default MedicalAssessment;