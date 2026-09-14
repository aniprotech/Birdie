import React from 'react';
import PropTypes from 'prop-types';
import MentalCapacityQuestion from './MentalCapacityQuestion';

const MentalCapacitySection = ({ section, questions, clientName }) => {
    // Filter questions that belong to this section
    const sectionQuestions = questions.filter(q => q.section_id === section.id);

    // Check if any questions in this section should be visible
    const hasVisibleQuestions = sectionQuestions.some(question => {
        if (!question.dependencies) return true;
        return Object.entries(question.dependencies).every(([key, value]) => {
            const formValue = window.formik?.values[key]; // Access Formik values
            return formValue === value;
        });
    });

    if (!hasVisibleQuestions) return null;

    return (
        <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">{section.label}</h3>
            {sectionQuestions.map((question) => (
                <MentalCapacityQuestion
                    key={question.id}
                    field={question}
                    clientName={clientName}
                />
            ))}
        </div>
    );
};

MentalCapacitySection.propTypes = {
    section: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired
    }).isRequired,
    questions: PropTypes.arrayOf(PropTypes.object).isRequired,
    clientName: PropTypes.string
};

export default MentalCapacitySection; 