import PropTypes from "prop-types";
import { format } from "date-fns";
import { Check } from "lucide-react";
import { assessmentIcons } from "../../../../../constants/clientCarePlan";

const AssessmentCard = ({ id, title, lastUpdated, onClick }) => {
    const Icon = assessmentIcons[id];

    return (
        <div
            onClick={onClick}
            className="relative flex cursor-pointer flex-col rounded-md border border-customNavy/40 bg-white p-4 shadow transition-all hover:bg-customCarerFeedBg/50"
        >
            <div className="flex items-start gap-3">
                {Icon && (
                    <div className="bg-customFeedCardBg1 rounded-lg p-2">
                        <Icon className="h-5 w-5 text-[#1E817C]" />
                    </div>
                )}
                <div className="flex-1">
                    <h3 className="poppins-medium mb-2 text-sm text-customBlack">{title}</h3>
                    <div className="flex items-center gap-1 text-xs">
                        <Check className="h-3.5 w-3.5 text-[#1E817C]" />
                        <span className="text-[#1E817C]">
                            {lastUpdated ? `Updated ${format(new Date(lastUpdated), "dd MMM yyyy")}` : "Not yet accessed"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

AssessmentCard.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    lastUpdated: PropTypes.string,
    onClick: PropTypes.func.isRequired,
};

export default AssessmentCard;
