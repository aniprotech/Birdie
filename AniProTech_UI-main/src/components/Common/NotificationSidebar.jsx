import React, { useEffect, useState } from "react";
import { filterItems } from "../../data/teams/carerFeed";
import FeedFilterPopUp from "../../pages/Teams/ViewTeams/CarerFeed/FeedFilterPopUp";
import { useNavigate, useParams } from "react-router-dom";
import { useGlobalStore } from "../../stores/useGlobalStore";

const NotificationSidebar = ({ activeItem, setActiveItem, notificationCounts }) => {
    const [showFilterPopUp, setShowFilterPopUp] = useState(false);
    const [windowSize, setWindowSize] = useState(false);

    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (window.innerWidth <= 425) {
            setWindowSize(true);
        }
    }, [id]);

    const { teamsPersonalDetailData, clientsPersonalDetailData } = useGlobalStore();

    return (
        <div className="flex h-screen w-56 flex-col overflow-hidden border-r bg-white p-4">
            <div className="mb-5 text-lg font-semibold">
                {teamsPersonalDetailData
                    ? `${teamsPersonalDetailData.firstName} ${teamsPersonalDetailData.lastName}`
                    : clientsPersonalDetailData
                      ? `${clientsPersonalDetailData.firstName} ${clientsPersonalDetailData.lastName}`
                      : ""}
            </div>

            <hr className="mb-6" />

            <div className="flex flex-col gap-2">
                {filterItems.map((item) => (
                    <div
                        key={item.label}
                        onClick={() => {
                            setActiveItem(item.label);
                            if (windowSize) {
                                navigate(`/admin/teams/${id}/carer-feed`);
                            }
                        }}
                        className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-sm ${
                            activeItem === item.label
                                ? "border-l-4 border-customNavy bg-customCarerFeedBg font-medium text-customTextNavy"
                                : "hover:border hover:bg-gray-100"
                        }`}
                    >
                        <span>{item.label}</span>
                        <span className="rounded bg-gray-200 px-2 py-0.5 text-xs">{notificationCounts[item.label] || 0}</span>
                    </div>
                ))}
            </div>

            <hr className="my-4" />
            <div className="flex w-fit cursor-pointer items-center gap-2 border border-customBorder p-1 text-sm text-customNavy">
                <span className="text-lg">＋</span>
                <span
                    className="hover:underline"
                    onClick={() => setShowFilterPopUp(!showFilterPopUp)}
                >
                    More filters
                </span>
            </div>

            {showFilterPopUp && (
                <FeedFilterPopUp
                    setShowFilterPopUp={setShowFilterPopUp}
                    showFilterPopUp={showFilterPopUp}
                />
            )}
        </div>
    );
};

export default NotificationSidebar;
