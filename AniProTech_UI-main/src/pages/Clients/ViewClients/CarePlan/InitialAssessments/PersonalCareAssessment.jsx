import AssessmentLayout from '../components/AssessmentLayout';
import { useNavigationHelpers } from '../../../../../hooks/useNavigationHelpers';

const PersonalCareAssessment = () => {
const {clientFirstName} = useNavigationHelpers();

  const handleReviewAssessment = () => {
    console.log('Opening review assessment form');
    // Implement your review logic here
  };

  return (
    <AssessmentLayout
      title="Personal care"
      description={`Capture outcomes, tasks and risks related to ${clientFirstName}'s personal care needs.`}
      previousAssessments={[]}
      onReviewAssessment={handleReviewAssessment}
      defaultTasks={[]}
      assessmentType="personal_care"
    />
  );
};

export default PersonalCareAssessment; 