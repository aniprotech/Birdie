import { useGlobalStore } from '../../../../../stores/useGlobalStore';
import AdditionalDocumentsAssessmentLayout from '../components/AdditionalDocumentsAssessmentLayout';

const CovidAssessment = () => {
    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : 'the client';



    const handleReviewAssessment = () => {
        console.log('Opening review assessment form');
    };


    const defaultTasks = [
        {
            id: 1,
            title: 'COVID-19 symptom check',
            description: 'Monitor and record any COVID-19 symptoms, including temperature checks and general health observations.',
            frequency: 'DAILY',
            timing: 'Morning, Evening'
        },
        {
            id: 2,
            title: 'Infection control measures',
            description: 'Ensure all necessary infection control measures are in place and being followed correctly.',
            frequency: 'DAILY',
            timing: 'Throughout shift'
        }
    ];

    return (
        <AdditionalDocumentsAssessmentLayout
            title="COVID-19"
            description={`Use this assessment to document the risk and impact of COVID-19 for ${clientName}.`}
            previousAssessments={[]}
            onReviewAssessment={handleReviewAssessment}
            assessmentType="covid"
        />
    );
};

export default CovidAssessment; 