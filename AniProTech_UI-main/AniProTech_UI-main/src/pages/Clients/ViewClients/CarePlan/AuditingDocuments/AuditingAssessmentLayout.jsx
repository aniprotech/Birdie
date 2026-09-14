import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { useGlobalStore } from "../../../../../stores/useGlobalStore";
import useScrollToTop from "../../../../../hooks/useScrollToTop";
import AuditNeedAssessment from "./AuditNeedAssessment";

const AuditingAssessmentLayout = ({
    title,
    description,
    previousAssessments = [],
    onSaveChanges,
    onReviewAssessment,
}) => {
    const navigate = useNavigate();
    const clientsPersonalDetailData = useGlobalStore((state) => state.clientsPersonalDetailData);
    useScrollToTop();


    const handleBackClick = () => {
        navigate(`/admin/clients/${clientsPersonalDetailData?.id}/care-plan`);
    };


    return (
        <div className="relative min-h-screen bg-white">
            {/* Sticky Header */}
            <div className="sticky top-[60px] z-50 border-b bg-white">
                <div className="mx-auto px-6 py-7 md:px-20 xl:px-32">
                    <button
                        onClick={handleBackClick}
                        className="text-customFeedCardBlueText mb-6 flex items-center text-sm hover:text-customTextLightNavy/80"
                    >
                        <ArrowLeftIcon className="mr-1 h-5 w-5" />
                        Back
                    </button>

                    <div>
                        <h1 className="poppins-medium mb-2 text-lg text-customBlack1">{title}</h1>
                        <p className="text-customFeedCardGreyText1 text-sm">{description}</p>
                    </div>
                </div>
            </div>

            {/* Main Content + Sidebar */}
            <div className="mx-auto flex gap-10 px-6 pb-40 pt-7 md:px-20 xl:px-60">
                {/* Main Sections */}
                <div className="flex-1">
                    <AuditNeedAssessment
                        clientName={clientsPersonalDetailData?.firstName}
                        previousAssessments={previousAssessments}
                        onReviewAssessment={onReviewAssessment}
                        onBackClick={handleBackClick}
                        title={title}
                        description={description}
                    />
                </div>

            </div>
        </div>
    );
};

AuditingAssessmentLayout.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    previousAssessments: PropTypes.arrayOf(
        PropTypes.shape({
            status: PropTypes.string.isRequired,
            date: PropTypes.string.isRequired,
            submittedBy: PropTypes.string.isRequired,
        }),
    ),
    onSaveChanges: PropTypes.func,
    onReviewAssessment: PropTypes.func,
    searchPlaceholder: PropTypes.string,
    defaultTasks: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            title: PropTypes.string.isRequired,
            description: PropTypes.string,
            frequency: PropTypes.string,
            timing: PropTypes.string,
        }),
    ),
    onAddRisk: PropTypes.func,
};

export default AuditingAssessmentLayout; 