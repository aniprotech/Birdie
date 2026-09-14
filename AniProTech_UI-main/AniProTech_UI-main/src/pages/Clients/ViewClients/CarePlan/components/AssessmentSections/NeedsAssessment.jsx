import PropTypes from "prop-types";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Trash2, X } from "lucide-react";
import { useGlobalStore } from "../../../../../../stores/useGlobalStore";
import { isNotEmpty } from "../../../../../../utils/common";
import { formatCustomDate } from "../../../../../../utils/dateAndTimeUtil";
import { useState } from "react";
import { _post, _delete } from "../../../../../../utils/ApiService";
import { createOrUpdateInitialAssessmentAPI, deleteAssessmentAPI } from "../initialAssessmentApiEndpoint/initialAssessmentAPI";
import { showError, showSuccess } from "../../../../../../utils/toaster";
import InnerLoader from "../../../../../../components/Loader/InnerLoader";

const NeedsAssessment = ({ clientName, assessmentData, onAssessmentUpdate }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const pathSegments = location?.pathname.split("/");
    const assessmentType = pathSegments[pathSegments.length - 1];
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [assessmentToDelete, setAssessmentToDelete] = useState(null);
    const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);
    const [isUpdatingAssessment, setIsUpdatingAssessment] = useState(false);
    const [isPreparingReview, setIsPreparingReview] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const { clientsPersonalDetailData } = useGlobalStore();

    const handleStartAssessment = async () => {
        try {
            setIsCreatingAssessment(true);

            const initialPayload = {
                assessmentInprogress: true,
                reviewInprogress: null
            };

            const endpoint = createOrUpdateInitialAssessmentAPI(assessmentType, "create", null, clientsPersonalDetailData?.id);
            const response = await _post(endpoint, initialPayload);

            if (response?.data?.error === false) {
                const createdAssessmentId = response?.data?.results?.data?.id;
                showSuccess("Assessment created successfully");
                navigate(`/admin/clients/${clientsPersonalDetailData?.id}/care-plan/${assessmentType}/assessment?mode=create&id=${createdAssessmentId}`);
            } else {
                throw new Error(response?.data?.message || "Failed to create assessment");
            }
        } catch (error) {
            console.error("Error creating assessment:", error);
            const errorMessage = error?.response?.data?.message || error.message || "Failed to create assessment";
            showError(errorMessage);
        } finally {
            setIsCreatingAssessment(false);
        }
    };

    const getStatusLabel = (assessment) => {
        if (assessment?.reviewedBy && assessment?.reviewedAt && assessment?.reviewInprogress === false) return "Review complete";
        if (assessment?.submittedAt && assessment?.assessmentInprogress === false) return "Complete";
        if (assessment?.reviewInprogress) return "Review in progress";
        if (assessment?.assessmentInprogress) return "In progress";
        return "Complete";
    };

    const handleUpdateAssessment = async (assessmentId) => {
        if (isUpdatingAssessment) return; 
        
        try {
            setIsUpdatingAssessment(true);
            
            let initialPayload;

            initialPayload = {
                assessmentInprogress: true,
                reviewInprogress: null,
            };
         

            const endpoint = createOrUpdateInitialAssessmentAPI(assessmentType, "create", null, clientsPersonalDetailData?.id);
                        const response = await _post(endpoint, initialPayload);

            const updateId = response?.data?.results?.data?.id;
            if (response?.data?.error === false) {
                showSuccess("Assessment update initiated successfully");
                navigate(`/admin/clients/${clientsPersonalDetailData?.id}/care-plan/${assessmentType}/assessment?mode=update&id=${assessmentId}&updateId=${updateId}`);
            } else {
                throw new Error(response?.data?.message || "Failed to create assessment");
            }
        } catch (error) {
            console.error("Error navigating to update assessment:", error);
            showError("Failed to navigate to assessment update");
        } finally {
            setIsUpdatingAssessment(false);
        }
    };

    const findNextAssessmentForReview = () => {
        if (!assessmentData || assessmentData.length === 0) return null;
        
        const nextAssessment = assessmentData.find(assessment => {
            const status = getStatusLabel(assessment);
            return status === "Complete" || status === "Review complete";
        });
        
        return nextAssessment;
    };

    const handleReviewAssessment = async () => {
        if (isPreparingReview) return; 
        
        try {
            setIsPreparingReview(true);
            
            const assessmentToReview = findNextAssessmentForReview();
            
            if (!assessmentToReview) {
                showError("No assessment available for review");
                return;
            }

            const initialPayload = {
                reviewInprogress: true,
                assessmentInprogress: assessmentToReview?.assessmentInprogress || null,
            };

            const endpoint = createOrUpdateInitialAssessmentAPI(assessmentType, "create", null, clientsPersonalDetailData?.id);
            const response = await _post(endpoint, initialPayload);

            const reviewId = response?.data?.results?.data?.id;
            if (response?.data?.error === false) {
                showSuccess("Assessment review initiated successfully");
                navigate(`/admin/clients/${clientsPersonalDetailData?.id}/care-plan/${assessmentType}/assessment?mode=review&id=${assessmentToReview.id}&updateId=${reviewId}`);
            } else {
                throw new Error(response?.data?.message || "Failed to create assessment for review");
            }
        } catch (error) {
            console.error("Error navigating to review assessment:", error);
            showError("Failed to navigate to assessment review");
        } finally {
            setIsPreparingReview(false);
        }
    };

    const handleViewAssessmentDetails = (assessment) => {
        const status = getStatusLabel(assessment);

        if (status === "In progress") { 
            navigate(`/admin/clients/${clientsPersonalDetailData?.id}/care-plan/${assessmentType}/assessment?mode=update&id=${assessment.id}`);
        } else if (status === "Review in progress") {
            navigate(`/admin/clients/${clientsPersonalDetailData?.id}/care-plan/${assessmentType}/assessment?mode=review&id=${assessment.id}`);
        } else {
            let detailsUrl = `/admin/clients/${clientsPersonalDetailData?.id}/care-plan/${assessmentType}/assessment-details?id=${assessment.id}`;
            if (assessment.name) {
                detailsUrl += `&name=${encodeURIComponent(assessment.name)}`;
            }
            navigate(detailsUrl);
        }
    };

    const handleDeleteClick = (assessment) => {
        setAssessmentToDelete(assessment);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (!assessmentToDelete) {
            showError("No assessment selected for deletion");
            return;
        }

        try {
            setIsDeleting(true);
            const endpoint = deleteAssessmentAPI(assessmentType, assessmentToDelete.id);
            
            if (!endpoint) {
                throw new Error("Delete API endpoint not configured");
            }

            const response = await _delete(endpoint);

            if (response?.data?.error === false) {
                showSuccess("Assessment deleted successfully");
                setShowDeleteDialog(false);
                setAssessmentToDelete(null);
                
                if (onAssessmentUpdate) {
                    onAssessmentUpdate();
                }
            } else {
                throw new Error(response?.data?.message || "Failed to delete assessment");
            }
        } catch (error) {
            console.error("Error deleting assessment:", error);
            const errorMessage = error?.response?.data?.message || 
                                 error?.message || 
                                 "Failed to delete assessment. Please try again.";
            showError(errorMessage);
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
            setAssessmentToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteDialog(false);
        setAssessmentToDelete(null);
    };

    const hasCompletedAssessment = assessmentData?.some((a) => a.submittedAt);
    const hasAssessmentForReview = findNextAssessmentForReview() !== null;

    return (
        <>
            <section
                id="needs"
                className="mb-10 lg:mb-20 xl:mb-32"
            >
                <h2 className="poppins-medium text-lg text-customBlack">1. Needs assessment</h2>
                <p className="mb-3 text-sm text-customFeedCardGreyText1">
                    Record {clientName || "client"}&apos;s level of independence for each everyday activities activity, and any support that is required
                </p>

                {!hasCompletedAssessment && (
                    <button
                        onClick={handleStartAssessment}
                        disabled={isCreatingAssessment}
                        className="rounded border border-customNavy/50 px-4 py-2 text-sm text-customNavy hover:bg-customTextLightNavy/10 disabled:opacity-50 flex items-center justify-center min-w-[160px]"
                    >
                        {isCreatingAssessment ? (
                            <InnerLoader loading={true} text="Creating..." style={true} />
                        ) : (
                            "Start a new assessment"
                        )}
                    </button>
                )}

                {hasCompletedAssessment && hasAssessmentForReview && (
                    <button
                        onClick={handleReviewAssessment}
                        disabled={isPreparingReview}
                        className="rounded border border-customNavy/50 px-4 py-2 text-sm text-customNavy hover:bg-customTextLightNavy/10 disabled:opacity-50 flex items-center justify-center min-w-[160px]"
                    >
                        {isPreparingReview ? (
                            <InnerLoader loading={true} text="Preparing..." style={true} />
                        ) : (
                            "Review assessment"
                        )}
                    </button>
                )}

                <div className="mt-6">
                    <h3 className="poppins-medium mb-4 text-base text-customBlack">Previous assessments</h3>
                    {isNotEmpty(assessmentData) ? (
                        <div className="space-y-4">
                            {assessmentData.map((assessment, index) => {
                                const status = getStatusLabel(assessment);
                                const isComplete = status === "Complete";
                                const isReviewComplete = status === "Review complete";
                                const isMuted = status === "In progress" || status === "Review in progress";

                                const createdDate = assessment?.submittedAt || assessment?.updatedAt || assessment?.createdAt;
                                const createdBy = assessment?.submittedBy || assessment?.updatedBy || assessment?.createdBy;

                                const latestCompleteIndex = assessmentData.findIndex(a => {
                                    const s = getStatusLabel(a);
                                    return s === "Complete" || s === "Review complete";
                                });

                                const showUpdate = index === latestCompleteIndex && latestCompleteIndex !== -1;

                                return (
                                    <div
                                        key={assessment.id || index}
                                        className="flex items-center justify-between rounded-md border border-gray-300 px-8 py-4 cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleViewAssessmentDetails(assessment)}
                                    >
                                        <div>
                                            <h4 className={`text-lg font-medium ${isMuted ? "text-gray-500" : "text-customBlack"}`}>{status}</h4>
                                            <p className="text-sm text-customFeedCardGreyText1">
                                                {formatCustomDate(
                                                    createdDate,
                                                    isComplete ? "Submitted" : status === "Review in progress" ? "Submitted" : "Created",
                                                )}
                                            </p>
                                            <p className="text-sm text-customFeedCardGreyText1">
                                                By {createdBy?.firstName} {createdBy?.lastName}
                                            </p>
                                        </div>

                                        <div className="flex h-full flex-col items-end justify-between">
                                            {isComplete || isReviewComplete ? (
                                                <CheckCircle className="h-5 w-5 fill-green-600 text-white" />
                                            ) : (
                                                <Trash2 
                                                    className="h-5 w-5 cursor-pointer text-customNavy1 hover:text-customNavy" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(assessment);
                                                    }}
                                                />
                                            )}

                                            {showUpdate && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUpdateAssessment(assessment.id, assessment);
                                                    }}
                                                    disabled={isUpdatingAssessment}
                                                    className="poppins-semibold py-2 text-sm text-customTextLightNavy hover:text-customTextLightNavy/80 disabled:opacity-50 flex items-center justify-center "
                                                >
                                                    {isUpdatingAssessment ? (
                                                        <InnerLoader loading={true} text="Preparing..." style={true} />
                                                    ) : (
                                                        "Update"
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-md border border-gray-200 p-8 text-center text-customGrey1">No assessments have been started yet.</div>
                    )}
                </div>
            </section>
                    
            {showDeleteDialog && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center ">
                        <div className="fixed inset-0 bg-black opacity-30" onClick={handleDeleteCancel} />
                        
                        <div className="relative mx-auto w-full max-w-xl rounded bg-white border border-gray-300 px-6 py-3 shadow-lg">
                            <div className="mb-4 flex items-center justify-between border-b border-gray-300 pb-2 pt-3">
                                <h3 className="text-base font-medium text-customBlack">Delete assessment</h3>
                                <button
                                    type="button"
                                    onClick={handleDeleteCancel}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mb-6 py-4">
                                <p className="text-sm text-customBlack2">
                                    Are you sure you want to delete this assessment? Any changes you have made will be lost.
                                </p>
                            </div>

                            <div className="flex justify-end space-x-3 border-t border-gray-300 pt-3">
                                <button
                                    type="button"
                                    onClick={handleDeleteCancel}
                                    className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteConfirm}
                                    className="rounded bg-customDropdownBorder px-4 py-2 text-sm text-white hover:bg-customDropdownBorder/90 disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <InnerLoader loading={true} text="Deleting..." />
                                    ) : (
                                        "Delete"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

NeedsAssessment.propTypes = {
    clientName: PropTypes.string,
    assessmentData: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            submittedAt: PropTypes.string,
            reviewedAt: PropTypes.string,
            updatedAt: PropTypes.string,
            createdAt: PropTypes.string.isRequired,
            submittedBy: PropTypes.shape({
                firstName: PropTypes.string,
                lastName: PropTypes.string,
            }),
            updatedBy: PropTypes.shape({
                firstName: PropTypes.string,
                lastName: PropTypes.string,
            }),
            createdBy: PropTypes.shape({
                firstName: PropTypes.string,
                lastName: PropTypes.string,
            }),
        }),
    ).isRequired,
    onAssessmentUpdate: PropTypes.func,
};

export default NeedsAssessment;
