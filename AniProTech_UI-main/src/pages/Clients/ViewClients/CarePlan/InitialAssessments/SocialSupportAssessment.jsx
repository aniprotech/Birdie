import { useGlobalStore } from '../../../../../stores/useGlobalStore';
import AssessmentLayout from '../components/AssessmentLayout';

const SocialSupportAssessment = () => {
    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : 'the client';

    const handleReviewAssessment = () => {
        console.log('Opening review assessment form');
    };


    return (
        <AssessmentLayout
            title="Social support"
            description={`Capture outcomes, tasks and risks related to ${clientName}'s social support needs.`}
            previousAssessments={[]}
            onReviewAssessment={handleReviewAssessment}
            assessmentType="social_support"
        />
    );
};

export default SocialSupportAssessment;