import { useGlobalStore } from '../../../../../stores/useGlobalStore';
import AssessmentLayout from '../components/AssessmentLayout';

const AdminAssessment = () => {
    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : 'the client';

    const handleReviewAssessment = () => {
        console.log('Opening review assessment form');
    };

    return (
        <AssessmentLayout
            title="Administration"
            description={`Capture outcomes, tasks and risks related to ${clientName}'s administrative needs.`}
            previousAssessments={[]}
            onReviewAssessment={handleReviewAssessment}
            assessmentType="administration"
        />
    );
};

export default AdminAssessment; 