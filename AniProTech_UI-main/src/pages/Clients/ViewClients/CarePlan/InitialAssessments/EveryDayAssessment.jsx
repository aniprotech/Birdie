import { useGlobalStore } from '../../../../../stores/useGlobalStore';
import AssessmentLayout from '../components/AssessmentLayout';

const EveryDayAssessment = () => {
    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : 'the client';

    const handleReviewAssessment = () => {
        console.log('Opening review assessment form');
    };


    return (
        <AssessmentLayout
            title="Everyday activities"
            description={`Capture outcomes, tasks and risks related to ${clientName}'s everyday activities and routines.`}
            previousAssessments={[]}
            onReviewAssessment={handleReviewAssessment}
            assessmentType="everyday_activities"
        />
    );
};

export default EveryDayAssessment;