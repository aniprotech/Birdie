import { useGlobalStore } from '../../../../../stores/useGlobalStore';
import AdditionalDocumentsAssessmentLayout from '../components/AdditionalDocumentsAssessmentLayout';

const CommunicationAssessment = () => {
  const { clientsPersonalDetailData } = useGlobalStore();
  const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : 'the client';



  const handleReviewAssessment = () => {
    console.log('Opening review assessment form');
  };

 

  return (
    <AdditionalDocumentsAssessmentLayout
      title="Communication assessment"
      description={`Capture outcomes, tasks and risks related to ${clientName}'s communication needs and preferences.`}
      previousAssessments={[]}
      onReviewAssessment={handleReviewAssessment}
      assessmentType="communication"
    />
  );
};

export default CommunicationAssessment; 