import { Check, Trash2, X } from "lucide-react";

export const initialAssessments = [
    { id: "personal-care", title: "Personal care", path: "personal-care" },
    { id: "everyday-activities", title: "Everyday activities", path: "everyday-activities" },
    { id: "social-support", title: "Social support", path: "social-support" },
    { id: "environmental", title: "Environmental", path: "environmental" },
    { id: "nutrition-hydration", title: "Nutrition and hydration", path: "nutrition-hydration" },
    { id: "medical", title: "Medical", path: "medical" },
    { id: "administration", title: "Administration", path: "administration" },
    { id: "psychological", title: "Psychological", path: "psychological" },
];

export const additionalAssessments = [
    { id: "behaviour", title: "Behaviour", path: "behaviour" },
    { id: "communication", title: "Communication", path: "communication" },
    { id: "condition-specific", title: "Condition specific", path: "condition-specific" },
    { id: "control-substances", title: "Control of Substances Hazardous to Health (COSHH)", path: "control-substances" },
    { id: "covid", title: "COVID-19", path: "covid" },
    { id: "dysphagia", title: "Dysphagia", path: "dysphagia" },
    { id: "end-of-life", title: "End of life", path: "end-of-life" },
    { id: "environment-fire", title: "Environment and fire", path: "environment-fire" },
    { id: "financial", title: "Financial", path: "financial" },
    { id: "medication", title: "Medication", path: "medication" },
    { id: "mental-capacity", title: "Mental capacity", path: "mental-capacity" },
    { id: "moving-handling", title: "Moving and handling", path: "moving-handling" },
    { id: "restrictive-practice", title: "Restrictive practice", path: "restrictive-practice" },
    { id: "seizures", title: "Seizures", path: "seizures" },
    { id: "waterlow", title: "Waterlow", path: "waterlow" },
];

export const auditingDocuments = [
    { id: "client-feedback", title: "Client feedback", path: "client-feedback" },
    { id: "courtesy-call", title: "Counter sign", path: "courtesy-call" },
    { id: "service-review", title: "Service review", path: "service-review" },
];

export const documents = [
    { id: "upload-documents", title: "Upload documents", path: "upload-documents" },
    { id: "signature-document", title: "Signature document", path: "signature-document" },
    { id: "download-document", title: "Download document", path: "download-document" },
];

export const clientCarePlanDocuments = (handleDownload, toggleReadAccess, setDeleteDialog) => {
    return [
        {
            name: "Document title",
            selector: (row) => row.fileName,
            sortable: true,
            width: "35%",
            cell: (row) => <div className="py-3 text-[13px] text-[#1a1a1a]">{row.fileName}</div>,
        },
        {
            name: "Date uploaded",
            selector: (row) => row.createdAt,
            sortable: true,
            width: "25%",
            cell: (row) => <div className="py-3 text-[13px] text-[#1a1a1a]">{new Date(row.createdAt).toLocaleDateString("en-GB")}</div>,
        },
        {
            name: "Display to carers",
            selector: (row) => row.readAccessToCareGivers,
            width: "20%",
            cell: (row) => (
                <div className="flex items-center py-3">
                    <button
                        onClick={() => toggleReadAccess(row.id, !row.readAccessToCareGivers)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors duration-300 ${
                            row.readAccessToCareGivers ? "bg-customTealBg border-customDropdownBorder" : "bg-customDarkGreyBg border-gray-300"
                        }`}
                    >
                        {/* Icons Layer */}
                        <div className="absolute inset-0 flex items-center justify-between px-[5px] text-white">
                            <Check
                                size={13}
                                className={`transition-opacity ${row.readAccessToCareGivers ? "opacity-100" : "opacity-0"}`}
                            />
                            <X
                                size={13}
                                className={`transition-opacity ${!row.readAccessToCareGivers ? "opacity-100" : "opacity-0"}`}
                            />
                        </div>

                        {/* Toggle Knob */}
                        <span
                            className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-md transition duration-300 ease-in-out ${
                                row.readAccessToCareGivers ? "translate-x-[22px]" : "translate-x-[2px]"
                            }`}
                        />
                    </button>
                </div>
            ),
        },
        {
            name: "",
            width: "20%",
            cell: (row) => (
                <div className="flex items-center justify-end gap-3 py-3">
                    <button
                        onClick={() => handleDownload(row)}
                        className="rounded border border-customNavy px-3 py-2 text-[13px] font-medium text-customNavy hover:bg-gray-50"
                    >
                        Download
                    </button>
                    <button
                        onClick={() => setDeleteDialog({ isOpen: true, docId: row.id })}
                        className="text-[#6b7280] hover:text-red-500"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            ),
            right: true,
        },
    ];
};

export const signatureRoleOptions = [
    { value: "Client", label: "Client" },
    { value: "Lasting power of attorney", label: "Lasting power of attorney" },
    { value: "Family member", label: "Family member" },
    { value: "Advocate", label: "Advocate" },
    { value: "Social worker", label: "Social worker" },
    { value: "Other", label: "Other" },
];