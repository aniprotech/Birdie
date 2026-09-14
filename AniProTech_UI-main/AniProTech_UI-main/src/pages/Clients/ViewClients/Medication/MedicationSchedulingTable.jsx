import { useState } from "react";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import SchedulingViewDialog from "./SchedulingViewDialog";
import PropTypes from "prop-types";
import { getFrequencyDisplay } from "../../../../utils/dateAndTimeUtil";
import { formatDisplayName } from "../../../../utils/common";

const MedicationSchedulingTable = ({ data }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  const handleView = (item) => setSelectedItem(item);

  const renderStatusDot = (isStopped) => (
    <span
      className={`inline-block w-2 h-2 rounded-full ${
        isStopped ? "bg-red-400" : "bg-green-500"
      }`}
    />
  );

  return (
    <div className="w-full overflow-x-auto">
      <div className="bg-white border border-gray-200 rounded-lg min-w-[1300px]">
        <table className="w-full table-auto text-sm">
          <thead className="bg-gray-50 text-customGrey1 poppins-medium text-sm">
            <tr className="border-b border-gray-200 text-left">
              <td className="px-4 py-3 min-w-[160px] whitespace-nowrap">{/* View + dot */}</td>
              <td className="px-4 py-3 min-w-[280px] whitespace-nowrap">Name</td>
              <td className="px-4 py-3 min-w-[120px] whitespace-nowrap">Route</td>
              <td className="px-4 py-3 min-w-[100px] whitespace-nowrap">Dose</td>
              <td className="px-4 py-3 min-w-[120px] whitespace-nowrap">Frequency</td>
              <td className="px-4 py-3 min-w-[140px] whitespace-nowrap">Support Type</td>
              <td className="px-4 py-3 min-w-[120px] whitespace-nowrap">Type</td>
              <td className="px-4 py-3 min-w-[140px] whitespace-nowrap">Start Date</td>
              <td className="px-4 py-3 min-w-[140px] whitespace-nowrap">End Date</td>
              <td className="px-4 py-3 min-w-[140px] whitespace-nowrap">Created</td>
              <td className="px-4 py-3 min-w-[140px] whitespace-nowrap">Created By</td>
              <td className="px-4 py-3 min-w-[160px] whitespace-nowrap">Last Updated By</td>
              <td className="px-4 py-3 w-6 whitespace-nowrap">{/* Chevron */}</td>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100 text-customBlack">
            {data?.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleView(item)}
                      className="px-3 py-1 text-sm border border-customNavy rounded text-customNavy hover:bg-blue-50 transition"
                    >
                      View
                    </button>
                    {renderStatusDot(item.isStopped)}
                  </div>
                </td>
                <td className="px-4 py-4 poppins-medium whitespace-nowrap">
                  {item.medicationDescription}
                </td>
                <td className="px-4 py-4 capitalize whitespace-nowrap">
                  {formatDisplayName(item?.routeType) || "—"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {item.dose || "—"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {getFrequencyDisplay(item)}
                </td>
                <td className="px-4 py-4 capitalize whitespace-nowrap">
                  {item.support?.toLowerCase() || "—"}
                </td>
                <td className="px-4 py-4 capitalize whitespace-nowrap">
                  {item.type || "—"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {item.firstDoseDate
                    ? format(new Date(item.firstDoseDate), "dd MMM yyyy")
                    : item.prnStartDate
                    ? format(new Date(item.prnStartDate), "dd MMM yyyy")
                    : "—"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {item.lastDoseDate
                    ? format(new Date(item.lastDoseDate), "dd MMM yyyy")
                    : item.prnEndDate
                    ? format(new Date(item.prnEndDate), "dd MMM yyyy")
                    : "—"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {item.createdAt
                    ? format(new Date(item.createdAt), "dd MMM yyyy")
                    : "—"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">{item.clientFirstName ? item.clientFirstName + " " + item.clientLastName : "—"}</td>
                <td className="px-4 py-4 whitespace-nowrap">{item.clientFirstName ? item.clientFirstName + " " + item.clientLastName : "—"}</td>
                <td className="px-4 py-4">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedItem && (
          <SchedulingViewDialog
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
          />
        )}
      </div>
    </div>
  );
};

MedicationSchedulingTable.propTypes = {
  data: PropTypes.array.isRequired,
};

export default MedicationSchedulingTable;
