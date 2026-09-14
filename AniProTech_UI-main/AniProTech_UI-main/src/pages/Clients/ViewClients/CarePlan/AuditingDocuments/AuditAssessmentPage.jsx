import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useGlobalStore } from "../../../../../stores/useGlobalStore";
import { ArrowLeftIcon } from "lucide-react";
import { additionalAssessments, initialAssessments } from "../../../../../data/clients/clientCarePlanData";
import { getAdditionalAssessmentDescription, getAdditionalAssessmentQuestions, getAuditingAssessmentDescription, getAuditQuestions } from "../../../../../constants/clientCarePlan";
import { capitalizeFirstLetter } from "../../../../../utils/common";
import AssessmentForm from "../components/AssessmentSections/AssessmentForm";


const AuditAssessmentPage = () => {
    const { id, assessmentType } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clientsPersonalDetailData } = useGlobalStore();
    const [isLoading, setIsLoading] = useState(true);
    const [assessmentData, setAssessmentData] = useState(null);
    const [activeSection, setActiveSection] = useState("bathing");
    const [assessmentName, setAssessmentName] = useState("");

    const isUpdateMode = searchParams.get("mode") === "update";
    const assessmentId = searchParams.get("id");
    const urlAssessmentName = searchParams.get("name");
    const clientName = clientsPersonalDetailData?.firstName || "the client";

    useEffect(() => {
        if (urlAssessmentName) {
            setAssessmentName(decodeURIComponent(urlAssessmentName));
        }
    }, [urlAssessmentName]);

    const assessment = [...initialAssessments, ...additionalAssessments].find((a) => a.path === assessmentType);
    const title = assessment
        ? assessment.title
        : assessmentType
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");


    // Get description based on assessment type
    const description = getAuditingAssessmentDescription(assessmentType);

    // Get questions based on assessment type
    const questions = getAuditQuestions(assessmentType);

    // Get unique sections and their questions
    const sections = questions.reduce((acc, question) => {
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

    // Set initial active section based on first section
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
                    // In real implementation, fetch assessment data from API
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

    const handleSubmit = async (formData) => {
        try {
            console.log("Submitting assessment data:", {
                assessmentId,
                assessmentType,
                assessmentName,
                id,
                data: formData,
            });

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
        // navigate(`/admin/clients/${id}/care-plan`);
    };

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const yOffset = -250;
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;

            window.scrollTo({ top: y, behavior: "smooth" });
        }
    };

    const handleAssessmentNameChange = (newName) => {
        setAssessmentName(newName);
    };

    const handleAssessmentUpdate = () => {
        // Placeholder function - in real implementation, this would refresh assessment data
        console.log("Assessment updated - refreshing data");
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
                        <h1 className="poppins-medium mb-2 text-lg text-customBlack1">{capitalizeFirstLetter(title)}</h1>   
                        <p className="text-sm text-customFeedCardGreyText1">
                            {description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content + Sidebar */}
            <div className="mx-auto flex gap-10 px-6 pb-40 pt-7 md:px-20 xl:px-60">
                <div className="flex-1">
                    <AssessmentForm
                        isUpdateMode={isUpdateMode}
                        assessmentType={assessmentType}
                        initialData={assessmentData}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        clientName={clientName}
                        sections={sections}
                        assessmentName={assessmentName}
                        onAssessmentNameChange={handleAssessmentNameChange}
                        onAssessmentUpdate={handleAssessmentUpdate}
                    />
                </div>

                {/* Sidebar Navigation */}
                <div className="sticky top-60 hidden w-60 space-y-3 self-start border-l pl-4 lg:block">
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

export default AuditAssessmentPage;
