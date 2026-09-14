import React, { useState } from "react";
import { useGlobalStore } from "../../../../stores/useGlobalStore";
import { _post } from "../../../../utils/ApiService";
import APIConfig from "../../../../utils/ApiConfig";
import { useParams } from "react-router-dom";
import { Check } from "lucide-react";
import InnerLoader from "../../../../components/Loader/InnerLoader";
import { toast } from "sonner";
import { showError, showSuccess } from "../../../../utils/toaster";

const AdminIndex = () => {
    const { teamsPersonalDetailData } = useGlobalStore();
    const { id } = useParams();

    const [resetLoading, setResetLoading] = useState(false);
    const [inviteLoading, setInviteLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [inviteSuccess, setInviteSuccess] = useState(false);

    const handleResetAPI = async () => {
        setResetLoading(true);
        setResetSuccess(false);
        try {
            await _post(APIConfig?.TEAMS?.TEAM_RESET(id));
            setResetSuccess(true);
            showSuccess(`${teamsPersonalDetailData?.firstName}'s passcode successfully reset!`);
            // setTimeout(() => setResetSuccess(false), 3000); // Reset success after 3 sec
        } catch (error) {
            showError(error.response?.data?.message || error.message || "Failed to reset passcode.");
        } finally {
            setTimeout(() => setResetLoading(false), 3000);
            // setResetLoading(false);
        }
    };

    const handleInviteAPI = async () => {
        setInviteLoading(true);
        setInviteSuccess(false);
        try {
            await _post(APIConfig?.TEAMS?.TEAM_INVITE(id));
            setInviteSuccess(true);
            // toast.success("Caregiver successfully invited!");
            // setTimeout(() => setInviteSuccess(false), 3000);
        } catch (error) {
            showError(error.response?.data?.message || error.message || "Failed to send invite.");
        } finally {
            setTimeout(() => setInviteLoading(false), 3000);
            // setInviteLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-customCarerFeedBg">
            <div className="border-b bg-white p-2 md:p-8">
                <h2 className="poppins-medium text-base text-customTextGrey md:text-xl">
                    {`${teamsPersonalDetailData?.firstName}'s administration tools`}
                </h2>
            </div>
            <div className="space-y-4 bg-customCarerFeedBg p-1 md:p-8">
                {/* Reset passcode */}
                <div className="flex flex-col items-start justify-between rounded-md border border-gray-400 bg-white p-4 md:flex-row md:items-center">
                    <div>
                        <h3 className="text-base font-medium">Reset passcode</h3>
                        <p className="text-sm text-gray-600">Once reset, they'll be logged out and forced to create a new PIN to access the app.</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleResetAPI}
                        disabled={resetLoading || resetSuccess}
                        className="mt-4 flex items-center disabled:cursor-not-allowed rounded border border-customNavy/80 px-4 py-1.5 text-sm font-semibold text-customTextNavy hover:bg-customCarerFeedBg disabled:opacity-50 md:mt-0"
                    >
                        {resetLoading ? (
                            <InnerLoader
                                loading={resetLoading}
                                style={true}
                            />
                        ) : resetSuccess ? (
                            <span className="flex items-center opacity-70">
                                Password Reset <Check className="ml-1 h-5 w-5 text-customTextNavy" />
                            </span>
                        ) : (
                            "Reset"
                        )}
                    </button>
                </div>

                {/* Invite caregiver */}
                <div className="flex flex-col items-start justify-between rounded-md border border-gray-400 bg-white p-4 md:flex-row md:items-center">
                    <div>
                        <h3 className="text-base font-medium">Invite caregiver</h3>
                        <p className="text-sm text-gray-600">Sends an SMS and an email to them to invite them to download &amp; login into Birdie.</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleInviteAPI}
                        disabled={inviteLoading || inviteSuccess}
                        className="mt-4 flex items-center disabled:cursor-not-allowed rounded border border-customNavy/80 px-4 py-1.5 text-sm font-semibold text-customTextNavy hover:bg-customCarerFeedBg disabled:opacity-50 md:mt-0"
                    >
                        {inviteLoading ? (
                            <InnerLoader
                                loading={inviteLoading}
                                style={true}
                            />
                        ) : inviteSuccess ? (
                            <span className="flex items-center opacity-70">
                                Invited
                                <Check className="ml-1 h-5 w-5 text-customTextNavy" />
                            </span>
                        ) : (
                            "Invite"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminIndex;
