import { ChevronLeft, ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { useNavigationHelpers } from "../../../../../hooks/useNavigationHelpers";
import { useGlobalStore } from "../../../../../stores/useGlobalStore";
import DropdownField from "../../../../../components/DropdownInput/Dropdown";
import TimeRangeField from "../../../../../components/DateRange/TimeRangeField";
import ExpirySelector from "../../../../../components/DateRange/ExpirySelector";
import ScheduleTimeLine from "./ScheduleTimeLine";
import { moreOptions, carerOptions, getModalContent } from "../../../../../constants/clientVisit";
import PopUpModal from "../../../../../components/Common/PopUpModal";

const ScheduleEdit = () => {
    const { navigate } = useNavigationHelpers();
    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData?.firstName || "Dummy";

    const [internalError, setInternalError] = useState(null);
    const [startTime, setStartTime] = useState("09:00 AM");
    const [endTime, setEndTime] = useState("09:30 AM");
    const [expiryDate, setExpiryDate] = useState(null);
    const [isNeverExpires, setIsNeverExpires] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("");
    const [showMoreOptions, setShowMoreOptions] = useState(false);
    const [carersRequired, setCarersRequired] = useState("1");

    // New state for save modal
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [saveOption, setSaveOption] = useState("schedule"); // "schedule" or "single"

    const handleMoreOptionSelect = (option) => {
        if (option.value === "history") {
            setModalType("history");
            setShowMoreOptions(false);
            return;
        }
        setModalType(option.value);
        setShowModal(true);
        setShowMoreOptions(false);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setModalType("");
    };

    const handleSaveChanges = () => {
        setShowSaveModal(true);
    };

    const handleSaveConfirm = async () => {
        try {
            // Prepare the data to save
            const visitData = {
                startTime,
                endTime,
                expiryDate,
                isNeverExpires,
                carersRequired,
                // Add other form data as needed
            };

            // Call your API based on the save option
            if (saveOption === "schedule") {
                // Save to all visits in the schedule
                await saveToSchedule(visitData);
            } else {
                // Save to this visit only
                await saveToSingleVisit(visitData);
            }

            // Close modal and show success message
            setShowSaveModal(false);
            // You might want to show a success toast or navigate back
            // navigate(-1);
        } catch (error) {
            console.error("Error saving changes:", error);
            // Handle error - show error message to user
        }
    };

    const handleSaveCancel = () => {
        setShowSaveModal(false);
    };

    // Mock API functions - replace with your actual API calls
    const saveToSchedule = async (data) => {
        // API call to save changes to all visits in the schedule
        console.log("Saving to entire schedule:", data);
    };

    const saveToSingleVisit = async (data) => {
        // API call to save changes to current visit only
        console.log("Saving to single visit:", data);
    };

    return (
        <div className="mx-auto max-w-6xl bg-white p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="poppins-medium flex items-center text-sm text-customTextLightNavy"
                >
                    <ChevronLeft
                        size={20}
                        className="mr-1"
                    />
                    Back
                </button>
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <button
                            className="poppins-medium flex items-center text-sm text-gray-600"
                            onClick={() => setShowMoreOptions(!showMoreOptions)}
                        >
                            More options{" "}
                            <ChevronDown
                                size={16}
                                className="ml-1"
                            />
                        </button>
                        {showMoreOptions && (
                            <div className="absolute right-0 z-10 mt-2 w-60 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                                {moreOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        className="block w-full px-4 py-2 text-left text-sm text-customBlack hover:bg-gray-100"
                                        onClick={() => handleMoreOptionSelect(option)}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        className="poppins-medium rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={handleSaveChanges}
                    >
                        Save changes
                    </button>
                </div>
            </div>

            {/* Title */}
            <div className="mb-8">
                <h1 className="poppins-medium text-2xl text-gray-900">{clientName}'s morning visit</h1>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-2 gap-8">
                {/* Left Column - Visit Plan */}
                <div>
                    <h2 className="poppins-medium mb-4 text-lg text-gray-900">Visit plan</h2>

                    {/* Empty state */}
                    <div className="mb-6 rounded-md bg-gray-50 px-8 py-28 text-center">
                        <p className="mb-2 text-sm text-gray-500">No tasks or medications added yet</p>
                        <div className="flex items-center justify-center text-sm text-red-600">
                            <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-full border border-red-600">
                                <span className="text-xs">!</span>
                            </div>
                            Please add tasks to this visit.
                        </div>
                    </div>
                </div>

                {/* Right Column - Care Team and When */}
                <div className="space-y-8">
                    {/* Care Team Section */}
                    <div>
                        <h2 className="poppins-medium mb-4 text-lg text-gray-900">Care team</h2>
                        <div className="mb-4">
                            <label className="mb-2 block text-sm text-gray-700">Carers required</label>
                            <div className="w-32">
                                <DropdownField
                                    name="carersRequired"
                                    options={carerOptions}
                                    value={carersRequired}
                                    valueChange={(option) => setCarersRequired(option.value)}
                                    componentName="ScheduleEdit"
                                />
                            </div>
                        </div>
                    </div>

                    {/* When Section */}
                    <div>
                        <h2 className="poppins-medium mb-4 text-lg text-gray-900">When</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm text-gray-700">Date</label>
                                <div className="text-sm text-gray-900">Friday 13 June</div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-gray-700">Frequency</label>
                                <div className="text-sm text-gray-900">Daily</div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-gray-700">Time</label>
                                <TimeRangeField
                                    startTime={startTime}
                                    endTime={endTime}
                                    onStartTimeChange={setStartTime}
                                    onEndTimeChange={setEndTime}
                                    internalError={internalError}
                                    setInternalError={setInternalError}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-gray-700">Ends</label>
                                <ExpirySelector
                                    dueDate={expiryDate}
                                    isNever={isNeverExpires}
                                    onNeverChange={setIsNeverExpires}
                                    onDateChange={setExpiryDate}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activities Timeline */}
            {modalType === "history" && (
                <div className="mt-10">
                    <ScheduleTimeLine
                        onClose={() => setModalType("")}
                        events={[
                            {
                                title: "Visit schedule created",
                                author: "Bhaskar Reddy",
                                time: "6 Jun 2025, 06:45",
                            },
                            {
                                title: "Visit started",
                                author: "Anita Devi",
                                time: "6 Jun 2025, 07:00",
                            },
                            {
                                title: "Visit in progress",
                                author: "Anita Devi",
                                time: "6 Jun 2025, 07:15",
                            },
                            {
                                title: "Visit completed",
                                author: "Anita Devi",
                                time: "6 Jun 2025, 07:30",
                            },
                        ]}
                    />
                </div>
            )}

            {/* Save Changes Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
                            <h3 className="poppins-medium text-lg text-gray-900">Save changes to visit plan</h3>
                            <button
                                onClick={handleSaveCancel}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="flex items-start space-x-3">
                                    <input
                                        type="radio"
                                        name="saveOption"
                                        value="schedule"
                                        checked={saveOption === "schedule"}
                                        onChange={(e) => setSaveOption(e.target.value)}
                                        className="mt-1 h-4 w-4 text-customDropdownBorder accent-customDropdownBorder focus:ring-teal-500"
                                    />
                                    <div>
                                        <div className="poppins-medium text-sm text-customBlack">This and following visits in the schedule</div>
                                        <div className="text-sm text-customGrey1">
                                            Changes will be applied to all visits as per the schedule you created.
                                        </div>
                                    </div>
                                </label>
                            </div>

                            <div>
                                <label className="flex items-start space-x-3">
                                    <input
                                        type="radio"
                                        name="saveOption"
                                        value="single"
                                        checked={saveOption === "single"}
                                        onChange={(e) => setSaveOption(e.target.value)}
                                        className="mt-1 h-4 w-4 text-customDropdownBorder accent-customDropdownBorder focus:ring-teal-500"
                                    />
                                    <div>
                                        <div className="poppins-medium text-sm text-customBlack">This visit only</div>
                                        <div className="text-sm text-customGrey1">Changes will be applied to the 09:00 visit on Friday 13 June</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3 border-t border-gray-200 pt-4">
                            <button
                                onClick={handleSaveCancel}
                                className="poppins-medium rounded px-4 py-2 text-sm text-customTextLightNavy hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveConfirm}
                                className="poppins-medium rounded bg-customDropdownBorder px-6 py-2 text-sm text-white hover:bg-teal-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Original Modal */}
            {showModal && modalType !== "history" && (
                <PopUpModal
                    isOpen={showModal}
                    modalType={modalType}
                    onClose={handleModalClose}
                    title={getModalContent().title}
                    description={getModalContent().description}
                    confirmText={getModalContent().confirmText}
                    onConfirm={handleModalClose}
                />
            )}
        </div>
    );
};

export default ScheduleEdit;
