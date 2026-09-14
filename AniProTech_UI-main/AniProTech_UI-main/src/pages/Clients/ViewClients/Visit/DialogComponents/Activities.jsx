import PropTypes from "prop-types";
import { FileCheck2 } from "lucide-react";

const Activities = ({ visit }) => {
    if (!visit?.activities?.length) {
        return (
            <div className="p-5">
                <div className="flex h-[40vh] items-center justify-center gap-3 rounded-lg ">
                    <div className="flex flex-col items-center justify-center gap-3">
                        <FileCheck2
                            className=""
                            size={20}
                        />
                        <p className="text-center text-sm">
                            <span className="text-customBlack">No tasks or medication have been assigned to this visit.</span>
                            <br />
                            <span className="text-customBlack2 text-center">Please assign them before the visit starts.</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // If activities are assigned, show the activities list
    return (
        <div className="p-5">
            <div className="mb-6">
                <h2 className="mb-4 text-lg font-medium text-customBlack1">Activities</h2>
                <div className="space-y-3">
                    {visit.activities.map((activity, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-3 rounded-lg bg-gray-50 p-3"
                        >
                            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-sm text-green-600">
                                ✓
                            </div>
                            <div>
                                <div className="mb-1 text-sm font-medium text-customBlack1">{activity.name}</div>
                                {activity.notes && <div className="text-customBlack2 text-sm">{activity.notes}</div>}
                                {activity.time && <div className="text-customBlack2 mt-1 text-xs">{activity.time}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

Activities.propTypes = {
    visit: PropTypes.shape({
        activities: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string.isRequired,
                notes: PropTypes.string,
                time: PropTypes.string,
            }),
        ),
    }),
};

export default Activities;
