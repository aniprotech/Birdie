import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { useGlobalStore } from "../../../../stores/useGlobalStore";
import AssessmentCard from "./components/AssessmentCard";
import { additionalAssessments, auditingDocuments, documents, initialAssessments } from "../../../../data/clients/clientCarePlanData";
import { UserRound, Check } from "lucide-react";
// import useScrollToTop from "../../../../hooks/useScrollToTop";

const CarePlanIndex = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { clientsPersonalDetailData } = useGlobalStore();
    const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : "the client";

    // useScrollToTop();
    const handleNavigate = (path) => {
        if (path === "client-info") {
            navigate(`/admin/clients/${id}/client-info`);
        } else {
            navigate(path);
        }
    };

    return (
        <div className="mx-auto px-2 py-10 md:px-16 md:py-16 lg:px-28">
            <div className="">
                <h1 className="poppins-medium mb-2 text-lg text-customBlack">About {clientName}</h1>
                <p className="text-sm text-customGrey1">Capture basic information about {clientName}, including their likes and preferences.</p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 pb-10 pt-3 md:grid-cols-2 lg:grid-cols-2">
                <div
                    onClick={() => handleNavigate("client-info")}
                    className="relative flex cursor-pointer flex-col rounded-md border border-customNavy/40 bg-white p-4 shadow transition-all hover:bg-customCarerFeedBg/50"
                >
                    <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-customFeedCardBg1 p-2">
                            <UserRound className="h-5 w-5 text-[#1E817C]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="poppins-medium mb-2 text-sm text-customBlack">Client information</h3>
                            <div className="flex items-center gap-1 text-xs">
                                <Check className="h-3.5 w-3.5 text-[#1E817C]" />
                                <span className="text-[#1E817C]">Updated {format(new Date(), "dd MMM yyyy")}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div></div>
                <div></div>
            </div>

            <div className="space-y-16">
                {/* Initial Assessments Section */}
                <section>
                    <h2 className="poppins-medium mb-2 text-lg text-customBlack">Initial assessments</h2>
                    <p className="mb-6 text-sm text-customGrey1">Carry out a holistic initial assessment across eight key areas of care.</p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                        {initialAssessments?.map((assessment) => (
                            <AssessmentCard
                                key={assessment.id}
                                id={assessment.id}
                                title={assessment.title}
                                path={assessment.path}
                                lastUpdated={new Date().toISOString()} // Replace with actual last updated date
                                onClick={() => handleNavigate(assessment.path)}
                            />
                        ))}
                    </div>
                </section>

                {/* Additional Assessments Section */}
                <section>
                    <h2 className="poppins-medium mb-2 text-lg text-customBlack">Additional assessments</h2>
                    <p className="mb-6 text-sm text-customGrey1">
                        Select additional assessments that are relevant to {clientName}&apos;s needs and potential risks.
                    </p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                        {additionalAssessments?.map((assessment) => (
                            <AssessmentCard
                                key={assessment.id}
                                path={assessment.path}
                                id={assessment.id}
                                title={assessment.title}
                                onClick={() => handleNavigate(assessment.path)}
                            />
                        ))}
                    </div>
                </section>

                {/* Auditing Documents Section */}
                <section>
                    <h2 className="poppins-medium mb-2 text-lg text-customBlack">Auditing documents</h2>
                    <p className="mb-6 text-sm text-customGrey1">Record client involvement for the purposes of auditing and quality monitoring.</p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                        {auditingDocuments?.map((doc) => (
                            <AssessmentCard
                                key={doc.id}
                                id={doc.id}
                                title={doc.title}
                                onClick={() => handleNavigate(doc.path)}
                            />
                        ))}
                    </div>
                </section>

                {/* Documents Section */}
                <section>
                    <h2 className="poppins-medium mb-2 text-lg text-customBlack">Documents</h2>
                    <p className="mb-6 text-sm text-customGrey1">
                        Store and download care planning documents that can be shared with carers and third parties.
                    </p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                        {documents?.map((doc) => (
                            <AssessmentCard
                                key={doc.id}
                                id={doc.id}
                                title={doc.title}
                                onClick={() => handleNavigate(doc.path)}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CarePlanIndex;
