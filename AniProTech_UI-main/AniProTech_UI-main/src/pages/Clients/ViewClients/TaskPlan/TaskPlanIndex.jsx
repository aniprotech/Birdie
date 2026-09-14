import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import TaskPlanHeader from "./TaskPlanHeader";
import TaskPlanTable from "./TaskPlanTable";
import TaskPlanPopUp from "./TaskPlanPopUp";
import { _delete, _post } from "../../../../utils/ApiService";
import { fetchData } from "../../../../utils/FetchData";
import APIConfig from "../../../../utils/ApiConfig";
import { showSuccess } from "../../../../utils/toaster";
import { formatSelectedDays, formatSessions, formatSessionsForEdit } from "../../../../utils/common";
import { useGlobalStore } from "../../../../stores/useGlobalStore";

const TaskPlanIndex = () => {
    const { id: userId } = useParams();
    const [showPopup, setShowPopup] = useState(false);
    const [editTask, setEditTask] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [sortConfig, setSortConfig] = useState({
        field: null,
        direction: null,
    });
    const pageSize = 10;

    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData?.firstName || "the client";

    useEffect(() => {
        if (userId) {
            fetchUserTasks();
        }
    }, [userId, currentPage, sortConfig]);

    const fetchUserTasks = async () => {
        const payload = {
            page: currentPage,
            size: pageSize,
            task: sortConfig.field === "task" ? sortConfig.direction : null,
            frequency: sortConfig.field === "frequency" ? sortConfig.direction : null,
            sessions: sortConfig.field === "sessions" ? sortConfig.direction : null,
            startDate: sortConfig.field === "startDate" ? sortConfig.direction : null,
            selectedDays: sortConfig.field === "selectedDays" ? sortConfig.direction : null,
        };

        const response = await fetchData(
            (data) => _post(APIConfig.CLIENT_TASK_PLAN.GET_BY_CLIENT(userId), data),
            null,
            setLoading,
            null,
            payload,
            false,
        );

        if (response?.data?.results?.data?.taskPlans) {
            const transformedTasks = response.data.results.data.taskPlans.map((task) => ({
                id: task.id,
                task: task.task.name || "Task details",
                cadence: task.frequency === "DAILY" ? "Daily" : task.frequency === "WEEKLY" ? "Weekly" : "Custom",
                frequency: formatSelectedDays(task.selectedDays),
                time: task.isAnyTime ? "Anytime" : formatSessions(task.sessions),
                startDate: task.startDate,
                endDate: task.endDate || "Never",
                isEssential: task.isEssential || false,
                details: task.details,
                selectedDays: task.selectedDays || [],
                repeatEvery: task.repeatEvery,
                repeatUnit: task.repeatUnit,
                selectedTime: task.isAnyTime ? ["Anytime"] : formatSessionsForEdit(task.sessions),
                neverEnds: !task.endDate,
            }));
            setTasks(transformedTasks);
            setTotalCount(response.data.results.data.totalCount || 0);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleAddTask = () => {
        fetchUserTasks();
        setShowPopup(false);
    };

    const handleEditTask = (task) => {
        setEditTask(task);
        setShowPopup(true);
    };

    const handleUpdateTask = () => {
        fetchUserTasks();
        setShowPopup(false);
        setEditTask(null);
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            const response = await fetchData(() => _delete(APIConfig.CLIENT_TASK_PLAN.DELETE(taskId)), null, setLoading, null, null, false);

            if (response?.data?.error === false) {
                showSuccess("Task deleted successfully");
                fetchUserTasks();
            }
        }
    };
    const handleSort = (field) => {
        setSortConfig((prev) => {
            if (prev.field === field) {
                if (prev.direction === "ASC") {
                    return { field, direction: "DESC" };
                } else if (prev.direction === "DESC") {
                    return { field: null, direction: null };
                }
            }
            return { field, direction: "ASC" };
        });
        setCurrentPage(1);
    };

    return (
        <div className="p-6">
            <TaskPlanHeader
                clientName={clientName}
                onAddTask={() => {
                    setEditTask(null);
                    setShowPopup(true);
                }}
            />
            <TaskPlanTable
                tasks={tasks}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                sortConfig={sortConfig}
                onSort={handleSort}
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                loading={loading}
            />
            {showPopup && (
                <TaskPlanPopUp
                    onClose={() => {
                        setShowPopup(false);
                        setEditTask(null);
                    }}
                    onSave={editTask ? handleUpdateTask : handleAddTask}
                    editTask={editTask}
                />
            )}
        </div>
    );
};

export default TaskPlanIndex;
