import { format } from "date-fns";
import PropTypes from "prop-types";
import { Trash2, Pencil } from "lucide-react";
import { formatDisplayName } from "../../../../../utils/common";
import { useState } from "react";
import DeleteRiskConfirmModal from "./DeleteRisk";

const getRiskLevelStyle = (riskLevel) => {
    switch (riskLevel?.toUpperCase()) {
        case "HIGH":
        case "MEDIUM":
        case "LOW":
            return "bg-customOrangeBg text-customOrangeText font-medium";
        default:
            return "bg-gray-100 text-gray-700";
    }
};

const RiskCard = ({ risk, onEdit, onDelete }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const {
        risk: title,
        mitigation,
        relatedAssessments = [],
        createdAt,
        updatedAt,
        riskLevel,
    } = risk;

    const isEdited = updatedAt && updatedAt !== createdAt;
    const rawDate = isEdited ? updatedAt : createdAt;
const displayDate = rawDate && !isNaN(new Date(rawDate))
    ? format(new Date(rawDate), "dd MMM yyyy, HH:mm")
    : "Invalid date";


    return (
        <>
            <div className="shadow-subtle relative mt-8 hover:cursor-pointer rounded border border-customNavy/40 hover:bg-customCarerFeedBg/40 ">
                {/* Action Icons */}
                <div className="absolute right-3 top-3 flex gap-3">
                    <button type="button" onClick={() => setShowDeleteConfirm(true)}>
                        <Trash2 className="h-4 w-4 text-customNavy hover:text-red-600" />
                    </button>
                    <button type="button" onClick={onEdit}>
                        <Pencil className="h-4 w-4 text-customNavy hover:text-blue-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 pb-0 text-sm space-y-2">
                    <h3 className="font-semibold text-customBlack">{title}</h3>
                    <p className="text-customBlack2">{mitigation}</p>

                    <div className="mt-2 flex flex-wrap gap-2">
                        {relatedAssessments.map((label) => (
                            <span
                                key={label}
                                className="rounded bg-gray-200 px-2 py-1 text-customBlack text-sm"
                            >
                                {formatDisplayName(label)}
                            </span>
                        ))}
                    </div>

                    <p className="mt-2 text-customBlack2">
                        {isEdited ? "Edited on" : "Submitted on"} {displayDate}
                    </p>
                </div>

                {/* Risk Level */}
                <div className={`rounded-b-md px-4 py-2 mt-4 poppins-semibold text-sm ${getRiskLevelStyle(riskLevel)}`}>
                    {riskLevel?.charAt(0).toUpperCase() + riskLevel?.slice(1).toLowerCase()}
                </div>
            </div>

            <DeleteRiskConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={() => {
                    onDelete();
                    setShowDeleteConfirm(false);
                }}
            />
        </>
    );
};

RiskCard.propTypes = {
    risk: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default RiskCard;
