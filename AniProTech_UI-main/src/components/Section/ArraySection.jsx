import { FolderDown, SquarePen, TriangleAlert } from "lucide-react";
import { useNavigationHelpers } from "../../hooks/useNavigationHelpers";
import { formatDateMonth, getCleanFileName, isNotEmpty } from "../../utils/common";

const ArraySection = ({ title, data, stateData }) => {
    const { navigate, id } = useNavigationHelpers();

    return (
        <div className="mb-6">
            <div className="mb-4 flex items-center justify-between text-base md:text-xl">
                <h2 className="poppins-medium py-2 text-xl text-customTextColor">{title}</h2>
                <button
                    className="flex items-center rounded border border-customTextNavy px-3 py-1 text-base font-medium text-customTextNavy hover:underline"
                    onClick={() => {
                        navigate(`/admin/teams/${id}/onboarding/edit`, {
                            state: { data },
                        });
                    }}
                >
                    <SquarePen className="mr-1 h-4 w-4" />
                    Edit
                </button>
            </div>

            <div className="divide-y divide-customBorder overflow-hidden rounded-md border border-customBorder">
                {isNotEmpty(stateData) ? (
                    stateData?.map((doc, index) => (
                        <div
                            key={index}
                            className="flex flex-col justify-between gap-4 p-4 md:flex-row md:items-center"
                        >
                            {/* Left side: Description only */}
                            <div className="w-full text-sm text-customTextColor md:w-1/2">{doc?.additionalDocumentDescription || "-"}</div>

                            {/* Right side: Category, File, Expiry */}
                            <div className="flex w-full flex-col gap-2 md:w-1/2 md:justify-start">
                            <div className="flex items-center gap-5">
                                {doc?.additionalDocumentCategory && (
                                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                                        {doc.additionalDocumentCategory}
                                    </span>
                                )}

                                {doc?.additionaDocumentFilePath && (
                                    <a
                                        href={doc.additionaDocumentFilePath}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-sm text-customNavy1 underline"
                                    >
                                        {getCleanFileName(doc.additionaDocumentFilePath)} <FolderDown className="ml-1 inline" size={16} />
                                    </a>
                                )}
                                </div>
                                {doc?.additionalDocumentExpires && (
                                    <div className="flex items-center text-sm text-yellow-600">
                                        <TriangleAlert
                                            className="mr-1"
                                            size={18}
                                        />
                                        Expires: {formatDateMonth(doc.additionalDocumentExpiresOn)}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-4 text-sm text-gray-500">No additional documents available.</div>
                )}
            </div>
        </div>
    );
};

export default ArraySection;
