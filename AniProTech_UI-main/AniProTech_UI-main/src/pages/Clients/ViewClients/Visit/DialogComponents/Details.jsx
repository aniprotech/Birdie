import { MessageCircleQuestion, SquarePen, Users } from "lucide-react";
import PropTypes from "prop-types";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { useNavigationHelpers } from "../../../../../hooks/useNavigationHelpers";

const Details = ({ visit }) => {
    const { id, navigate } = useNavigationHelpers();
    return (
        <div className="p-5">
            {/* Schedule Section */}
            <div className="mb-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-medium text-customBlack1">Schedule</h2>
                    <p
                        onClick={() => navigate(`/admin/clients/${id}/visits/schedule-edit/${visit.id}`)}
                        className="poppins-medium flex cursor-pointer items-center gap-1 text-sm text-customTextLightNavy"
                    >
                        <SquarePen size={16} />
                        Edit
                    </p>
                </div>
                <div className="space-y-6">
                    <div>
                        <div className="poppins-medium mb-1 text-sm text-customBlack2">Time</div>
                        <div className="text-sm text-customBlack">{visit?.planned}</div>
                    </div>
                    <div>
                        <div className="mb-1 text-sm text-customBlack2">Status</div>
                        <div className="poppins-semibold inline-flex rounded-full bg-customEventNotStartedCardBg px-2.5 py-0.5 text-sm text-customEventCardBorder">
                            {visit.status}
                        </div>
                    </div>
                    <div>
                        <div className="mb-1 text-sm text-customBlack2">Repeats</div>
                        <div className="text-sm text-customBlack">Daily</div>
                    </div>
                    <div>
                        <div className="mb-1 text-sm text-customBlack2">Ends on</div>
                        <div className="text-sm text-customBlack">Never</div>
                    </div>
                    <div>
                        <div className="mb-1 text-sm text-customBlack2">Number of required carers</div>
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-customBgDarkGrey px-2 py-1 text-sm text-white">
                            <span className="text-white">
                                <Users size={16} />
                            </span>
                            <span>1</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Client Location Section */}
            {visit.location && (
                <div className="mb-6">
                    <h2 className="mb-2 text-lg font-medium text-customBlack">Client location</h2>
                    <div className="text-sm text-customBlack1">
                        {visit.location.street}, {visit.location.city}, {visit.location.region} {visit.location.postcode}, {visit.location.country}
                    </div>
                </div>
            )}

            {/* Manual Check In Section */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-customTextLightNavy">Manual check in</span>

                    {/* Tooltip trigger */}
                    <button
                        data-tooltip-id="manualCheckTooltip"
                        data-tooltip-content="Amending visit times is disabled for visits with no assigned care professionals"
                        className="text-gray-400 hover:text-customBlack2"
                    >
                        <MessageCircleQuestion
                            className="mb-0.5 text-customBlack2"
                            size={16}
                        />
                    </button>

                    {/* Tooltip element */}
                    <Tooltip
                        id="manualCheckTooltip"
                        place="left"
                        className="poppins-semibold !w-80 !rounded-md !bg-gray-800 !px-3 !py-2 !text-xs !text-white"
                        style={{ zIndex: 9999 }}
                    />
                </div>
            </div>
        </div>
    );
};

Details.propTypes = {
    visit: PropTypes.shape({
        planned: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        location: PropTypes.shape({
            street: PropTypes.string.isRequired,
            city: PropTypes.string.isRequired,
            region: PropTypes.string.isRequired,
            postcode: PropTypes.string.isRequired,
            country: PropTypes.string.isRequired,
        }),
    }).isRequired,
};

export default Details;
