import React from "react";
import { SquarePen, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import TableLoader from "../../../../components/Loader/TableLoader";

const TaskPlanTable = ({ tasks, onEditTask, onDeleteTask, sortConfig, onSort, currentPage, totalCount, onPageChange, loading }) => {
    const renderFrequencyDays = (selectedDays) => {
        const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
        const dayMapping = {
            MONDAY: 0,
            TUESDAY: 1,
            WEDNESDAY: 2,
            THURSDAY: 3,
            FRIDAY: 4,
            SATURDAY: 5,
            SUNDAY: 6,
        };

        const activeDayIndices = selectedDays?.map((day) => dayMapping[day]).filter((index) => index !== undefined) || [];

        return (
            <div className="flex gap-1">
                {dayLabels.map((day, index) => (
                    <span
                        key={index}
                        className={`flex h-7 w-7 items-center justify-center rounded text-xs font-medium ${
                            activeDayIndices.includes(index) ? "bg-customNavy1 text-white" : "bg-gray-100 text-gray-400"
                        }`}
                    >
                        {day}
                    </span>
                ))}
            </div>
        );
    };

    const getSortIcon = (field) => {
        if (sortConfig.field !== field) {
            return <ChevronDown className="h-4 w-4 text-gray-300" />;
        } else if (sortConfig.direction === "ASC") {
            return <ChevronUp className="h-4 w-4 text-gray-600" />;
        } else if (sortConfig.direction === "DESC") {
            return <ChevronDown className="h-4 w-4 text-gray-600" />;
        } else {
            return <ChevronDown className="h-4 w-4 text-gray-300" />;
        }
    };

    const renderPagination = () => {
        const totalPages = Math.ceil(totalCount / 10);
        if (totalPages <= 1) return null;

        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`mx-1 rounded px-3 py-1 text-sm ${
                        currentPage === i ? "bg-customNavy text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                    {i}
                </button>,
            );
        }

        return (
            <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} results
                </div>
                <div className="flex items-center">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="mx-1 rounded bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Previous
                    </button>
                    {pages}
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="mx-1 rounded bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    if (tasks.length === 0 && totalCount === 0 && !loading) {
        return (
            <div className="mt-4 w-full">
                <div className="relative overflow-x-auto rounded-md border border-gray-200">
                    <div className="py-8 text-center text-sm poppins-medium text-gray-500">No tasks found. Click "Add task" to create your first task.</div>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4 w-full">
            <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                <button
                                    onClick={() => onSort("task")}
                                    className="flex items-center space-x-1 hover:text-gray-700"
                                >
                                    <span>Task</span>
                                    {getSortIcon("task")}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                <button
                                    onClick={() => onSort("frequency")}
                                    className="flex items-center space-x-1 hover:text-gray-700"
                                >
                                    <span>Cadence</span>
                                    {getSortIcon("frequency")}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                <button
                                    onClick={() => onSort("selectedDays")}
                                    className="flex items-center space-x-1 hover:text-gray-700"
                                >
                                    <span>When</span>
                                    {getSortIcon("selectedDays")}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                <button
                                    onClick={() => onSort("sessions")}
                                    className="flex items-center space-x-1 hover:text-gray-700"
                                >
                                    <span>Frequency</span>
                                    {getSortIcon("sessions")}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                <button
                                    onClick={() => onSort("startDate")}
                                    className="flex items-center space-x-1 hover:text-gray-700"
                                >
                                    <span>From → Until</span>
                                    {getSortIcon("startDate")}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {loading ? (
                            <tr className="animate-pulse text-sm">
                                <td
                                    colSpan={6}
                                    className="px-4 py-6"
                                >
                                    <TableLoader />
                                </td>
                            </tr>
                        ) : tasks && tasks.length > 0 ? (
                            tasks.map((task) => (
                                <tr
                                    key={task.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center">
                                            <span className="text-sm text-gray-900">{task.task}</span>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{task.cadence}</td>
                                    <td className="px-6 py-4">{renderFrequencyDays(task.selectedDays)}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{task.time}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{task.startDate}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => onEditTask(task)}
                                                className="text-customNavy hover:text-opacity-80"
                                                title="Edit task"
                                            >
                                                <SquarePen className="h-4 w-4" />
                                            </button>
                                            {onDeleteTask && (
                                                <button
                                                    onClick={() => onDeleteTask(task.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Delete task"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-4 text-center text-sm poppins-medium text-gray-500"
                                >
                                    No tasks found. Click "Add task" to create your first task.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {renderPagination()}
        </div>
    );
};

export default TaskPlanTable;
