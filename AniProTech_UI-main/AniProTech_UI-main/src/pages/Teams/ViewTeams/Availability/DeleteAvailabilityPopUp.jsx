import React, { useRef, useState } from "react";
import { format } from "date-fns";
import { fetchData } from "../../../../utils/FetchData";
import APIConfig from "../../../../utils/ApiConfig";
import { _deleteWithBody } from "../../../../utils/ApiService";
import { useClickOutside } from "../../../../hooks/use-click-outside";
import InnerLoader from "../../../../components/Loader/InnerLoader";
import { AlertTriangle, Clock, RefreshCcw } from "lucide-react";
import { calculateDuration } from "../../../../utils/common";
import { showSuccess } from "../../../../utils/toaster";
import { useGlobalStore } from "../../../../stores/useGlobalStore";

const DeleteAvailabilityPopUp = ({
    selectedAvailability,
    handleDeleteAvailability,
    setSelectedAvailability,
    selectedDate,
    selectedAvailabilityDate,
}) => {
    const [deleteOption, setDeleteOption] = useState("single");
    const [loading, setLoading] = useState(false);
    const popupRef = useRef(null);
    const btnRef = useRef(null);
    const { teamsPersonalDetailData } = useGlobalStore();

    useClickOutside([popupRef, btnRef], () => setSelectedAvailability(null));

    const isValidDate = (date) => {
        const d = new Date(date);
        return d instanceof Date && !isNaN(d);
    };

    if (!selectedAvailability) return null;

    const handleDelete = async () => {
        const payload = {
            deletedDate: deleteOption === "single" ? selectedDate : null,
        };

        const response = await fetchData(
            (data) => _deleteWithBody(APIConfig?.TEAMS?.TEAM_AVAILABILITY_DELETE(selectedAvailability?.id), data),
            null,
            setLoading,
            null,
            payload,
            false,
        );

        if (response?.data?.error === false) {
            showSuccess(response?.data?.message);
            handleDeleteAvailability();
        }
    };

    const formattedDate = isValidDate(selectedAvailabilityDate) ? format(new Date(selectedAvailabilityDate), "EEEE dd MMMM") : "N/A";

    return (
        <div
            ref={popupRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
        >
            <div
                ref={btnRef}
                className="w-full max-w-xl rounded border border-gray-300 bg-white shadow-xl sm:max-w-lg md:max-w-2xl"
            >
                <h2 className="poppins-medium mb-4 border-b p-6 pb-5 text-lg text-customDefaultTextColor">Delete availability</h2>

                <div className="px-3 md:px-6">
                    {/* Warning */}
                    <div className="mb-4 flex items-center gap-3 border border-yellow-300 bg-[#FFF8D6] px-2 py-2 text-sm leading-5 text-[#844F00] md:px-8 md:py-4">
                        <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0" />
                        <span>
                            {`Deleting availability will automatically remove ${teamsPersonalDetailData?.firstName ? teamsPersonalDetailData?.firstName : "the carer"} from assigned visits. You will need to re-assign alternative carers.`}
                        </span>
                    </div>

                    {/* Frequency and Time info */}
                    <div className="mb-5 space-y-2 rounded-md border bg-gray-100 p-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                            <RefreshCcw className="h-4 w-4 text-gray-500" />
                            Frequency: Every 1 day
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-customTextGrey" />
                            Available times: {selectedAvailability?.startTime?.slice(0, 5)} to {selectedAvailability?.endTime?.slice(0, 5)} (
                            {calculateDuration(selectedAvailability?.startTime, selectedAvailability?.endTime)})
                        </div>
                    </div>

                    {/* Radio Options */}
                    <div className="space-y-3 text-sm text-gray-800">
                        <label
                            className={`block w-full cursor-pointer rounded-md border p-4 ${
                                deleteOption === "single" ? "border-customBorder bg-gray-50" : "border-gray-300"
                            }`}
                        >
                            <input
                                type="radio"
                                name="delete-option"
                                value="single"
                                checked={deleteOption === "single"}
                                onChange={() => setDeleteOption("single")}
                                className="mr-3 h-4 w-4 accent-customDropdownBorder"
                            />
                            <div className="inline-block align-middle leading-7">
                                <div className="font-medium">This instance only</div>
                                <div className="text-sm text-gray-500">Changes will be applied to {formattedDate} only.</div>
                            </div>
                        </label>

                        <label
                            className={`block w-full cursor-pointer rounded-md border p-4 ${
                                deleteOption === "all" ? "border-customBorder bg-gray-50" : "border-gray-300"
                            }`}
                        >
                            <input
                                type="radio"
                                name="delete-option"
                                value="all"
                                checked={deleteOption === "all"}
                                onChange={() => setDeleteOption("all")}
                                className="mr-3 h-4 w-4 accent-customDropdownBorder"
                            />
                            <div className="inline-block align-middle leading-7">
                                <div className="font-medium">This and following instances in the schedule</div>
                                <div className="text-sm text-gray-500">Changes will be applied to all instances as per the schedule you created.</div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex justify-end gap-2 border-t p-6">
                    <button
                        onClick={handleDeleteAvailability}
                        className="rounded border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="rounded bg-customDropdownBorder px-5 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? (
                            <InnerLoader
                                loading
                                text="Deleting..."
                            />
                        ) : (
                            "Delete availability"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteAvailabilityPopUp;
