import { useGlobalStore } from '../../../../../stores/useGlobalStore';
import AdditionalDocumentsAssessmentLayout from '../components/AdditionalDocumentsAssessmentLayout';

const SeizuresAssessment = () => {
    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : 'the client';

    const handleSaveChanges = (summaryText) => {
        console.log('Saving summary:', summaryText);
        // Implement your save logic here
    };

    const handleReviewAssessment = () => {
        console.log('Opening review assessment form');
        // Implement your review logic here
    };

    const handleAddRisk = (risk) => {
        console.log('Adding new risk:', risk);
        // Implement risk addition logic here
    };

    const defaultTasks = [
        {
            id: 1,
            title: 'Seizure monitoring',
            description: 'Monitor and document any seizure activity, including duration, type, and post-seizure condition. Note any potential triggers or warning signs.',
            frequency: 'DAILY',
            timing: 'Throughout shift'
        },
        {
            id: 2,
            title: 'Emergency protocol review',
            description: 'Ensure all staff are familiar with seizure emergency protocols and medication administration procedures.',
            frequency: 'WEEKLY',
            timing: 'Team meetings'
        }
    ];

    return (
        <AdditionalDocumentsAssessmentLayout
            title="Seizures"
            description={`Use this assessment for clients who experience epileptic or non-epileptic seizures to provide guidance on how to manage them appropriately.`}
            previousAssessments={[]}
            onSaveChanges={handleSaveChanges}
            onReviewAssessment={handleReviewAssessment}
            defaultTasks={defaultTasks}
            onAddRisk={handleAddRisk}
        />
    );
};

export default SeizuresAssessment; 