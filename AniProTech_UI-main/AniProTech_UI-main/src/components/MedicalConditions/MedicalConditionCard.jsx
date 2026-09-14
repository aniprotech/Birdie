import { Trash2, Edit } from 'lucide-react';
import PropTypes from 'prop-types';

const MedicalConditionCard = ({ condition, onEdit, onDelete }) => {
    return (
        <div className="p-4 border rounded-lg bg-white mb-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-medium">{condition.selected_term}</h3>
                    <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                            {condition.impact || "No impact details provided"}
                        </p>
                        <p className="text-sm text-gray-600">
                            {condition.support || "No support details provided"}
                        </p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onEdit(condition)}
                        className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                        aria-label="Edit condition"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => onDelete(condition)}
                        className="p-2 text-red-600 hover:text-red-700 transition-colors"
                        aria-label="Delete condition"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

MedicalConditionCard.propTypes = {
    condition: PropTypes.shape({
        id: PropTypes.string.isRequired,
        selected_term: PropTypes.string.isRequired,
        impact: PropTypes.string,
        support: PropTypes.string,
    }).isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default MedicalConditionCard; 