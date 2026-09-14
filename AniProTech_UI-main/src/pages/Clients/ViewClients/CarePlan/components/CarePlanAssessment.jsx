import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useGlobalStore } from "../../../../../stores/useGlobalStore";
import TextField from "../../../../../components/TextInput/TextInput";
import TextAreaField from "../../../../../components/TextInput/TextAreaField";
import { ArrowLeftIcon } from "lucide-react";
import useScrollToTop from "../../../../../hooks/useScrollToTop";
import TaskEditModal from "./TaskEditModal";
import RiskModal from "./RiskModal";

const CarePlanAssessment = ({
    title,
    description,
    previousAssessments = [],
    onSaveChanges,
    onReviewAssessment,
    searchPlaceholder = "Search for tasks to add...",
    defaultTasks = [],
    onAddRisk,
}) => {
    const navigate = useNavigate();
    const clientsPersonalDetailData = useGlobalStore((state) => state.clientsPersonalDetailData);
    const [summaryText, setSummaryText] = useState("");
    const [tasks, setTasks] = useState(defaultTasks);
    const [activeSection, setActiveSection] = useState("needs");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [condition, setCondition] = useState("");
    useScrollToTop();

    useEffect(() => {
        const handleScroll = () => {
            const sections = ["needs", "summary", "tasks", "risks"];
            sections.forEach((section) => {
                const element = document.getElementById(section);
                if (element) {
                    const { top, bottom } = element.getBoundingClientRect();
                    if (top <= 100 && bottom >= 100) {
                        setActiveSection(section);
                    }
                }
            });
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleBackClick = () => {
        navigate(`/admin/clients/${clientsPersonalDetailData?.id}/care-plan`);
    };

    const handleSaveChanges = () => {
        if (onSaveChanges) {
            onSaveChanges(summaryText);
        }
    };

    const handleReviewAssessment = () => {
        if (onReviewAssessment) {
            onReviewAssessment(condition);
        }
    };

    const handleTaskEdit = (taskId) => {
        const task = tasks.find((t) => t.id === taskId);
        setSelectedTask(task);
        setIsEditModalOpen(true);
    };

    const handleTaskSave = (updatedTask) => {
        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === selectedTask.id
                    ? {
                          ...task,
                          description: updatedTask.details,
                          frequency: updatedTask.frequency,
                          timing: updatedTask.schedule.selectedSessions.join(", "),
                          startDate: updatedTask.startDate,
                          endDate: updatedTask.endDate,
                          startTime: updatedTask.startTime,
                          endTime: updatedTask.endTime,
                      }
                    : task,
            ),
        );
    };

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const yOffset = -250;
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;

            window.scrollTo({ top: y, behavior: "smooth" });
        }
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
                        Back to {clientsPersonalDetailData?.firstName}&apos;s care plan
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
                <div className="flex-1 space-y-10 lg:space-y-20 xl:space-y-32">
                    {/* Needs Assessment */}
                    <section id="needs">
                        <h2 className="poppins-medium text-lg text-customBlack">1. Needs assessment</h2>
                        <p className="text-customFeedCardGreyText1 mb-3 text-sm">
                            Record {clientsPersonalDetailData?.firstName || "client"}&apos;s level of independence for each everyday activities activity, and any support that is required
                        </p>
                        
                        <button
                            onClick={handleReviewAssessment}
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
                                                <p className="text-customFeedCardGreyText1 text-sm">Submitted {assessment.date}</p>
                                                <p className="text-customFeedCardGreyText1 text-sm">By {assessment.submittedBy}</p>
                                            </div>
                                            <button className="poppins-semibold px-4 py-2 text-sm text-customTextLightNavy hover:bg-customTextLightNavy/10">
                                                Update
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-md border border-gray-200 p-8 text-center text-customGrey1">
                                    No assessments have been started yet.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Summary Section */}
                    <section id="summary">
                        <h2 className="poppins-medium text-lg text-customBlack">2. Assessment summary and outcomes</h2>
                        <p className="text-customFeedCardGreyText1 mb-3 text-sm">Describe how your team can support the client.</p>
                        <TextAreaField
                            label=""
                            name="summaryText"
                            value={summaryText}
                            valueChange={(e) => setSummaryText(e.target.value)}
                            placeholder="e.g. Client needs support with getting dressed in the morning."
                        />
                        <div className="mt-4 flex items-center justify-between">
                            <button
                                onClick={handleSaveChanges}
                                disabled={summaryText.length === 0}
                                className="poppins-medium rounded border border-gray-500 px-4 py-2 text-sm text-customNavy1 disabled:bg-customTextLightNavy/10"
                            >
                                Save changes
                            </button>
                            <span className="text-sm text-customGrey1">{summaryText.length} / 3000 characters</span>
                        </div>
                    </section>

                    {/* Tasks Section */}
                    <section id="tasks">
                        <h2 className="poppins-medium text-lg text-customBlack">3. Tasks</h2>
                        <p className="text-customFeedCardGreyText1 mb-3 text-sm">Add tasks to support the client in achieving their outcomes.</p>

                        <div className="mb-6">
                            <TextField
                                label=""
                                name="searchTasks"
                                type="text"
                                placeholder={searchPlaceholder}
                            />
                        </div>

                        {tasks.length > 0 ? (
                            <div className="space-y-4">
                                {tasks.map((task, index) => (
                                    <div
                                        key={index}
                                        className="rounded-lg bg-gray-50 p-4"
                                    >
                                        <div className="mb-2 flex items-start justify-between">
                                            <h3 className="font-medium text-customBlack">{task.title}</h3>
                                            <button
                                                onClick={() => handleTaskEdit(task.id)}
                                                className="text-customTextLightNavy hover:text-customTextLightNavy/80"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        <p className="mb-2 text-sm text-customGrey1">{task.description}</p>
                                        <div className="text-sm text-customGrey1">
                                            <p>{task.frequency}</p>
                                            <p>{task.timing}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </section>

                    {/* Risks Section */}
                    <section id="risks">
                        <h2 className="poppins-medium text-lg text-customBlack">4. Risks and mitigations</h2>
                        <p className="text-customFeedCardGreyText1 mb-3 text-sm">
                            Record any risks the client presents with, and the measures taken to mitigate them. If you feel the client&apos;s risk
                            level has changed, you should consider the need to review the Care Plan and RAG status in Birdie and update accordingly.
                        </p>

                        <button
                            onClick={() => setIsRiskModalOpen(true)}
                            className="rounded border border-customNavy/50 px-4 py-2 text-sm text-customNavy hover:bg-customTextLightNavy/10"
                        >
                            Add new risk
                        </button>

                        {!tasks.length && (
                            <div className="mt-6 rounded-md border border-gray-200 p-8 text-center text-customGrey1">
                                No risk added
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar Navigation */}
                <div className="sticky top-60 hidden w-40 space-y-7 self-start border-l pl-4 lg:block">
                    {["needs", "summary", "tasks", "risks"].map((section) => (
                        <button
                            key={section}
                            onClick={() => scrollToSection(section)}
                            className={`block w-full text-left text-sm capitalize transition-colors ${
                                activeSection === section
                                    ? "text-customFeedCardBlueText poppins-semibold"
                                    : "text-customGrey1 hover:text-customTextLightNavy"
                            }`}
                        >
                            {section}
                        </button>
                    ))}
                </div>
            </div>

            {/* Task Edit Modal */}
            <TaskEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                task={selectedTask}
                onSave={handleTaskSave}
            />

            {/* Risk Modal */}
            <RiskModal
                isOpen={isRiskModalOpen}
                onClose={() => setIsRiskModalOpen(false)}
                onSave={onAddRisk}
            />
        </div>
    );
};

CarePlanAssessment.propTypes = {
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

export default CarePlanAssessment;
