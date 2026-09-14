import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGlobalStore } from "../../../../stores/useGlobalStore";

const CareCircleHeader = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData ? clientsPersonalDetailData.firstName : "Dummy";

    return (
        <div className="sm:item-center flex w-full flex-col items-start justify-between pb-4 sm:flex-row">
            <div>
                <h1 className="text-2xl font-medium text-customNavy">{clientName}'s care circle</h1>
                <p className="mt-1 text-gray-500">Care circle members have full access to {clientName}'s care notes</p>
            </div>
            <button
                onClick={() => navigate(`/admin/clients/${id}/care-circle/create`)}
                className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-3 text-customNavy transition-colors hover:bg-gray-50"
            >
                <span className="text-xl font-medium">+</span>
                <span>Create new care circle member</span>
            </button>
        </div>
    );
};

export default CareCircleHeader;
