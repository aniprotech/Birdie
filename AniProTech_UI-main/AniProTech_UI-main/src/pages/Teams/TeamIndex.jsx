import React, { useEffect, useState } from "react";
import SwitchComponents from "../../components/SwitchComponent/SwitchComponent";
import TeamFilterControls from "./TeamFilterControls";
import { useNavigate } from "react-router-dom";
import { _post } from "../../utils/ApiService";
import APIConfig from "../../utils/ApiConfig";
import { useGlobalStore } from "../../stores/useGlobalStore";
import { showError } from "../../utils/toaster";
import DotLoader from "../../components/Loader/DotLoader";

const TeamIndex = () => {
    const [activeComponent, setActiveComponent] = useState("TeamFilterControls");
    const [mode, setMode] = useState("");
    const [data, setData] = useState([]);
    const [statusFilter, setStatusFilter] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    const { teamsData, setTeamsData } = useGlobalStore();

    const handleCreate = () => {
        setMode("add");
        navigate("/admin/teams/add-teams", { replace: true });
    };

    const handleTeamAPI = async () => {
        setLoading(true);
        const payload = {
            search: searchTerm,
            isActive: statusFilter,
            page,
            size: pageSize,
        };
        try {
            const response = await _post(APIConfig.USERS?.GET_ALL, payload);
            const tData = response?.data?.results?.data?.users;
            setTeamsData(tData);
            setData(tData);
            setTotalCount(response?.data?.results?.data?.totalCount || 0);
        } catch (e) {
            console.log(e || "Network Error, please try again later.");
            showError(e?.response?.data?.message);
        } finally {
            setInterval(() => {
                setLoading(false);
            }, 1000);
        }
    };

    useEffect(() => {
        handleTeamAPI();
        // setPage(1);
    }, [statusFilter, page, searchTerm]);

    // if (loading) {
    //     return (
    //         <div className="flex min-h-screen items-center justify-center">
    //             <DotLoader loading={loading} />
    //         </div>
    //     );
    // }

    return (
        <div>
            <SwitchComponents active={activeComponent}>
                <div
                    className="m-5 md:mx-20 md:my-10 lg:mx-40"
                    name="TeamFilterControls"
                >
                    <TeamFilterControls
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        handleCreate={handleCreate}
                        data={data}
                        setData={setData}
                        mode={mode}
                        setMode={setMode}
                        setActiveComponent={setActiveComponent}
                        loading={loading}
                        setLoading={setLoading}
                        page={page}
                        setPage={setPage}
                        pageSize={pageSize}
                        setPageSize={setPageSize}
                        totalCount={totalCount}
                        setTotalCount={setTotalCount}
                        setSearchTerm={setSearchTerm}
                        searchTerm={searchTerm}
                    />
                </div>
                <div></div>
            </SwitchComponents>
        </div>
    );
};

export default TeamIndex;
