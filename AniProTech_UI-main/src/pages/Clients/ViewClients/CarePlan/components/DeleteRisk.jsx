import PropTypes from "prop-types";
import { X } from "lucide-react";

const DeleteRiskConfirmModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded bg-white shadow-lg">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h3 className="text-base font-semibold text-customBlack">Delete risk and mitigations?</h3>
                    <button onClick={onClose}>
                        <X className="w-5 h-5 text-gray-500 hover:text-black" />
                    </button>
                </div>
                <div className="px-4 py-10 text-sm text-customBlack1">
                    You will not be able to recover it.
                </div>
                <div className="flex justify-end gap-4 border-t px-4 py-2">
                    <button
                        onClick={onClose}
                        className="text-sm text-customNavy hover:underline"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="rounded bg-customDropdownBorder px-4 py-1.5 text-sm text-white hover:bg-customDropdownBorder/90"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

DeleteRiskConfirmModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
};

export default DeleteRiskConfirmModal;
