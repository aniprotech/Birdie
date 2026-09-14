import { useState } from "react";
import PropTypes from "prop-types";
import { Plus } from "lucide-react";
import MedicalConditionCard from "../MedicalConditions/MedicalConditionCard";
import EditMedicalConditionDialog from "../MedicalConditions/EditMedicalConditionDialog";

const MedicalConditionsField = ({ field, value = [], onChange }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCondition, setEditingCondition] = useState(null);

    const handleAddClick = () => {
        // setEditingCondition(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (condition) => {
        setEditingCondition(condition);
        setIsDialogOpen(true);
    };

    const handleDelete = (condition) => {
        const newConditions = value.filter((c) => c.id !== condition.id);
        onChange(newConditions);
    };

    const handleSave = (condition) => {
        let newConditions;
        if (editingCondition) {
            // Edit existing condition
            newConditions = value.map((c) => (c.id === condition.id ? condition : c));
        } else {
            // Add new condition
            newConditions = [
                ...value,
                {
                    ...condition,
                    id: Date.now().toString(), // Simple ID generation
                },
            ];
        }
        onChange(newConditions);
        setIsDialogOpen(false);
    };

    return (
        <div className="space-y-4">
            <div className="mb-4 flex items-center justify-between">
                {/* <h3 className="text-lg font-medium">Medical conditions</h3> */}
                <button
                    type="button"
                    onClick={handleAddClick}
                    className="inline-flex items-center gap-2 rounded-md border border-customNavy/50 px-4 py-2 text-sm text-customNavy hover:bg-gray-50 hover:text-customNavy/80"
                >
                    <Plus className="h-4 w-4" />
                    Add condition
                </button>
            </div>

            {value.length > 0 ? (
                <div className="space-y-4">
                    {value.map((condition) => (
                        <MedicalConditionCard
                            key={condition.id}
                            condition={condition}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-lg bg-gray-50 py-8 text-center text-gray-500">No medical conditions added yet</div>
            )}

            {isDialogOpen && (
                <EditMedicalConditionDialog
                    condition={
                        editingCondition || {
                            id: "",
                            selected_term: "",
                            impact: "",
                            support: "",
                        }
                    }
                    onClose={() => setIsDialogOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

MedicalConditionsField.propTypes = {
    field: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string,
        subtitle: PropTypes.string,
    }).isRequired,
    value: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            selected_term: PropTypes.string.isRequired,
            impact: PropTypes.string,
            support: PropTypes.string,
        }),
    ),
    onChange: PropTypes.func.isRequired,
};

export default MedicalConditionsField;
