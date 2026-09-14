import { useGlobalStore } from '../../../../../stores/useGlobalStore';
import AdditionalDocumentsAssessmentLayout from '../components/AdditionalDocumentsAssessmentLayout';
import AssessmentLayout from '../components/AssessmentLayout';

const MovingHandlingAssessment = () => {
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
        <AdditionalDocumentsAssessmentLayout
            title="Moving and handling"
            description={`Use this assessment to record someone's level of independence and identify any risks or needs during movement.`}
            previousAssessments={[]}
            onSaveChanges={handleSaveChanges}
            onReviewAssessment={handleReviewAssessment}
            defaultTasks={[]}
            onAddRisk={handleAddRisk}
        />
    );
};

export default MovingHandlingAssessment; 