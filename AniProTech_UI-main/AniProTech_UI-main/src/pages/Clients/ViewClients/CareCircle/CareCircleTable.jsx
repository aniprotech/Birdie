import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HiOutlineChevronUp, HiOutlineChevronDown } from "react-icons/hi";
import { fetchData } from "../../../../utils/FetchData";
import { _put, _delete } from "../../../../utils/ApiService";
import APIConfig from "../../../../utils/ApiConfig";
import { showSuccess, showError } from "../../../../utils/toaster";

const CareCircleTable = ({ careCircleMembers = [], accessLogs = [], refreshData }) => {
    const [sortDirection, setSortDirection] = useState("asc");
    const navigate = useNavigate();
    const { id } = useParams();
    const [processing, setProcessing] = useState(false);

    const toggleSort = () => {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    };

    const handleInvitation = (member) => {
        if (processing) return;
        setProcessing(true);

        const isInviteSent = !member.isInviteSent;

        fetchData(
            () => _put(APIConfig?.CLIENT_CARE_CIRCLE?.INVITATION(member.id), { isInviteSent }),
            (response) => {
                if (!response.error) {
                    showSuccess(isInviteSent ? "Invitation sent successfully" : "Invitation canceled successfully");
                    refreshData();
                } else {
                    showError("Failed to update invitation status");
                }
                setProcessing(false);
            },
            null,
            null,
        );
    };

    const handleRemove = (member) => {
        if (processing) return;
        if (!confirm(`Are you sure you want to remove ${member.firstName} ${member.lastName} from care circle?`)) return;

        setProcessing(true);

        fetchData(
            () => _delete(APIConfig?.CLIENT_CARE_CIRCLE?.DELETE(member.id)),
            (response) => {
                if (!response.error) {
                    showSuccess("Care circle member removed successfully");
                    refreshData();
                } else {
                    showError("Failed to remove care circle member");
                }
                setProcessing(false);
            },
            null,
            null,
        );
    };

    const handleReset = (member) => {
        if (processing) return;
        if (!confirm(`Are you sure you want to reset passcode for ${member.firstName} ${member.lastName}?`)) return;

        showSuccess("Passcode reset functionality will be implemented when API is available");
    };

    if (careCircleMembers.length === 0) {
        return (
            <div className="mb-8 mt-4">
                <div className="overflow-x-auto">
                    <div
                        className="overflow-hidden rounded-md border"
                        style={{ minWidth: "800px" }}
                    >
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                    >
                                        Name
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                    >
                                        Invite
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                    >
                                        Relationship
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                    >
                                        Emergency contact
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                    >
                                        Phone
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                    >
                                        Email
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                    >
                                        L.P.A
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-6 py-4 text-center text-gray-500"
                                    >
                                        — — — — — — —
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="py-10 text-center text-gray-500">No one has been added to Dummy's care circle yet</div>
                    </div>
                </div>
            </div>
        );
    }

    const formatRelationship = (relationship) => {
        if (!relationship) return "";
        return relationship.charAt(0).toUpperCase() + relationship.slice(1).toLowerCase().replace("_", " ");
    };

    // Group access logs by date
    const groupedLogs = {};
    accessLogs.forEach((log) => {
        if (!groupedLogs[log.date]) {
            groupedLogs[log.date] = [];
        }
        groupedLogs[log.date].push(log);
    });

    // Sort dates in descending order (most recent first)
    const sortedDates = Object.keys(groupedLogs).sort((a, b) => new Date(b) - new Date(a));

    return (
        <div className="mb-8 mt-4">
            <div className="overflow-x-auto">
                <div
                    className="overflow-hidden rounded-md border"
                    style={{ minWidth: "1200px" }}
                >
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                                ></th>
                                <th
                                    scope="col"
                                    className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                >
                                    <button
                                        className="flex items-center"
                                        onClick={toggleSort}
                                    >
                                        Name
                                    </button>
                                </th>
                                <th
                                    scope="col"
                                    className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                >
                                    Invite
                                </th>
                                <th
                                    scope="col"
                                    className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                >
                                    Relationship
                                </th>
                                <th
                                    scope="col"
                                    className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                >
                                    Emergency contact
                                </th>
                                <th
                                    scope="col"
                                    className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                >
                                    Phone
                                </th>
                                <th
                                    scope="col"
                                    className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                >
                                    Email
                                </th>
                                <th
                                    scope="col"
                                    className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                >
                                    L.P.A
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {careCircleMembers.map((member, index) => (
                                <tr key={member.id || index}>
                                    <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-medium">
                                        <button
                                            onClick={() => navigate(`/admin/clients/${id}/care-circle/edit/${member.id}`)}
                                            className="mr-3 text-customTextNavy hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="text-customTextNavy hover:underline"
                                            onClick={() => handleRemove(member)}
                                            disabled={processing}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                    <td className="whitespace-nowrap py-4 pr-6 text-sm text-gray-900">
                                        {member.firstName} {member.lastName}
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-customTextNavy hover:underline">
                                        <button
                                            className="hover:underline"
                                            onClick={() => handleInvitation(member)}
                                            disabled={processing}
                                        >
                                            {member.isInviteSent ? "Cancel invite" : "Send invite"}
                                        </button>
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-900">{formatRelationship(member.relationship)}</td>
                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-900">{member.isEmergencyContact ? "Yes" : "No"}</td>
                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-900">
                                        {member.phoneCode}
                                        {member.phoneNumber}
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-900">{member.email}</td>
                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-900">{member.isLPA ? "Yes" : "No"}</td>
                                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium">
                                        <button
                                            className="text-customTextNavy hover:underline"
                                            onClick={() => handleReset(member)}
                                            disabled={processing}
                                        >
                                            Reset Passcode
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Access Logs Section */}
            <div className="mt-8">
                <h2 className="mb-4 text-lg font-medium text-gray-900">Access log</h2>
                <div className="space-y-6">
                    {sortedDates.length > 0 ? (
                        sortedDates.map((date) => (
                            <div
                                key={date}
                                className="mb-4"
                            >
                                <div className="mb-2 text-sm font-medium text-gray-900">{date}</div>
                                <div className="space-y-2">
                                    {groupedLogs[date].map((log, index) => (
                                        <div
                                            key={index}
                                            className="border-l-2 border-gray-200 py-1 pl-4"
                                        >
                                            <div className="text-sm text-gray-500">{log.action}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-gray-500">No access logs available</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CareCircleTable;
