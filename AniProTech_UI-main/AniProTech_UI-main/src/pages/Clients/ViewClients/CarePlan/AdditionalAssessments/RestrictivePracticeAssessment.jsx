import { useGlobalStore } from '../../../../../stores/useGlobalStore';
import AdditionalDocumentsAssessmentLayout from '../components/AdditionalDocumentsAssessmentLayout';
import AssessmentLayout from '../components/AssessmentLayout';

const RestrictivePracticeAssessment = () => {
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
        // {
        //     id: 1,
        //     title: 'Practice monitoring',
        //     description: 'Monitor and document any use of restrictive practices, ensuring compliance with approved protocols and legal requirements.',
        //     frequency: 'DAILY',
        //     timing: 'Each occurrence'
        // },
        // {
        //     id: 2,
        //     title: 'Alternative strategies review',
        //     description: 'Review and implement alternative strategies to minimize the use of restrictive practices where possible.',
        //     frequency: 'WEEKLY',
        //     timing: 'Team meetings'
        // }
    ];

    return (
        <AdditionalDocumentsAssessmentLayout
            title="Restrictive practice"
            description={`Use this assessment to record any restrictive practices that have been put in place.`}
            previousAssessments={[]}
            onSaveChanges={handleSaveChanges}
            onReviewAssessment={handleReviewAssessment}
            defaultTasks={defaultTasks}
            onAddRisk={handleAddRisk}
        />
    );
};

export default RestrictivePracticeAssessment; 