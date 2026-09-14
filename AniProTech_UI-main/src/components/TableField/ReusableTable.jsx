import {
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
} from "react-icons/fa";
import TableLoader from "../Loader/TableLoader";
import PropTypes from "prop-types";
import { useState } from "react";

const ReusableTable = ({
  data = [],
  columns = [],
  loading = false,
  page = 1,
  setPage = () => {},
  pageSize = 10,
  totalCount = 0,
  onAdd = null,
  onDownloadSummary = null,
}) => {
  const [notePopup, setNotePopup] = useState(null);
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // Calculate paginated data
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);

  const downloadSummary = () => {
    if (onDownloadSummary) {
      onDownloadSummary();
    }
  };

  return (
    <>
      {notePopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white max-w-md w-full rounded-xl shadow-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-customBlack mb-4">Note</h2>
            <p className="text-sm text-customBlack2 mb-6 whitespace-pre-line">
              {notePopup}
            </p>
            <button
              onClick={() => setNotePopup(null)}
              className="bg-[#FEE9E0] text-[#B93815] font-medium rounded-lg px-6 py-2"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4 rounded border border-customBorder bg-white p-4 shadow-sm font-[poppins-medium] print:shadow-none print:border-none print:p-0">
        {/* Top Actions */}
        <div className="flex flex-col gap-4 pb-4 pt-2 md:flex-row md:items-center md:justify-between">
          <div className=" md:flex-row flex-col ">
        {!loading && (
          <div className="flex items-center  pt-2 md:text-sm text-xs text-customBlack2 print:hidden font-poppins">
         
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="rounded bg-gray-100 p-2 disabled:opacity-50"
              >
                <FaChevronLeft size={14} />
              </button>
                <span>{page} / {totalPages}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="rounded bg-gray-100 p-2 disabled:opacity-50"
              >
                <FaChevronRight size={14} />
              </button>
            </div>
            <span className="text-sm text-customBlack2 font-poppins ml-5">
              Showing {paginatedData?.length} out of {totalCount}
            </span>

          </div>
        )}
          </div>

          <div className="flex gap-2 md:text-sm text-xs font-poppins">
            <button
              onClick={downloadSummary}
              className="flex items-center gap-2 px-3 py-1.5 text-customNavy border border-customNavy poppins-medium"
            >
              <FaDownload /> Download Summary
            </button>
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-3 py-1.5 text-customNavy border border-customNavy poppins-medium"
            >
              Add New
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto print:overflow-visible">
          {loading ? (
            <TableLoader />
          ) : (
            <table className="min-w-full divide-y divide-gray-200 font-poppins text-sm text-left text-customBlack print:text-xs print:min-w-full print:table-fixed">
              <thead className="bg-gray-100 print:bg-white">
                <tr>
                  {columns.map((col, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-2 font-medium text-customBlack2"
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="align-top">
                    {columns.map((col, colIndex) => {
                      const value = row[col.accessor];
                      
                      const cell = col.render ? col.render(value, row) : value;
                      
                      return (
                        <td key={colIndex} className="px-4 py-4 ">
                          {cell}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </>
  );
};

ReusableTable.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array,
  loading: PropTypes.bool,
  page: PropTypes.number,
  setPage: PropTypes.func,
  pageSize: PropTypes.number,
  totalCount: PropTypes.number,
  onAdd: PropTypes.func,
  onDownloadSummary: PropTypes.func,
};

export default ReusableTable;
