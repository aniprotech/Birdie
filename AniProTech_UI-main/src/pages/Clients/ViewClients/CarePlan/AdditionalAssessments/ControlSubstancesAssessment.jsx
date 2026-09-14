import { useGlobalStore } from '../../../../../stores/useGlobalStore';
import AdditionalDocumentsAssessmentLayout from '../components/AdditionalDocumentsAssessmentLayout';

const ControlSubstancesAssessment = () => {
  const { clientsPersonalDetailData } = useGlobalStore();
  const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : 'the client';



  const handleReviewAssessment = () => {
    console.log('Opening review assessment form');
  };



  return (
    <AdditionalDocumentsAssessmentLayout
      title="Control substances assessment"
      description={`Capture outcomes, tasks and risks related to ${clientName}'s control substances and requirements.`}
      previousAssessments={[]}
      onReviewAssessment={handleReviewAssessment}
      assessmentType="control_substances"
    />
  );
};

export default ControlSubstancesAssessment; 