import { useNavigationHelpers } from "../../../../hooks/useNavigationHelpers";
import PropTypes from "prop-types";

const SchedulingHeader = ({ dataLength, totalLength, filters, setFilters }) => {
    const { clientFirstName } = useNavigationHelpers();
  
    const handleCheckboxChange = (type) => {
      setFilters((prev) => ({
        ...prev,
        [type]: !prev[type],
      }));
    };
  
    return (
      <div className="mb-4 flex flex-col border-b border-gray-300 pb-6 pt-3 md:flex-row md:items-center md:justify-between">
        <div className="mb-2 flex flex-wrap items-center gap-4 md:mb-0">
          <h2 className="poppins-medium text-lg text-customBlack">
            {clientFirstName ? clientFirstName : "Client"}&apos;s medications
          </h2>
          <p className="text-sm text-customGrey1">
            Showing {dataLength} of {totalLength}
          </p>
        </div>
  
        <div className="flex flex-wrap items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="poppins-medium text-sm">Show:</span>
  
            <label className="flex items-center space-x-1 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.active}
                onChange={() => handleCheckboxChange("active")}
                className="h-4 w-4 accent-customDropdownBorder cursor-pointer"
              />
              <span className="text-sm">Active</span>
            </label>
  
            <label className="flex items-center space-x-1 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.stopped}
                onChange={() => handleCheckboxChange("stopped")}
                className="h-4 w-4 accent-customDropdownBorder cursor-pointer"
              />
              <span className="text-sm">Stopped</span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  SchedulingHeader.propTypes = {
    dataLength: PropTypes.number.isRequired,
    totalLength: PropTypes.number.isRequired,
    filters: PropTypes.object.isRequired,
    setFilters: PropTypes.func.isRequired,
  };

  export default SchedulingHeader;