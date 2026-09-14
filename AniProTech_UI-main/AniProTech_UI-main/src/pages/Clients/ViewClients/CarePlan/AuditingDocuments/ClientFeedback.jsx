import { useState } from 'react';
import { useGlobalStore } from '../../../../../stores/useGlobalStore';
import AuditingAssessmentLayout from './AuditingAssessmentLayout';

const ClientFeedback = () => {
    const [formData, setFormData] = useState({
        serviceQuality: '',
        staffPerformance: '',
        careDelivery: '',
        suggestions: '',
        overallSatisfaction: '',
    });

    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : 'the client';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        // API integration will go here
        console.log('Form submitted:', formData);
    };

    const sampleTasks = [
        {
            id: 1,
            title: 'Collect feedback',
            description: 'Gather detailed feedback about care services, staff interactions, and overall satisfaction. Document any specific concerns or positive experiences mentioned.',
            frequency: 'MONTHLY',
            timing: 'Any convenient time'
        },
        {
            id: 2,
            title: 'Review and action feedback',
            description: 'Review collected feedback with the care team and create action plans for any improvements needed.',
            frequency: 'MONTHLY',
            timing: 'End of month'
        }
    ];

    const previousAssessments = [
        // {
        //   status: 'Review complete',
        //   date: '24th March 2025',
        //   submittedBy: 'Swarnalatha Kontham'
        // }
    ];

    const handleSaveChanges = (summaryText) => {
        console.log('Saving summary:', summaryText);
        // Implement your save logic here
    };

    const handleReviewAssessment = () => {
        console.log('Opening review assessment form');
        // Implement your review logic here
    };

    return (
        <AuditingAssessmentLayout
            title="Client Feedback"
            description={`This form is used to capture client feedback at regular intervals.`}
            previousAssessments={previousAssessments}
            onSaveChanges={handleSaveChanges}
            onReviewAssessment={handleReviewAssessment}
            defaultTasks={sampleTasks}
        />
    );
};

export default ClientFeedback; 