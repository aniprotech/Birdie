import React from "react";
import TeamTable from "./TeamTable";
import { statusForTeams } from "../../constants";

const TeamFilterControls = ({
    canManage = true,
    statusFilter,
    setStatusFilter,
    handleCreate,
    data,
    setData,
    mode,
    setMode,
    setActiveComponent,
    loading,
    setLoading,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
    setTotalCount,
    setSearchTerm,
    searchTerm,
}) => {
    const toggleStatus = (statusValue) => {
        setStatusFilter((prev) => (prev === statusValue ? null : statusValue));
    };

    return (
        <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex max-w-full items-center gap-6 overflow-x-auto">
                    {statusForTeams.map((status, index) => (
                        <label
                            key={index}
                            className="flex items-center gap-2 text-sm font-medium text-customTextGrey hover:cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                className="h-4 w-4 cursor-pointer rounded border border-gray-300 checked:accent-cyan-600 focus:outline-none"
                                checked={statusFilter === status.value}
                                onChange={() => toggleStatus(status.value)}
                            />
                            {status.label}
                        </label>
                    ))}
                </div>

                {canManage && (
                    <button
                        className="border border-customTextGrey px-4 py-2 text-sm font-semibold text-customTextGrey transition hover:bg-blue-50"
                        onClick={handleCreate}
                    >
                        Create new caregiver
                    </button>
                )}
            </div>

            {/* Team Table */}
            <TeamTable
                data={data}
                setData={setData}
                mode={mode}
                setMode={setMode}
                setActiveComponent={setActiveComponent}
                setLoading={setLoading}
                loading={loading}
                page={page}
                setPage={setPage}
                pageSize={pageSize}
                setPageSize={setPageSize}
                totalCount={totalCount}
                setTotalCount={setTotalCount}
                setSearchTerm={setSearchTerm}
                searchTerm={searchTerm}
            />
        </>
    );
};

export default TeamFilterControls;
