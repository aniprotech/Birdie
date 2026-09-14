import React from "react";

const DeleteBookingPopUp = ({handleDeleteBooking,handleViewAbsenceDetails,setSelectedBooking }) => {
    return (
        <div>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="rounded bg-white p-6 shadow-lg">
                    <h2 className="mb-4 text-lg font-semibold">Booking Options</h2>
                    <div className="flex flex-col space-y-4">
                        <button
                            onClick={handleDeleteBooking}
                            className="rounded bg-red-500 px-4 py-2 text-sm text-white"
                        >
                            Delete Booking
                        </button>
                        <button
                            onClick={handleViewAbsenceDetails}
                            className="rounded bg-blue-500 px-4 py-2 text-sm text-white"
                        >
                            View Absence Details
                        </button>
                        <button
                            onClick={() => setSelectedBooking(null)}
                            className="rounded bg-gray-300 px-4 py-2 text-sm text-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteBookingPopUp;
