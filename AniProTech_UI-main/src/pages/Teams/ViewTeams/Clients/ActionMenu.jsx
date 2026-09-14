import { useRef, useState } from "react";
import { MoreVertical, Check } from "lucide-react";
import { useClickOutside } from "../../../../hooks/use-click-outside";
import PropTypes from "prop-types";
import { _put } from "../../../../utils/ApiService";
import APIConfig from "../../../../utils/ApiConfig";
import { showError } from "../../../../utils/toaster";

const TeamsClientsActionMenu = ({ rowId, rowData, clientId, onSuccess }) => {
    const [openMenuId, setOpenMenuId] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [tempUpdates, setTempUpdates] = useState({});
    const wrapperRef = useRef(null);

    const isOpen = openMenuId === rowId;

    // Clicking outside closes the menu
    useClickOutside([wrapperRef], () => setOpenMenuId(null));

    const toggle = (e) => {
        e.stopPropagation(); // Prevent row click
        setOpenMenuId(isOpen ? null : rowId);
        if (!isOpen) {
            setTempUpdates({});
        }
    };

    // Helper function to update care team member status
    const updateCareTeam = async () => {
        if (Object.keys(tempUpdates).length === 0) {
            showError("Please select at least one action to apply");
            return;
        }

        setIsUpdating(true);

        try {
            const completeUpdates = {
                viewAccess: rowData.viewAccess,
                revokeViewaccess: rowData.revokeViewaccess,
                allowedToVisit: rowData.allowedToVisit,
                declineCarer: rowData.declineCarer,
                ...tempUpdates
            };

            const payload = [
                {
                  clientId: rowData.clientId,
                    firstName: rowData.firstName,
                    lastName: rowData.lastName,
                    isActive: rowData.isActive,
                    viewAccess: completeUpdates.viewAccess,
                    revokeViewaccess: completeUpdates.revokeViewaccess,
                    allowedToVisit: completeUpdates.allowedToVisit,
                    declineCarer: completeUpdates.declineCarer,
                },
            ];

            await _put(APIConfig.TEAMS.TEAM_CLIENTS_BULK_UPDATE(clientId), payload);
            
            setOpenMenuId(null);
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error updating care team member:", error);
            showError(error?.response?.data?.message || "Failed to update care team member");
        } finally {
            setIsUpdating(false);
        }
    };

    const onSelectOption = (updateData) => {
        if (isUpdating) return;
        setTempUpdates({ ...tempUpdates, ...updateData });
    };

    return (
        <div
            className="relative"
            ref={wrapperRef}
        >
            <button
                onClick={toggle}
                className="rounded-full p-1 hover:bg-gray-100"
                disabled={isUpdating}
            >
                <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>

            {isOpen && (
                <div
                    onClick={(e) => e.stopPropagation()} // Prevent row click
                    className="absolute right-0 z-50 mt-2 w-64 rounded-lg border bg-white text-sm text-gray-800 shadow-md"
                >
                    {/* Section: View */}
                    <div className="cursor-text border-b px-4 py-2 font-medium text-customTextGrey">View</div>

                    <button
                        onClick={() => onSelectOption({ viewAccess: true, revokeViewaccess: false })}
                        className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-blue-50"
                        disabled={isUpdating}
                    >
                        Grant view access
                        {(tempUpdates.viewAccess || (tempUpdates.viewAccess === undefined && rowData?.viewAccess)) && (
                            <Check className="h-4 w-4 text-green-500" />
                        )}
                    </button>

                    <button
                        onClick={() => onSelectOption({ viewAccess: false, revokeViewaccess: true })}
                        className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-blue-50"
                        disabled={isUpdating}
                    >
                        Revoke view access
                        {(tempUpdates.revokeViewaccess || (tempUpdates.revokeViewaccess === undefined && rowData?.revokeViewaccess)) && (
                            <Check className="h-4 w-4 text-green-500" />
                        )}
                    </button>

                    {/* Section: Exclude */}
                    <div className="cursor-text border-b border-t px-4 py-2 font-medium text-customTextGrey">Exclude</div>

                    <button
                        onClick={() => onSelectOption({ allowedToVisit: true, declineCarer: false })}
                        className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-blue-50"
                        disabled={isUpdating}
                    >
                        Allow carer to visit
                        {(tempUpdates.allowedToVisit || (tempUpdates.allowedToVisit === undefined && rowData?.allowedToVisit)) && (
                            <Check className="h-4 w-4 text-green-500" />
                        )}
                    </button>

                    <button
                        onClick={() => onSelectOption({ declineCarer: true, allowedToVisit: false })}
                        className="flex w-full items-center justify-between px-4 py-2 text-left text-red-600 hover:bg-blue-50"
                        disabled={isUpdating}
                    >
                        Decline carer
                        {(tempUpdates.declineCarer || (tempUpdates.declineCarer === undefined && rowData?.declineCarer)) && (
                            <Check className="h-4 w-4 text-green-500" />
                        )}
                    </button>

                    {/* Bottom Action */}
                    <div className="mt-1 border-t">
                        <button
                            onClick={updateCareTeam}
                            className="block w-full px-4 py-2 text-left font-medium text-blue-600 hover:underline"
                            disabled={isUpdating}
                        >
                            {isUpdating ? "Applying..." : "Apply changes"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

TeamsClientsActionMenu.propTypes = {
    rowId: PropTypes.string.isRequired,
    rowData: PropTypes.object.isRequired,
    clientId: PropTypes.string.isRequired,
    onSuccess: PropTypes.func,
};

export default TeamsClientsActionMenu;
