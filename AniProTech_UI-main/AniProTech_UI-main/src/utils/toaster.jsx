// src/utils/toastMessages.js
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

const commonOptions = {
  duration: 3000,
  onClick: () => toast.dismiss(),
  dismissible: true,
  closeOnClick: true,
  style: {
    color: "#fff",
    background: "#1f2937", // dark gray
    fontSize: "15px",
    cursor: "pointer",
    padding: "20px 20px",
    borderRadius: "4px",
  },
};

export const showSuccess = (message) =>
  toast(message, {
    ...commonOptions,
    // No icon
  });

export const showError = (message) =>
  toast.error(message, {
    ...commonOptions,
    icon: (
      <AlertTriangle
        color="#f87171" // soft red
        size={22}
      />
    ),
  });

// Optional: keep info and warning if needed
export const showInfo = (message) =>
  toast.info(message, {
    ...commonOptions,
  });

export const showWarning = (message) =>
  toast.warning(message, {
    ...commonOptions,
    icon: (
      <AlertTriangle
        color="#facc15"
        size={22}
      />
    ),
  });
