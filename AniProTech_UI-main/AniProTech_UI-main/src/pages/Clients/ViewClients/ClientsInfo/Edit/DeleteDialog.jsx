import PropTypes from "prop-types";

const DeleteDialog = ({ open, onClose, onDelete, data }) => {
  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg poppins-medium text-customBlack border-b pb-2">Delete this inactivity period?</h2>

        {data.type && (
          <p className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-sm font-medium text-gray-800">
            {data.type}{data.reason && ` - ${data.reason}`}
          </p>
        )}

        {data.note && (
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-medium text-gray-700">Note</span><br />{data.note}
          </p>
        )}

        <div className="mt-4 flex space-x-8 text-sm text-gray-900">
          {data.startDate && data.startTime && (
            <div>
              <p className="text-xs font-semibold text-gray-500">Starting</p>
              <p>{data.startDate}, {data.startTime}</p>
            </div>
          )}
          {data.type === "Temporary" && data.endDate && data.endTime && (
            <div>
              <p className="text-xs font-semibold text-gray-500">Ending</p>
              <p>{data.endDate}, {data.endTime}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-4 border-t pt-4">
          <button
            onClick={onClose}
            className="text-sm font-medium text-customTextLightNavy hover:underline"
          >
            No, keep it
          </button>
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="rounded bg-customDropdownBorder px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Yes, delete it
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
};


export default DeleteDialog;