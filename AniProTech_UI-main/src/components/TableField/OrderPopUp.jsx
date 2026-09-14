import { useState } from "react";
import { FcHighPriority } from "react-icons/fc";
import { _post } from "../../../utils/ApiService";
import { toast } from "react-toastify";
import { showError, showSuccess } from "../../utils/toaster";

const OrderPopUp = ({ order, status, user, onClose, onConfirm,fetchOrderList ,setEditingItem}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirmChange = async () => {
    setLoading(true);
    try {
      const respones = await _post("/order/order-status-update", {
        orderId: order?.id,
        orderStatus: status,
        userId: user?.id,
      });
      await fetchOrderList();
      toast.dismiss();
      showSuccess(respones.data.message);
      setEditingItem(null);
      onConfirm();
    } catch (error) {
      toast.dismiss();
      showError(error.respones.data.message);
      console.error("Order status update failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-customBlack bg-opacity-50 z-50">
      <div className="bg-white p-6 text-center rounded-lg shadow-lg w-72">
        <div className="text-center flex justify-center">
          <FcHighPriority size={40} />
        </div>
        <p className="mt-2 text-xs font-thin text-customBlack">
          Are you sure you want to change the order status to <br />
          <span className="font-bold text-customNavy text-xs">{status}?</span>
        </p>
        <div className="mt-4 flex justify-center">
          <button
            className="px-4 py-1.5 bg-customGrey5 rounded-md mr-2 text-xs"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-1.5 bg-customNavy text-white rounded-md text-xs flex items-center justify-center ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleConfirmChange}
            disabled={loading}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
            ) : null}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPopUp;
