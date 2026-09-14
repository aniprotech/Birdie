import React, { useState, useMemo, useEffect, useRef } from "react";
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import ClientsCareTeamActionMenu from "./ClientsCareTeamActionMenu";
import PropTypes from "prop-types";
import { _post, _put } from "../../../../utils/ApiService";
import APIConfig from "../../../../utils/ApiConfig";
import { showError } from "../../../../utils/toaster";
import DotLoader from "../../../../components/Loader/DotLoader";

const ClientCareRecipientTable = ({
    data,
    setData,
    activeTab,
    setActiveTab,
    totalCount,
    page,
    setPage,
    pageSize,
    setPageSize,
    loading,
    clientId,
    refetchData,
    searchTerm,
    setSearchTerm,
}) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const searchInputRef = useRef(null);

    const [updatePayload, setUpdatePayload] = useState({
        viewAccess: null,
        revokeViewaccess: null,
        allowedToVisit: null,
        declineCarer: null,
    });

    const toggleRow = (carerId) => {
        setSelectedIds((prev) => (prev.includes(carerId) ? prev.filter((x) => x !== carerId) : [...prev, carerId]));
    };

    const getInitials = (firstName, lastName) => {
        const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
        const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";
        return firstInitial + lastInitial;
    };

    const columns = useMemo(
        () => [
            {
                id: "select",
                header: ({ table }) => (
                    <div className="px-1">
                        <input
                            type="checkbox"
                            checked={selectedIds.length > 0 && selectedIds.length === table.getRowModel().rows.length}
                            onChange={() => {
                                const allCarerIds = table.getRowModel().rows.map((row) => row.original.carerId);
                                setSelectedIds(selectedIds.length === allCarerIds.length ? [] : allCarerIds);
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div
                        className="px-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <input
                            type="checkbox"
                            checked={selectedIds.includes(row.original.carerId)}
                            onChange={() => toggleRow(row.original.carerId)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600"
                        />
                    </div>
                ),
                enableSorting: false,
            },
            {
                accessorKey: "name",
                header: "Carer",
                cell: ({ row }) => {
                    const initials = getInitials(row.original.firstName, row.original.lastName);
                    return (
                        <div className="flex items-center">
                            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700">
                                {initials}
                            </div>
                            <div>
                                {row.original.firstName} {row.original.lastName}
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: "isActive",
                header: "Status",
                cell: ({ row }) => (
                    <div>
                        {row.original.isActive ? (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">Active</span>
                        ) : (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">Inactive</span>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: "role",
                header: "Roles",
                cell: ({ row }) => {
                    const isViewer = row.original.viewAccess;
                    const isDeclined = row.original.declineCarer;

                    if (isViewer && isDeclined) {
                        return (
                            <div className="flex space-x-2">
                                <span className="inline-flex items-center rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                                    Viewer
                                </span>
                                <span className="inline-flex items-center rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                                    Declined
                                </span>
                            </div>
                        );
                    } else if (isViewer) {
                        return <span className="inline-flex rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">Viewer</span>;
                    } else if (isDeclined) {
                        return <span className="inline-flex rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-800">Declined</span>;
                    } else {
                        return <span className="inline-flex rounded bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">Not set</span>;
                    }
                },
            },
            {
                id: "actions",
                cell: ({ row }) => (
                    <ClientsCareTeamActionMenu
                        rowId={row.original.carerId}
                        rowData={row.original}
                        clientId={clientId}
                        onSuccess={refetchData}
                    />
                ),
            },
        ],
        [selectedIds, clientId, refetchData],
    );

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter: searchTerm,
            pagination: {
                pageIndex: page - 1,
                pageSize,
            },
        },
        onGlobalFilterChange: setSearchTerm,
        manualPagination: true,
        pageCount: Math.ceil(totalCount / pageSize),
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    useEffect(() => {
        if (searchInputRef.current && searchTerm) {
            const currentInput = searchInputRef.current;
            const cursorPosition = currentInput.selectionStart;
            currentInput.focus();
            setTimeout(() => {
                try {
                    currentInput.setSelectionRange(cursorPosition, cursorPosition);
                } catch (err) {
                    console.log("Error setting selection range", err);
                }
            }, 0);
        }
    }, [data, loading, searchTerm]);

    useEffect(() => {
        setSelectedIds([]);
    }, [activeTab]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !buttonRef.current?.contains(event.target)) {
                setIsDropdownVisible(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleBulkUpdate = async () => {
        const hasUpdates = Object.values(updatePayload).some((value) => value !== null);
        if (!hasUpdates || selectedIds.length === 0) {
            showError("Please select at least one action to apply");
            return;
        }

        setIsUpdating(true);

        try {
            const updatedCareTeam = selectedIds
                .map((carerId) => {
                    const carerData = data.find((item) => item.carerId === carerId);
                    if (carerData) {
                        const completeUpdates = {
                            viewAccess: carerData.viewAccess,
                            revokeViewaccess: carerData.revokeViewaccess,
                            allowedToVisit: carerData.allowedToVisit,
                            declineCarer: carerData.declineCarer,
                            ...updatePayload,
                        };

                        return {
                            carerId: carerData.carerId,
                            firstName: carerData.firstName,
                            lastName: carerData.lastName,
                            isActive: carerData.isActive,
                            viewAccess: completeUpdates.viewAccess,
                            revokeViewaccess: completeUpdates.revokeViewaccess,
                            allowedToVisit: completeUpdates.allowedToVisit,
                            declineCarer: completeUpdates.declineCarer,
                        };
                    }
                    return null;
                })
                .filter(Boolean);

            await _put(APIConfig.CLIENT_CARE_TEAM.BULK_UPDATE(clientId), updatedCareTeam);

            setSelectedIds([]);
            setUpdatePayload({
                viewAccess: null,
                revokeViewaccess: null,
                allowedToVisit: null,
                declineCarer: null,
            });
            setIsDropdownVisible(false);

            refetchData();
        } catch (error) {
            console.error("Error updating care team:", error);
            showError(error?.response?.data?.message || "Failed to update care team");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="mt-3 w-full max-w-72 overflow-x-auto rounded-lg border bg-white pt-5 md:max-w-full">
            {/* Tabs + Controls */}
            <div className="flex items-center justify-between border-b px-6 pb-4">
                <div className="flex space-x-6">
                    {["All", "Declined", "Viewer"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`relative pb-2 text-sm font-medium ${
                                activeTab === tab
                                    ? "bg-dropdown rounded font-semibold text-customDropdownBorder"
                                    : "text-customTextGrey hover:text-customTextGrey/80"
                            }`}
                        >
                            {tab}
                            {activeTab === tab && <span className="absolute bottom-1 left-0 h-0.5 w-full bg-customDropdownBorder transition" />}
                        </button>
                    ))}
                </div>
                <div className="relative flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Search"
                            className="w-64 rounded-lg border py-2 pl-10 pr-4 text-sm"
                        />
                    </div>
                    {selectedIds.length > 0 && (
                        <>
                            <button
                                ref={buttonRef}
                                onClick={() => setIsDropdownVisible((prev) => !prev)}
                                className="relative flex items-center space-x-2 rounded bg-customDropdownBorder px-4 py-2 text-sm font-semibold text-white"
                                disabled={isUpdating}
                            >
                                <span>Edit Roles</span>
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            {isDropdownVisible && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border bg-white text-sm text-gray-800 shadow-md"
                                >
                                    <div className="cursor-text border-b px-4 py-2 font-medium text-customTextGrey">View</div>
                                    <button
                                        onClick={() => setUpdatePayload({ ...updatePayload, viewAccess: true, revokeViewaccess: false })}
                                        className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-blue-50"
                                    >
                                        Grant view access
                                        {updatePayload.viewAccess && <Check className="h-4 w-4 text-green-500" />}
                                    </button>
                                    <button
                                        onClick={() => setUpdatePayload({ ...updatePayload, viewAccess: false, revokeViewaccess: true })}
                                        className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-blue-50"
                                    >
                                        Revoke view access
                                        {updatePayload.revokeViewaccess && <Check className="h-4 w-4 text-green-500" />}
                                    </button>
                                    <div className="cursor-text border-b border-t px-4 py-2 font-medium text-customTextGrey">Exclude</div>
                                    <button
                                        onClick={() => setUpdatePayload({ ...updatePayload, allowedToVisit: true, declineCarer: false })}
                                        className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-blue-50"
                                    >
                                        Allow carer to visit
                                        {updatePayload.allowedToVisit && <Check className="h-4 w-4 text-green-500" />}
                                    </button>
                                    <button
                                        onClick={() => setUpdatePayload({ ...updatePayload, declineCarer: true, allowedToVisit: false })}
                                        className="flex w-full items-center justify-between px-4 py-2 text-left text-red-600 hover:bg-blue-50"
                                    >
                                        Decline carer
                                        {updatePayload.declineCarer && <Check className="h-4 w-4 text-green-500" />}
                                    </button>
                                    <div className="mt-1 border-t">
                                        <button
                                            onClick={handleBulkUpdate}
                                            className="block w-full px-4 py-2 text-left font-medium text-blue-600 hover:underline"
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? "Applying..." : "Apply changes"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Table */}
            <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                    {table.getHeaderGroups().map((hg) => (
                        <tr key={hg.id}>
                            {hg.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="px-6 py-3 text-left font-medium text-gray-700"
                                >
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-6 py-8 text-center text-gray-500"
                            >
                                <div className="flex justify-center">
                                    <DotLoader loading={loading} />
                                </div>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-6 py-8 text-center text-gray-500"
                            >
                                No care team members found
                            </td>
                        </tr>
                    ) : (
                        table.getRowModel().rows.map((row) => {
                            const isSelected = selectedIds.includes(row.original.carerId);
                            return (
                                <tr
                                    key={row.id}
                                    onClick={() => toggleRow(row.original.carerId)}
                                    className={`cursor-pointer border transition ${
                                        isSelected ? "bg-teal-50 hover:bg-teal-50" : "hover:bg-customBgGrey"
                                    }`}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className="px-6 py-3 align-middle"
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t px-6 py-4">
                <span className="text-sm text-customTextGrey">
                    Showing{" "}
                    <span className="text-sm font-semibold">
                        {data.length} of {totalCount}
                    </span>
                </span>
                <div className="flex items-center space-x-4 text-sm font-medium text-gray-700">
                    <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className="disabled:opacity-40"
                    >
                        <ChevronLeft />
                    </button>
                    <span>
                        {page} / {Math.max(1, Math.ceil(totalCount / pageSize))}
                    </span>
                    <button
                        onClick={() => setPage((prev) => prev + 1)}
                        disabled={page >= Math.ceil(totalCount / pageSize)}
                        className="disabled:opacity-40"
                    >
                        <ChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

ClientCareRecipientTable.propTypes = {
    data: PropTypes.array,
    setData: PropTypes.func,
    activeTab: PropTypes.string,
    setActiveTab: PropTypes.func,
    totalCount: PropTypes.number,
    page: PropTypes.number,
    setPage: PropTypes.func,
    pageSize: PropTypes.number,
    setPageSize: PropTypes.func,
    loading: PropTypes.bool,
    clientId: PropTypes.string,
    refetchData: PropTypes.func,
    searchTerm: PropTypes.string,
    setSearchTerm: PropTypes.func,
};

export default ClientCareRecipientTable;
