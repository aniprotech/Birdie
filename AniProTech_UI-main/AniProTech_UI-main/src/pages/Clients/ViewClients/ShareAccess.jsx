import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useScrollToTop from "../../../hooks/useScrollToTop";
import { _get, _post } from "../../../utils/ApiService";
import APIConfig from "../../../utils/ApiConfig";
import { showError, showSuccess } from "../../../utils/toaster";
import { useGlobalStore } from "../../../stores/useGlobalStore";

const ShareAccess = () => {
    const { id: clientId } = useParams();
    const [accessCode, setAccessCode] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const pathname = useLocation();
    useScrollToTop();

    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData ? clientsPersonalDetailData.firstName : "Dummy";


    useEffect(() => {
        if (clientId) fetchAccessDetails();
    }, [clientId, pathname]);

    const fetchAccessDetails = async () => {
        try {
            const res = await _get(APIConfig.CLIENT_SHARE_ACCESS.GET_BY_ID(clientId));
            if (res?.data?.error === false) {
                setAccessCode(res?.data?.results?.data?.accessCode || "");
            } else {
                showError(res?.data?.message || "Failed to fetch access code");
            }
        } catch (error) {
            console.log("error",error)
            showError(error?.response?.data?.message || "Error fetching access details");
        }
    };

    const handleCopyWeblink = () => {
        navigator.clipboard.writeText("https://access.birdie.care");
        showSuccess("Weblink copied to clipboard");
    };

    const handleCopyAccessCode = () => {
        if (accessCode) {
            navigator.clipboard.writeText(accessCode);
            showSuccess("Access code copied to clipboard");
        }
    };

    const handleSendMagicLink = async () => {
        try {
            const res = await _post(APIConfig.CLIENT_SHARE_ACCESS.SEND_MAGIC_LINK(), {
                clientId,
            })
            if (res?.data?.error === false) {
                showSuccess("Magic link sent to client's email");
            } else {
                showError(res?.data?.message || "Failed to send magic link");
            }
        } catch (error) {
            console.log("error",error)
            showError(error?.response?.data?.message || "Error sending magic link");
        }
    };

    const handleGenerateNewCode = async () => {
        setLoading(true);
        try {
            const res = await _post(APIConfig.CLIENT_SHARE_ACCESS.GENERATE(), {
                clientId,
            })
            if (res?.data?.error === false) {
                setAccessCode(res?.data?.results?.data?.accessCode || "");
                showSuccess("New access code generated");
            } else {
                showError(res?.data?.message || "Failed to generate code");
            }
        } catch (error) {
            showError(error?.response?.data?.message || "Error generating new access code");
        } finally {
            setLoading(false);
        }
    };



    return (
        <>
            <div className="bg-white min-h-screen">
                <div className="container mx-auto max-w-5xl px-4 py-8">
                    <div className="space-y-2">
                        <h1 className="poppins-semibold text-customBlack text-xl">Share access</h1>
                        <p className="poppins-medium text-customBlack text-sm">
                            Use the following details to share {clientName}&apos;s details
                        </p>
                    </div>

                    {/* Info Alert */}
                    <div className="bg-customBgLightBlue1 mt-4 flex items-start gap-3 rounded-md border border-l-4 border-l-customGrey/80 p-2.5">
                        <Info className="h-5 w-5 text-customNavy" />
                        <p className="text-sm text-customNavy">
                            Please ensure that you have a valid lawful basis to share this client record.
                        </p>
                    </div>

                    {/* Share with third party */}
                    <div className="mt-8 space-y-2">
                        <h2 className="poppins-semibold text-customBlack text-lg">Share with third party</h2>
                        <p className="text-customBlack text-sm">
                            Use the access code and website link to share {clientName}&apos;s basic info, medical details and care log. When sharing this code
                            with a third party, please inform them that their data will be shared with your agency for auditing purposes.
                        </p>

                        <div className="mt-4 flex flex-wrap gap-6">
                            <div className="bg-customBgLightBlue1 flex w-fit flex-col rounded-lg  p-4">
                                <div className="flex-1">
                                    <h3 className="text-customBlack1 text-sm font-medium">Website link</h3>
                                    <div className="mt-1">
                                        <a
                                            href="https://access.birdie.care"
                                            className="text-sm text-customNavy hover:underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            https://access.birdie.care
                                        </a>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCopyWeblink}
                                    className="text-customTextLightNavy mt-2 self-start text-sm hover:underline"
                                >
                                    Copy weblink
                                </button>
                            </div>

                            <div className="bg-customBgLightBlue1 flex w-fit flex-col rounded-lg  p-4">
                                <div className="flex-1">
                                    <h3 className="text-customBlack1 text-sm poppins-semibold tracking-widest">{accessCode || "- - - - - - - -"}</h3>
                                    <p className="text-customBlack text-sm">access code</p>
                                </div>
                                <button
                                    onClick={handleCopyAccessCode}
                                    className="text-customTextLightNavy mt-2 self-start text-sm hover:underline"
                                >
                                    Copy access code
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Share with client */}
                    <div className="mt-8 space-y-2">
                        <h2 className="poppins-semibold text-customBlack text-lg">Share with client</h2>
                        <p className="text-customBlack text-sm">
                            Give client access to their care notes by sending them a magic link via email. A magic link will be sent to the client’s
                            email address saved in{" "}
                            <a href="#" className="text-customNavy ">
                                About me &gt; <span className="text-customTextLightNavy hover:text-customTextLightNavy/80" onClick={() => navigate(`/admin/clients/${clientId}/basic-info`)}> Basic Information</span>
                            </a>
                            .
                        </p>
                        <button
                            onClick={handleSendMagicLink}
                            className="mt-2 rounded-md border border-customNavy px-4 py-2 text-sm text-customNavy hover:bg-gray-50"
                        >
                            Send magic link
                        </button>
                    </div>

                    {/* Revoke access */}
                    <div className="mt-8 space-y-2">
                        <h2 className="poppins-semibold text-customBlack text-lg">Revoke access anytime</h2>
                        <p className="text-customBlack text-sm">
                            Generate a new code to revoke all previous access. The Basic info PDF including the new access code will be downloaded
                            automatically to your computer.
                        </p>
                        <button
                            onClick={handleGenerateNewCode}
                            disabled={loading}
                            className="mt-2 rounded-md border border-customNavy px-4 py-2 text-sm text-customNavy hover:bg-gray-50"
                        >
                            {loading ? "Generating..." : "Generate new code"}
                        </button>
                    </div>
                </div>
            </div>

            {/* <DownloadInfoModal
                isOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
                clientName="David"
                onDownload={handleDownloadPDF}
            /> */}
        </>
    );
};

export default ShareAccess;
