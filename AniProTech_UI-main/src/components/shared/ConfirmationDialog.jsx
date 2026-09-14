import PropTypes from 'prop-types';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[400px] p-6 shadow-lg">
        <h2 className="text-center text-sm font-medium text-customBlack1 mb-5">{title}</h2>
        
        <div className="flex flex-col justify-between items-center gap-3">
          <button
            onClick={onConfirm}
            className="w-fit py-2 px-4 bg-customDropdownBorder text-white rounded font-medium hover:bg-customDropdownBorder/80 transition-colors"
          >
            Delete
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-2 px-4 text-customTextLightNavy font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmationDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export default ConfirmationDialog; 