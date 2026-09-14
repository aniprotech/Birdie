import { FileText, SquarePen } from "lucide-react";
import { useState } from "react";
import EditSkillsPopup from "./EditSkillsPopup";
import useScrollToTop from "../../../../hooks/useScrollToTop";
import { extractDateOnly, formatDisplayName, getCleanFileName, isNotEmpty } from "../../../../utils/common";

const EditSkills = ({ data = [], setData, mode, setMode, refetch }) => {
    const [showSkillPopup, setShowSkillPopup] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [selectedData, setSelectedData] = useState(null);
    useScrollToTop();

    const handleClick = (index = null, item) => {
        setSelectedIndex(index);
        setSelectedData(item);
        setShowSkillPopup(true);
    };
    const skillsToDisplay = isNotEmpty(data) ? data : [];

    return (
        <div>
            {isNotEmpty(skillsToDisplay) ? (
                <div className="mb-5 flex items-center justify-between px-3 py-4 md:px-1">
                    <h2 className="poppins-medium text-xl text-customTextColor">Skills</h2>
                    <button
                        onClick={handleClick}
                        className="poppins-medium rounded border border-customNavy px-4 py-1.5 text-sm text-customNavy"
                    >
                        Add
                    </button>
                </div>
            ) : (
                ""
            )}
            {isNotEmpty(skillsToDisplay) ? (
                <div className="w-60 overflow-x-auto md:w-[550px] lg:w-[600px] xl:w-full">
                    <div className="rounded border border-gray-200 bg-white">
                        {/* Header */}
                        <div className="md:text-md flex bg-gray-50 px-4 py-4 text-sm text-customDefaultTextColor">
                            <div className="w-[20%] min-w-[150px]">Certificates</div>
                            <div className="w-[20%] min-w-[150px]">Name</div>
                            <div className="w-[30%] min-w-[200px]">Document</div>
                            <div className="w-[15%] min-w-[120px]">Added</div>
                            <div className="w-[15%] min-w-[120px]">Expires</div>
                            <div className="w-[10%] min-w-[100px] text-right"></div>
                        </div>

                        {/* Rows */}
                        {skillsToDisplay.map((item, index) => (
                            <div
                                key={index}
                                className="md:text-md flex px-4 py-4 text-sm text-customTextGrey1"
                            >
                                <div className="w-[20%] min-w-[150px]">-</div>
                                <div className="w-[20%] min-w-[150px]">{formatDisplayName(item.name) || "-"}</div>
                                <div className="w-[30%] min-w-[200px]">
                                    {item.skillsFilePath ? (
                                        <a
                                            href={item?.skillsFilePath}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-customTextNavy underline"
                                        >
                                            <FileText className="h-4 w-4 text-customTextGrey1" />
                                            {getCleanFileName(item.skillsFilePath)}
                                        </a>
                                    ) : (
                                        "-"
                                    )}
                                </div>
                                <div className="w-[15%] min-w-[120px]">
                                    {item.createdAt ? extractDateOnly(item.createdAt) : item?.updatedAt ? extractDateOnly(item?.updatedAt) : "-"}
                                </div>
                                <div className="w-[15%] min-w-[120px]">{item.endsOn || "-"}</div>
                                <div className="w-[10%] min-w-[100px] text-right">
                                    <button
                                        onClick={() => {
                                            handleClick(index, item);
                                        }}
                                    >
                                        <SquarePen className="h-4 w-4 text-customNavy" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center space-y-4 rounded-md border border-customBorder bg-white px-5 my-5 py-10 lg:px-20 xl:mx-20">
                    <FileText className="h-6 w-6 text-customNavy" />
                    <div className="text-center text-lg text-customTextGrey1">Add training information</div>
                    <button
                        onClick={handleClick}
                        className="rounded border border-customNavy px-4 py-2 text-sm font-semibold text-customTextGrey"
                    >
                        Add info
                    </button>
                </div>
            )}

            {showSkillPopup && (
                <EditSkillsPopup
                    onClose={() => setShowSkillPopup(false)}
                    data={selectedData}
                    setData={setData}
                    setMode={setMode}
                    refetch={refetch}
                />
            )}
        </div>
    );
};

export default EditSkills;
