import PropTypes from "prop-types";
import { useState } from "react";
import Timeline from "./DialogComponents/Timeline";
import { renderContent } from "../../../../data/clients/clientVisitConstantData";

const TABS = ["Details", "Care team", "Activities", "Observations", "Alerts", "Timeline"];
const NO_MEDICATION_TABS = ["Details", "Care team", "Activities", "Timeline"];

const VisitDialog = ({ visit, onClose, clientName, medication = false }) => {
    const [activeTab, setActiveTab] = useState("Details");
    const [showTimeline, setShowTimeline] = useState(false);

    console.log("showTimeline",showTimeline)
    if (!visit) return null;
    const clientNameTitle = clientName ? clientName : "The Client";

    return (
        <>
            <div className="fixed inset-0 z-50 flex justify-end bg-black/5">
                <div className="flex w-full max-w-lg flex-col bg-white shadow-2xl">
                    {/* Header */}
                    <div className="px-5 py-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-base font-medium text-gray-600">
                                    {`${clientNameTitle?.firstName?.substring(0, 1).toUpperCase() || ""}${clientNameTitle?.lastName?.substring(0, 1).toUpperCase() || "NA"}`}
                                </div>
                                <div className="flex flex-col">
                                    <span className="poppins-medium text-base text-customBlack underline">
                                        {clientNameTitle?.firstName} {clientNameTitle?.lastName}
                                    </span>
                                    <span className="mt-0.5 text-sm text-customBlack2">
                                        {visit.planned} - {visit.date}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-2xl leading-none text-customBlack2 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>
                        {/* <div className="mt-3">
                            <span
                                className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                                    visit.status === "Completed" ? "bg-green-50 text-green-700" : "bg-indigo-50 text-indigo-700"
                                }`}
                            >
                                {visit.status}
                            </span>
                        </div> */}
                    </div>

                    {/* Tabs */}
                    <div className="flex overflow-x-auto border-b border-gray-200 px-5 scrollbar-hide">
                        {medication
                            ? TABS.map((tab) => (
                                  <button
                                      key={tab}
                                      onClick={() => setActiveTab(tab)}
                                      className={`relative mr-4 whitespace-nowrap px-1 py-2 text-sm last:mr-0 ${
                                          activeTab === tab
                                              ? "poppins-semibold text-customTextLightNavy after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-customTextLightNavy"
                                              : "poppins-medium text-customTextLightNavy hover:text-customTextLightNavy/80"
                                      }`}
                                  >
                                      {tab}
                                  </button>
                              ))
                            : NO_MEDICATION_TABS.map((tab) => (
                                  <button
                                      key={tab}
                                      onClick={() => setActiveTab(tab)}
                                      className={`relative mr-4 whitespace-nowrap px-1 py-2 text-sm last:mr-0 ${
                                          activeTab === tab
                                              ? "poppins-semibold text-customTextLightNavy after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-customTextLightNavy"
                                              : "poppins-medium text-customTextLightNavy hover:text-customTextLightNavy/80"
                                      }`}
                                  >
                                      {tab}
                                  </button>
                              ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">{renderContent(activeTab, visit, setShowTimeline, clientNameTitle)}</div>
                </div>
            </div>


            {/* Timeline Modal */}
            {/* {showTimeline && (
                <Timeline
                    events={visit?.timeline || []}
                    onClose={() => {
                        setShowTimeline(false);
                        setActiveTab("Details");
                    }}
                />
            )} */}
        </>
    );
};

VisitDialog.propTypes = {
    visit: PropTypes.shape({
        clientName: PropTypes.string.isRequired,
        timeRange: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        planned: PropTypes.string,
        actuals: PropTypes.string,
        totalDuration: PropTypes.number,
        location: PropTypes.shape({
            street: PropTypes.string,
            city: PropTypes.string,
            region: PropTypes.string,
            postcode: PropTypes.string,
            country: PropTypes.string,
        }),
        alerts: PropTypes.array,
        careTeam: PropTypes.arrayOf(PropTypes.string),
        activities: PropTypes.array,
        observations: PropTypes.array,
        timeline: PropTypes.array,
        checkIn: PropTypes.shape({
            time: PropTypes.string,
            provider: PropTypes.string,
            status: PropTypes.string,
        }),
        checkOut: PropTypes.shape({
            time: PropTypes.string,
            provider: PropTypes.string,
            status: PropTypes.string,
        }),
    }),
    onClose: PropTypes.func.isRequired,
    clientName: PropTypes.shape({
        firstName: PropTypes.string,
        lastName: PropTypes.string,
    }),
};

export default VisitDialog;
