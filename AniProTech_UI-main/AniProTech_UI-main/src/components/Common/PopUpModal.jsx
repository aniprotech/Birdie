import { useState } from "react";
import PropTypes from "prop-types";
import { X, Calendar, Clock } from "lucide-react";
import DropdownField from "../DropdownInput/Dropdown";
import { cancelledByOptions, reasonOptions, fundingOptions, rateOptions } from "../../constants/clientVisit";

const PopUpModal = ({ isOpen, onClose, title, description, confirmText, onConfirm, modalType }) => {
    const [formData, setFormData] = useState({
        cancellationDate: "12 Jun 2025",
        cancellationTime: "06:42 AM",
        cancelledBy: "CLIENT",
        reason: "",
        pay: "DONT_PAY",
        invoice: "INVOICE_PAYER",
        notes: "",
        funding: "",
        payRate: "",
        chargeRate: "",
    });

    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const handleInputChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (modalType === "cancel") {
            if (!formData.reason) {
                newErrors.reason = "Please select a reason";
            }
        } else if (modalType === "funding") {
            if (!formData.funding) {
                newErrors.funding = "Please select funding";
            }
        } else if (modalType === "rate") {
            if (!formData.payRate) {
                newErrors.payRate = "Please select pay rate";
            }
            if (!formData.chargeRate) {
                newErrors.chargeRate = "Please select charge rate";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleConfirm = () => {
        if (validateForm()) {
            onConfirm(formData);
        }
    };

    const stripSeconds = (time) => {
        if (!time) return "";
        return time.length === 8 ? time.slice(0, 5) : time; // "HH:mm:ss" -> "HH:mm"
    };

    const renderCancelContent = () => (
        <div className="space-y-6">
            <p className="text-sm text-gray-600">
                Cancelling this visit will remove it from the carer app. Tasks and medications need to be removed if you want to re-assign them to
                another visit.
            </p>

            {/* Cancellation requested */}
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Cancellation requested on<span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <input
                            type="date"
                            value={formData.cancellationDate}
                            onChange={(e) => handleInputChange("cancellationDate", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                        {/* <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" /> */}
                    </div>
                    <div className="relative">
                        <input
                            type="time"
                            value={stripSeconds(formData.cancellationTime)}
                            onChange={(e) => handleInputChange("cancellationTime", e.target.value)}
                            className={`w-full cursor-pointer rounded-md border px-3 py-2 text-sm ${"border-gray-300"}`}
                        />
                        {/* <input
                            type="time"
                            value={formData.cancellationTime}
                            onChange={(e) => handleInputChange('cancellationTime', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                        <Clock className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" /> */}
                    </div>
                </div>
            </div>

            {/* Cancelled by and Reason */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <DropdownField
                        label="Cancelled by"
                        name="cancelledBy"
                        value={formData.cancelledBy}
                        options={cancelledByOptions}
                        valueChange={(option) => handleInputChange("cancelledBy", option.value)}
                        required
                    />
                </div>
                <div>
                    <DropdownField
                        label="Reason"
                        name="reason"
                        value={formData.reason}
                        options={reasonOptions}
                        valueChange={(option) => handleInputChange("reason", option.value)}
                        required
                        error={errors.reason}
                    />
                    {/* {errors.reason && (
                        <div className="mt-1 flex items-center text-sm text-red-600">
                            <span className="mr-1">⚠</span>
                            {errors.reason}
                        </div>
                    )} */}
                </div>
            </div>

            {/* Pay and Invoice */}
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700">
                        Pay<span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="pay"
                                value="pay_carer"
                                checked={formData.pay === "pay_carer"}
                                onChange={(e) => handleInputChange("pay", e.target.value)}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Pay carer</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="pay"
                                value="dont_pay"
                                checked={formData.pay === "dont_pay"}
                                onChange={(e) => handleInputChange("pay", e.target.value)}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Don't pay carer</span>
                        </label>
                    </div>
                </div>
                <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700">
                        Invoice<span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="invoice"
                                value="invoice_payer"
                                checked={formData.invoice === "invoice_payer"}
                                onChange={(e) => handleInputChange("invoice", e.target.value)}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Invoice payer</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="invoice"
                                value="dont_invoice"
                                checked={formData.invoice === "dont_invoice"}
                                onChange={(e) => handleInputChange("invoice", e.target.value)}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Don't invoice payer</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Add any additional notes..."
                    rows={4}
                    className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
            </div>
        </div>
    );

    const renderFundingContent = () => (
        <div className="space-y-6">
            <p className="text-sm text-gray-600">{description}</p>
            <div>
                <DropdownField
                    label="Funding"
                    name="funding"
                    value={formData.funding}
                    options={fundingOptions}
                    valueChange={(option) => handleInputChange("funding", option.value)}
                    required
                    error={errors.funding}
                />
            </div>
        </div>
    );

    const renderRateContent = () => (
        <div className="space-y-6">
            <p className="text-sm text-gray-600">{description}</p>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <DropdownField
                        label="Pay rate"
                        name="payRate"
                        value={formData.payRate}
                        options={rateOptions}
                        valueChange={(option) => handleInputChange("payRate", option.value)}
                        required
                        error={errors.payRate}
                    />
                </div>
                <div>
                    <DropdownField
                        label="Charge rate"
                        name="chargeRate"
                        value={formData.chargeRate}
                        options={rateOptions}
                        valueChange={(option) => handleInputChange("chargeRate", option.value)}
                        required
                        error={errors.chargeRate}
                    />
                </div>
            </div>
        </div>
    );

    const renderDefaultContent = () => (
        <div className="space-y-6">
            <p className="text-sm text-gray-600">{description}</p>
        </div>
    );

    const getModalContent = () => {
        switch (modalType) {
            case "cancel":
                return renderCancelContent();
            case "funding":
                return renderFundingContent();
            case "rate":
                return renderRateContent();
            default:
                return renderDefaultContent();
        }
    };

    const getButtonText = () => {
        switch (modalType) {
            case "cancel":
                return "Cancel visit";
            default:
                return confirmText;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-6">
                    <h2 className="poppins-medium text-lg text-customBlack">{title}</h2>
                    <button
                        className="p-1 text-gray-400 hover:text-gray-600"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">{getModalContent()}</div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-gray-200 p-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                        Dismiss
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                    >
                        {getButtonText()}
                    </button>
                </div>
            </div>
        </div>
    );
};

PopUpModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    confirmText: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    modalType: PropTypes.string,
};

PopUpModal.defaultProps = {
    modalType: "default",
};

export default PopUpModal;
