import { useGlobalStore } from '../../../../../stores/useGlobalStore';
import AssessmentLayout from '../components/AssessmentLayout';

const NutritionAssessment = () => {
    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : 'the client';



    const handleReviewAssessment = () => {
        console.log('Opening review assessment form');
    };



    return (
        <AssessmentLayout
            title="Nutrition and hydration"
            description={`Capture outcomes, tasks and risks related to ${clientName}'s nutrition and hydration needs.`}
            previousAssessments={[]}
            onReviewAssessment={handleReviewAssessment}
            assessmentType="nutrition_hydration"
        />
    );
};

export default NutritionAssessment;