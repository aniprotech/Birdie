import { X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import TextField from '../TextInput/TextInput';
import TextAreaField from '../TextInput/TextAreaField';

const EditMedicalConditionDialog = ({ condition, onClose, onSave }) => {
    const formik = useFormik({
        initialValues: {
            selected_term: condition.selected_term || '',
            impact: condition.impact || '',
            support: condition.support || '',
        },
        validationSchema: Yup.object({
            selected_term: Yup.string().required('Condition name is required'),
            impact: Yup.string().required('Impact details are required'),
            support: Yup.string().required('Support details are required'),
        }),
        onSubmit: (values) => {
            onSave({
                ...condition,
                ...values,
            });
        },
    });

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl mx-4 shadow-xl">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {condition.id ? 'Edit condition' : 'Add condition'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                        aria-label="Close dialog"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
                    <div>
                        <TextField
                            label="Condition"
                            name="selected_term"
                            value={formik.values.selected_term}
                            valueChange={formik.handleChange}
                            error={formik.touched.selected_term && formik.errors.selected_term}
                            placeholder="Enter condition name"
                        />
                    </div>

                    <div>
                        <TextAreaField
                            label="What is the impact of this condition?"
                            name="impact"
                            value={formik.values.impact}
                            valueChange={formik.handleChange}
                            error={formik.touched.impact && formik.errors.impact}
                            variant="multi_line"
                            placeholder="Describe the impact..."
                        />
                    </div>

                    <div>
                        <TextAreaField
                            label="How can it be supported?"
                            name="support"
                            value={formik.values.support}
                            valueChange={formik.handleChange}
                            error={formik.touched.support && formik.errors.support}
                            variant="multi_line"
                            placeholder="Describe the support needed..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            // onClick={formik.handleSubmit}
                            className="px-4 py-2 text-sm font-medium text-white bg-customNavy hover:bg-customNavy/90 rounded-md"
                        >
                            {condition.id ? 'Save changes' : 'Add condition'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

EditMedicalConditionDialog.propTypes = {
    condition: PropTypes.shape({
        id: PropTypes.string,
        selected_term: PropTypes.string,
        impact: PropTypes.string,
        support: PropTypes.string,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
};

export default EditMedicalConditionDialog; 