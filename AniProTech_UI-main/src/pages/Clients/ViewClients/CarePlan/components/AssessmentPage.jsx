import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useGlobalStore } from "../../../../../stores/useGlobalStore";
import { ArrowLeftIcon } from "lucide-react";
import AssessmentForm from "./AssessmentSections/AssessmentForm";
import { additionalAssessments, initialAssessments } from "../../../../../data/clients/clientCarePlanData";
import { getAssessmentQuestions } from "../../../../../constants/clientCarePlan";

const AssessmentPage = () => {
    const { id, assessmentType } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clientsPersonalDetailData } = useGlobalStore();
    const [isLoading, setIsLoading] = useState(true);
    const [assessmentData, setAssessmentData] = useState(null);
    const [activeSection, setActiveSection] = useState("bathing");

    const isUpdateMode = searchParams.get("mode") === "update";
    const assessmentId = searchParams.get("id");
    const clientName = clientsPersonalDetailData?.firstName || "the client";

    const assessment = [...initialAssessments, ...additionalAssessments]?.find((a) => a.path === assessmentType);
    const title = assessment
        ? assessment.title
        : assessmentType
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

    const questions = getAssessmentQuestions(assessmentType);

    const sections = questions?.reduce((acc, question) => {
        if (question.section && question.section_id) {
            if (!acc.find((s) => s.id === question.section_id)) {
                acc.push({
                    id: question.section_id,
                    label: question.section,
                    questions: questions.filter((q) => q.section_id === question.section_id || (q.section === question.section && !q.section_id)),
                });
            }
        }
        return acc;
    }, []);

    useEffect(() => {
        if (sections.length > 0) {
            setActiveSection(sections[0].id);
        }
    }, [sections]);

    useEffect(() => {
        const handleScroll = () => {
            sections.forEach(({ id }) => {
                const element = document.getElementById(id);
                if (element) {
                    const { top, bottom } = element.getBoundingClientRect();
                    if (top <= 100 && bottom >= 100) {
                        setActiveSection(id);
                    }
                }
            });
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [sections]);

    useEffect(() => {
        const loadAssessment = async () => {
            setIsLoading(true);
            try {
                if (isUpdateMode && assessmentId) {
                    const mockData = {};
                    questions.forEach((question) => {
                        mockData[question.id] = {
                            answer: question.answer_type.type === "multiple_choice" ? [] : "",
                            details: "",
                        };
                    });
                    setAssessmentData(mockData);
                }
            } catch (error) {
                console.error("Error loading assessment:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadAssessment();
    }, [isUpdateMode, assessmentId, questions]);

    const handleSubmit = async () => {
        try {

            navigate(`/admin/clients/${id}/care-plan`);
        } catch (error) {
            console.error("Error saving assessment:", error);
        }
    };

    const handleCancel = () => {
        navigate(`/admin/clients/${id}/care-plan`);
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleAssessmentUpdate = () => {
            console.log("Assessment updated - refreshing data");
    };

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const yOffset = -250;
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;

            window.scrollTo({ top: y, behavior: "smooth" });
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-customNavy"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Sticky Header */}
            <div className="sticky top-[60px] z-50 border-b bg-white shadow-sm">
                <div className="mx-auto px-6 py-7 md:px-20 xl:px-32">
                    <button
                        onClick={handleBackClick}
                        className="mb-6 flex items-center text-sm text-customFeedCardBlueText transition-colors hover:text-customTextLightNavy/80"
                    >
                        <ArrowLeftIcon className="mr-1 h-5 w-5" />
                        Back
                    </button>

                    <div>
                        <h1 className="poppins-medium mb-2 text-lg text-customBlack1">
                            {clientName}&apos;s {title.toLowerCase()} assessment
                        </h1>
                        <p className="text-sm text-customFeedCardGreyText1">
                            Record {clientName}&apos;s level of independence for each{" "}
                            {title.toLowerCase() === "everyday activities" ? "everyday" : title.toLowerCase()} activity, and any support that is
                            required
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content + Sidebar */}
            <div className="mx-auto flex gap-10 px-6 pb-40 pt-7 md:px-20 xl:px-60">
                {/* Main Content */}
                <div className="flex-1">
                    <AssessmentForm
                        isUpdateMode={isUpdateMode}
                        assessmentType={assessmentType}
                        initialData={assessmentData}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        clientName={clientName}
                        sections={sections}
                        assessmentName=""
                        onAssessmentNameChange={() => {}}
                        onAssessmentUpdate={handleAssessmentUpdate}
                    />
                </div>

                {/* Sidebar Navigation */}
                <div className="sticky top-60 hidden w-40 space-y-7 self-start border-l pl-4 lg:block">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => scrollToSection(section.id)}
                            className={`block w-full rounded p-1 text-left text-sm capitalize transition-colors ${
                                activeSection === section.id
                                    ? "poppins-medium text-customFeedCardBlueText hover:bg-customFeedCardBlueText/5 hover:underline"
                                    : "poppins-medium text-customFeedCardBlueText hover:bg-customFeedCardBlueText/5 hover:underline"
                            }`}
                        >
                            {section.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AssessmentPage;
