import { useState } from "react";
import { useNavigationHelpers } from "../../../../hooks/useNavigationHelpers";
import useScrollToTop from "../../../../hooks/useScrollToTop";
import DropdownField from "../../../../components/DropdownInput/Dropdown";
import { medicationChartListOptions } from "../../../../constants/clientConstants";
import { generateMonthOptions } from "../../../../utils/dateAndTimeUtil";
import MedicationMonitoringChart from "./MedicationMonitoringChart";
import MedicationMonitoringTable from "./MedicationMonitoringTable";
import PropTypes from "prop-types";


const MedicationMonitoringHeader = ({ data, setData, fetchSchedulingData, selectedMonth, setSelectedMonth }) => {
    const [viewType, setViewType] = useState("CHART");

    const { id, navigate, clientFirstName } = useNavigationHelpers();

    useScrollToTop();

    return (
        <div className="w-full bg-white">
            <div className="mx-auto w-full max-w-7xl ">
                <div className="flex flex-col px-4 sm:px-6 lg:px-8 py-4 md:flex-row md:items-center md:justify-between md:border-gray-300">
                    <h1 className="poppins-medium mb-4 pb-3 text-xl text-customBlack md:mb-0 md:pb-0">{clientFirstName}&apos;s MAR Chart</h1>

                    <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                        <div className="w-full sm:w-auto">
                            <DropdownField
                                label=""
                                name="selectedMonth"
                                value={selectedMonth}
                                valueChange={(e) => setSelectedMonth(e.target.value)}
                                options={generateMonthOptions()}
                                componentName="FormikValidation"
                                style="height"
                                pipe={false}
                            />
                        </div>

                        <div className="w-full sm:w-auto">
                            <DropdownField
                                label=""
                                name="viewType"
                                value={viewType}
                                valueChange={(e) => setViewType(e.target.value)}
                                options={medicationChartListOptions}
                                componentName="FormikValidation"
                                style="height"
                            />
                        </div>
                    </div>
                </div>

                {data?.medicationSchedules?.length === 0 ? (
                <div className="mt-20 flex min-h-[55vh] flex-col items-center justify-center text-center">
                    <p className="text-lg font-medium text-customBlack">No medication was taken during this time period</p>
                    <p className="mt-2 text-sm text-gray-500">
                        Please select a different date range above or{" "}
                        <button
                            type="button"
                            onClick={() => navigate(`/admin/clients/${id}/medication`)}
                            className="text-customTextLightNavy underline hover:text-customTextLightNavy/80"
                        >
                            add a medication
                        </button>
                        .
                    </p>
                </div>
                ) : (
                    <div className="mt-10">

                {viewType === "CHART" ? (
                    <MedicationMonitoringChart data={data} setData={setData} fetchSchedulingData={fetchSchedulingData} selectedMonth={selectedMonth} />
                ) : (
                    <MedicationMonitoringTable data={data} fetchSchedulingData={fetchSchedulingData}/>
                )}
                    </div>
                )}      

            </div>
        </div>
    );
};

MedicationMonitoringHeader.propTypes = {
    data: PropTypes.object.isRequired,
    selectedMonth: PropTypes.string.isRequired,
    setSelectedMonth: PropTypes.func.isRequired,
};

export default MedicationMonitoringHeader;
