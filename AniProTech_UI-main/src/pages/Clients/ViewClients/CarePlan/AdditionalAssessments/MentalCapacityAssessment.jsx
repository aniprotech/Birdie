import React from 'react';
import { useGlobalStore } from '../../../../../stores/useGlobalStore';
import AdditionalDocumentsAssessmentLayout from '../components/AdditionalDocumentsAssessmentLayout';
import MentalCapacitySection from '../../../../../components/FormFields/MentalCapacitySection';
import { MENTAL_CAPACITY_QUESTIONS } from '../../../../../constants/assessmentQuestions/mentalCapacityQuestion';

const MentalCapacityAssessment = () => {
    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : 'the client';

    // Define sections based on the questions
    const sections = [
        { id: 'capacity_details', label: 'Capacity Details' },
        { id: 'conclusion', label: 'Conclusion' },
        { id: 'best_interest_decision', label: 'Best Interest Decision' },
        { id: 'circumstances', label: 'Circumstances' },
        { id: 'consultation', label: 'Consultation' },
        { id: 'imca', label: 'IMCA' },
        { id: 'options', label: 'Options' },
        { id: 'final_decision', label: 'Final Decision' },
        { id: 'review', label: 'Review' }
    ];

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

    return (
        <AdditionalDocumentsAssessmentLayout
            title="Mental Capacity Assessment"
            description="Use this assessment to help determine mental capacity and make best interest decisions."
            previousAssessments={[]}
            onSaveChanges={handleSaveChanges}
            onReviewAssessment={handleReviewAssessment}
            defaultTasks={[]}
            onAddRisk={handleAddRisk}
        >
            {sections.map(section => (
                <MentalCapacitySection
                    key={section.id}
                    section={section}
                    questions={MENTAL_CAPACITY_QUESTIONS}
                    clientName={clientName}
                />
            ))}
        </AdditionalDocumentsAssessmentLayout>
    );
};

export default MentalCapacityAssessment; 