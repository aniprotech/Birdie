import React, { useRef, useEffect } from "react";
import { X } from "lucide-react";
import { useClickOutside } from "../hooks/use-click-outside";
import useDisableScroll from "../hooks/useDisableScroll";

const DownloadInfoModal = ({ isOpen, onClose, clientName, onDownload }) => {
    const modalRef = useRef(null);

    useClickOutside([modalRef], onClose);
    // useDisableScroll();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div
                ref={modalRef}
                className="w-full max-w-xl rounded bg-white p-6 shadow-lg"
            >
                {/* Header with close button */}
                <div className="flex items-center justify-between border-b border-customBorder pb-4">
                    <h2 className="poppins-medium text-customBlack text-base">Download {clientName}&apos;s care information</h2>
                    <button
                        onClick={onClose}
                        className="text-customGrey1 hover:text-customBlack"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Description */}
                <p className="text-customGrey1 mt-4 text-sm">
                    Before proceeding, please select what care information you&apos;d like to download and/or print.
                </p>

                {/* Options */}
                <div className="mt-6 space-y-4">
                    {/* Basic Information */}
                    <label className="flex items-start gap-3">
                        <div className="flex h-5 items-center">
                            <input
                                type="radio"
                                name="downloadType"
                                value="basic"
                                className="h-4 w-4 accent-customTextLightNavy"
                                defaultChecked
                            />
                        </div>
                        <div>
                            <div className="text-customTextLightNavy/90 text-sm">Basic information</div>
                            <div className="text-customGrey1 text-sm">
                                This includes {clientName}&apos;s critical information, including their address, current medication, and GP details.
                            </div>
                        </div>
                    </label>

                    {/* Care Log */}
                    <label className="flex items-start gap-3">
                        <div className="flex h-5 items-center">
                            <input
                                type="radio"
                                name="downloadType"
                                value="carelog"
                                className="h-4 w-4 accent-customTextLightNavy"
                            />
                        </div>
                        <div>
                            <div className="text-customTextLightNavy/90 text-sm">Care Log</div>
                            <div className="text-customGrey1 text-sm">This will download all log entries from the last 7 days.</div>
                        </div>
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end gap-4 border-t border-customBorder pt-4">
                    <button
                        onClick={onClose}
                        className="rounded-md px-4 py-2 text-sm text-customNavy hover:bg-gray-50"
                    >
                        Close
                    </button>
                    <button
                        onClick={onDownload}
                        className="rounded bg-customDropdownBorder px-4 py-2 text-sm text-white hover:bg-customDropdownBorder/90"
                    >
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DownloadInfoModal;
