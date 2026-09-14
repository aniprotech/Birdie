import PropTypes from "prop-types";
import { useLocation, useNavigate } from "react-router-dom";
import { useGlobalStore } from "../../../../../stores/useGlobalStore";

const AuditNeedAssessment = ({ clientName, previousAssessments = [] }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const pathSegments = location?.pathname.split("/");
    const assessmentType = pathSegments[pathSegments.length - 1]; // last segment

    const { clientsPersonalDetailData } = useGlobalStore();

    const handleStartAssessment = () => {
        navigate(`/admin/clients/${clientsPersonalDetailData?.id}/care-plan/${assessmentType}/auditing-assessment?mode=create`);
    };

    const handleUpdateAssessment = (assessmentId) => {
        navigate(`/admin/clients/${clientsPersonalDetailData?.id}/care-plan/${assessmentType}/auditing-assessment?mode=update&id=${assessmentId}`);
    };

    return (
        <section
            id="needs"
            className="mb-10 lg:mb-20 xl:mb-32"
        >
            <h2 className="poppins-medium text-lg text-customBlack">1. Needs assessment</h2>
            <p className="mb-3 text-sm text-customFeedCardGreyText1">
                Record {clientName || "client"}&apos;s level of independence for each everyday activities activity, and any support that is required
            </p>

            <button
                onClick={handleStartAssessment}
                className="rounded border border-customNavy/50 px-4 py-2 text-sm text-customNavy hover:bg-customTextLightNavy/10"
            >
                Start a new assessment
            </button>

            <div className="mt-6">
                <h3 className="poppins-medium mb-4 text-base text-customBlack">Previous assessments</h3>
                {previousAssessments.length > 0 ? (
                    <div className="space-y-4">
                        {previousAssessments.map((assessment, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between rounded-md border border-gray-500 px-8 py-4"
                            >
                                <div>
                                    <h4 className="text-lg font-medium text-customBlack">{assessment.status}</h4>
                                    <p className="text-sm text-customFeedCardGreyText1">Submitted {assessment.date}</p>
                                    <p className="text-sm text-customFeedCardGreyText1">By {assessment.submittedBy}</p>
                                </div>
                                <button
                                    onClick={() => handleUpdateAssessment(assessment.id)}
                                    className="poppins-semibold px-4 py-2 text-sm text-customTextLightNavy hover:bg-customTextLightNavy/10"
                                >
                                    Update
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-md border border-gray-200 p-8 text-center text-customGrey1">No assessments have been started yet.</div>
                )}
            </div>
        </section>
    );
};

AuditNeedAssessment.propTypes = {
    clientName: PropTypes.string,
    previousAssessments: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            status: PropTypes.string.isRequired,
            date: PropTypes.string.isRequired,
            submittedBy: PropTypes.string.isRequired,
        }),
    ),
    assessmentType: PropTypes.string,
};

export default AuditNeedAssessment;
