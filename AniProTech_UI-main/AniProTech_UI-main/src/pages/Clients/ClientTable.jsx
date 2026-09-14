import React from "react";
import PropTypes from 'prop-types';
import { FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { clientColumns } from "../../data/clients";
import { useLocation, useNavigate } from "react-router-dom";
import TableLoader from "../../components/Loader/TableLoader";

const ClientTable = ({
    data,
    loading,
    page,
    setPage,
    pageSize,
    totalCount,
    setSearchTerm,
    searchTerm
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const currentSection = (() => {
        const pathParts = location.pathname.split("/");
        const lastSegment = pathParts[pathParts.length - 1];
        return lastSegment === "clients" ? "basic-info" : lastSegment;
    })();

    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    return (
        <div className="space-y-4 rounded border border-customBorder bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Search Input */}
                <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-fit rounded-md border border-gray-300 px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-customBlue"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-md border border-customBorder">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100 text-customTextGrey">
                        <tr>
                            {clientColumns.map((col) => (
                                <th
                                    key={col.accessor}
                                    className={`px-4 py-3 text-left text-sm font-semibold tracking-wider ${
                                        col.header === "" ? "w-20" : ""
                                    }`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {loading ? (
                            <tr className="animate-pulse text-sm">
                                <td
                                    colSpan={clientColumns.length}
                                    className="px-4 py-6"
                                >
                                    <TableLoader />
                                </td>
                            </tr>
                        ) : data && data.length > 0 ? (
                            data.map((row, i) => (
                                <tr
                                    key={i}
                                    className="border-t transition-colors hover:cursor-pointer hover:border hover:border-customGrey/30 hover:bg-customHoverGrey"
                                    onClick={() => navigate(`/admin/clients/${row.id}/${currentSection}`)}
                                >
                                    {clientColumns.map((col) => (
                                        <td
                                            key={col.accessor}
                                            className={`whitespace-nowrap px-6 py-2.5 text-sm text-gray-900 ${
                                                col.header === "" ? "w-20" : ""
                                            }`}
                                        >
                                            {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={clientColumns?.length}
                                    className="px-6 py-4 text-center text-sm text-gray-500"
                                >
                                    No matching records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end gap-4">
                <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="flex items-center rounded bg-gray-100 px-3 py-1 text-sm disabled:opacity-50"
                >
                    <FaChevronLeft />
                </button>
                <span className="text-sm text-gray-600">
                    {page} / {totalPages}
                </span>
                <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="flex items-center rounded bg-gray-100 px-3 py-1 text-sm disabled:opacity-50"
                >
                    <FaChevronRight />
                </button>
            </div>
        </div>
    );
};

ClientTable.propTypes = {
    data: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    page: PropTypes.number.isRequired,
    setPage: PropTypes.func.isRequired,
    pageSize: PropTypes.number.isRequired,
    totalCount: PropTypes.number.isRequired,
    setSearchTerm: PropTypes.func.isRequired,
    searchTerm: PropTypes.string.isRequired
};

export default ClientTable;
