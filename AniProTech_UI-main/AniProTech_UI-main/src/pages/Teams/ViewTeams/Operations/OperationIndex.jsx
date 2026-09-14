import React, { useEffect, useState } from "react";
import { useNavigate, Outlet, useParams } from "react-router-dom";
import OperationTravelnfo from "./OperationTravelnfo";
import OperationRates from "./OperationRates";
import useScrollToTop from "../../../../hooks/useScrollToTop";
import { fetchData } from "../../../../utils/FetchData";
import APIConfig from "../../../../utils/ApiConfig";
import { _get } from "../../../../utils/ApiService";
import DotLoader from "../../../../components/Loader/DotLoader";

const OperationIndex = () => {
    const [mode, setMode] = useState("");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const { id } = useParams();

    useEffect(() => {
        fetchData(() => _get(APIConfig.TEAMS.TEAM_OPERATION_GET_BY_ID(id)), setData, setLoading, null);
    }, [id]);

    useScrollToTop();

    if (loading) {
        return (
            <div className="z-50 flex min-h-screen items-center justify-center">
                <DotLoader loading={loading} />
            </div>
        );
    }

    return (
        <div className="m-5 space-y-7 md:mx-20 md:my-10 lg:mx-40">
            <OperationTravelnfo
                name="OperationTravelnfo"
                data={data}
                setData={setData}
                mode={mode}
                setMode={setMode}
            />
            <OperationRates
                name="OperationRates"
                data={data}
                setData={setData}
                mode={mode}
                setMode={setMode}
            />
        </div>
    );
};

export default OperationIndex;
