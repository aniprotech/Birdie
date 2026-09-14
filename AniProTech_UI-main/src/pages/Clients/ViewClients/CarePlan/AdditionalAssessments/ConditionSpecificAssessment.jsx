import { useGlobalStore } from '../../../../../stores/useGlobalStore';
import AdditionalDocumentsAssessmentLayout from '../components/AdditionalDocumentsAssessmentLayout';


const ConditionSpecificAssessment = () => {
  const { clientsPersonalDetailData } = useGlobalStore();
  const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : 'the client';



  const handleReviewAssessment = () => {
    console.log('Opening review assessment form');
  };



  return (
    <AdditionalDocumentsAssessmentLayout
      title="Condition specific assessment"
      description={`Capture outcomes, tasks and risks related to ${clientName}'s specific health conditions and requirements.`}
      previousAssessments={[]}
      onReviewAssessment={handleReviewAssessment}
      assessmentType="condition_specific"
    />
  );
};

export default ConditionSpecificAssessment; 