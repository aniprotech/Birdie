import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TeamFilterControls from "./TeamFilterControls";
import { _post } from "../../utils/ApiService";
import APIConfig from "../../utils/ApiConfig";
import { showError } from "../../utils/toaster";
import useAuthStore from "../../stores/authStore";

export default function TeamIndex() {
    const [data, setData] = useState([]),
        [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState(true),
        [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10),
        [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const canManage = useAuthStore((s) => s.userData?.user?.role) !== "CAREGIVER";
    useEffect(() => {
        let current = true;
        const controller = new AbortController();
        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const response = await _post(
                    APIConfig.USERS.GET_ALL,
                    { search: searchTerm, page, size: pageSize, ...(typeof statusFilter === "boolean" ? { isActive: statusFilter } : {}) },
                    { signal: controller.signal },
                );
                if (!current) return;
                const result = response.data.results.data;
                setData(result.users || []);
                setTotalCount(result.totalCount || 0);
            } catch (error) {
                if (current) showError(error.response?.data?.message || "Unable to load team members");
            } finally {
                if (current) setLoading(false);
            }
        }, 250);
        return () => {
            current = false;
            clearTimeout(timer);
            controller.abort();
        };
    }, [statusFilter, page, pageSize, searchTerm]);
    return (
        <div className="mx-auto max-w-6xl p-5 md:p-10">
            <h1 className="mb-2 text-2xl font-semibold text-customNavy">Team</h1>
            <p className="mb-6 text-sm text-gray-500">Manage staff profiles, skills and availability. Open a team member to view their details.</p>
            <TeamFilterControls
                data={data}
                loading={loading}
                page={page}
                setPage={setPage}
                pageSize={pageSize}
                setPageSize={(value) => {
                    setPageSize(value);
                    setPage(1);
                }}
                totalCount={totalCount}
                statusFilter={statusFilter}
                setStatusFilter={(value) => {
                    setStatusFilter(value);
                    setPage(1);
                }}
                searchTerm={searchTerm}
                setSearchTerm={(value) => {
                    setSearchTerm(value);
                    setPage(1);
                }}
                canManage={canManage}
                handleCreate={() => navigate("/admin/teams/add-teams")}
            />
        </div>
    );
}
