import { useGlobalStore } from '../../../../../stores/useGlobalStore';
import AdditionalDocumentsAssessmentLayout from '../components/AdditionalDocumentsAssessmentLayout';

const BehaviorAssessment = () => {
    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : 'the client';

    const handleReviewAssessment = () => {
        console.log('Opening review assessment form');
    };

    return (
        <AdditionalDocumentsAssessmentLayout
            title="Behaviour assessment"
            description={`Capture outcomes, tasks and risks related to ${clientName}'s behavioral needs and support requirements.`}
            previousAssessments={[]}
            onReviewAssessment={handleReviewAssessment}
            assessmentType="behaviour"
        />
    );
};

export default BehaviorAssessment; 