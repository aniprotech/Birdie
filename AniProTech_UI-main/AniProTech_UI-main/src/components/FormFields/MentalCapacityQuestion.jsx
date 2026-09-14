import React from 'react';
import PropTypes from 'prop-types';
import { useField } from 'formik';
import TextAreaField from '../TextInput/TextAreaField';
import StatusToggleButtonGroup from '../TextInput/StatusToggleButtonGroup';

const MentalCapacityQuestion = ({ field, clientName = 'the client' }) => {
    const [mainField] = useField(field.id);
    const [detailsField] = useField(`${field.id}_details`);

    // Replace placeholders in text
    const processText = (text) => {
        return text?.replace(/{{firstname}}/g, clientName)
                   ?.replace(/{{assessment-title}}/g, 'Mental Capacity Assessment');
    };

    // Check if the question should be visible based on dependencies
    const isVisible = () => {
        if (!field.dependencies) return true;

        return Object.entries(field.dependencies).every(([key, value]) => {
            const [dependentField] = useField(key);
            return dependentField.value === value;
        });
    };

    if (!isVisible()) return null;

    return (
        <div className="mb-4">
            <div className="mb-2">
                <div className="font-medium">{processText(field.title)}</div>
                {field.subtitle && (
                    <ul className="mt-2 ml-4">
                        {field.subtitle.map((item, index) => (
                            <li key={index} className="text-gray-600">{processText(item)}</li>
                        ))}
                    </ul>
                )}
            </div>
            
            {field.answer_type.type === 'boolean' && (
                <div>
                    <StatusToggleButtonGroup
                        name={field.id}
                        label={processText(field.answer_type.label || field.title)}
                        value={mainField.value}
                        onChange={mainField.onChange}
                    />
                    <div className="mt-2">
                        <TextAreaField
                            name={`${field.id}_details`}
                            label="Additional Details"
                            value={detailsField.value || ''}
                            placeholder="Enter additional details..."
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

MentalCapacityQuestion.propTypes = {
    field: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        subtitle: PropTypes.arrayOf(PropTypes.string),
        answer_type: PropTypes.shape({
            type: PropTypes.string.isRequired,
            label: PropTypes.string,
            variant: PropTypes.string,
            choices: PropTypes.arrayOf(PropTypes.shape({
                choice_id: PropTypes.string,
                label: PropTypes.string
            }))
        }).isRequired,
        dependencies: PropTypes.object
    }).isRequired,
    clientName: PropTypes.string
};

export default MentalCapacityQuestion; 