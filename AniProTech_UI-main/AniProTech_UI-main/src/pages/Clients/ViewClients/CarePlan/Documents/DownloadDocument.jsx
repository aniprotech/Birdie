import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalStore } from "../../../../../stores/useGlobalStore";
import { ArrowLeftIcon, Download } from "lucide-react";
import { downloadDocumentSections } from "../../../../../constants/clientCarePlan";
import { Tooltip } from "react-tooltip";
import DotLoader from "../../../../../components/Loader/DotLoader";
import useScrollToTop from "../../../../../hooks/useScrollToTop";

const DownloadDocument = () => {
    const navigate = useNavigate();
    const { clientsPersonalDetailData } = useGlobalStore();
    const [isLoading, setIsLoading] = useState(true);

    const clientName = clientsPersonalDetailData?.firstName || "the client";

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 1000);
    }, []);

    useScrollToTop();

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleDownload = (sectionId, itemId) => {
        console.log(`Downloading ${sectionId} - ${itemId}`);
        window.print();
    };

    const renderSection = (section) => {
        if (section.noInfo) {
            return (
                <div className="text-center py-8">
                    <p className="text-sm text-[#666]">No information available</p>
                    <p className="text-sm mt-1">
                        Add details on{" "}
                        <button 
                            onClick={() => navigate(`/clients/care-plan/${section.linkTo}`)}
                            className="text-customTextLightNavy hover:underline"
                        >
                            {section.title}
                        </button>{" "}
                        to generate PDFs on this page
                    </p>
                </div>
            );
        }

        if (!section.items || section.items.length === 0) {
            return (
                <div className="text-center py-8">
                    <p className="text-sm text-[#666]">No items available</p>
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {section.items.map((item) => {
                    const Icon = item.icon;
                    const tooltipId = `tooltip-${section.id}-${item.id}`;
                    return (
                        <div
                            key={item.id}
                            className="flex items-center justify-between p-4 border border-[#e5e7eb] rounded-md hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {Icon && <Icon className="w-5 h-5 text-[#666]" />}
                                <span className="text-[15px] text-[#1a1a1a]">{item.label}</span>
                                {item.date && (
                                    <span className="text-sm text-[#666]">{item.date}</span>
                                )}
                            </div>
                            {item.downloadable && (
                                <>
                                    <button
                                        data-tooltip-id={tooltipId}
                                        onClick={() => handleDownload(section.id, item.id)}
                                        className="text-customTextLightNavy hover:text-customTextLightNavy/80"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                    <Tooltip
                                        id={tooltipId}
                                        content="Download PDF"
                                        place="left"
                                        className="!bg-customBlack !text-white !border !border-gray-200 !shadow-md !px-2 !py-1 !text-sm"
                                    />
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <DotLoader loading={isLoading} style="bg-white" />
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
                        Back to {clientName}&apos;s care plan
                    </button>

                    <div>
                        <h1 className="poppins-medium mb-2 text-lg text-customBlack1">
                            Download documents
                        </h1>
                        <p className="text-sm text-customFeedCardGreyText1">
                            Download the section you need for {clientName}&apos;s PDF
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content + Sidebar */}
            <div className="mx-auto flex gap-10 px-6 pb-40 pt-7 md:px-20 xl:px-60">
                {/* Main Content */}
                <div className="flex-1">
                    <div className="space-y-12">
                        {downloadDocumentSections?.map((section) => (
                            <div key={section.id} id={section.id} className="scroll-mt-24">
                                <h2 className="text-xl poppins-medium text-customBlack1 mb-6">{section.title}</h2>
                                {renderSection(section)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Navigation */}
                <div className="sticky top-60 hidden w-60 space-y-2 self-start border-l pl-4 lg:block">
                    {downloadDocumentSections?.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => {
                                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={`block w-full rounded p-2 text-left text-sm transition-colors poppins-medium text-customFeedCardBlueText hover:bg-customFeedCardBlueText/5 hover:underline`}
                        >
                            {section.title}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DownloadDocument;
