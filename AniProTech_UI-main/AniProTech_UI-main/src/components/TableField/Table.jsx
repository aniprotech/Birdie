import React, { useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { isNotEmpty } from "../../../utils/common";
import { APPCONFIG } from "../../Config/AppConfig";
import { _post } from "../../../utils/ApiService";
import { useGlobalState } from "../../pages/shopTIres/GlobalStateContext";

// Helper function to access nested object properties
const getNestedValue = (obj, path) => {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
};

const Table = ({
  columns,
  data = [], // Default data to an empty array
  onView,
  onEdit,
  onDelete,
  actions = ["view", "edit", "delete"],
  view,
  symbol,
  page = "",
  role = "",
  onStatusChange,
}) => {
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggleDropdown = (id) => {
    setSelectedRowId((prev) => (prev === id ? null : id));
  };
  const toggleStatusDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };
  const handleViewClick = (id) => {
    // setSelectedRowId((prev) => (prev === id ? null : id));
    console.log("id", id);
  };

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setLoading(false); // Set loading to false after 2 seconds
    }, 2000);

    return () => clearTimeout(loadingTimeout); // Cleanup the timeout on component unmount
  }, []);

  useEffect(() => {
    // Check if data is not empty to set loading to false immediately
    if (isNotEmpty(data)) {
      setLoading(false);
    }
  }, [data]);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const dropdownEnquiryRef = useRef(null);
  const [approvalDropdownOpen, setApprovalDropdownOpen] = useState(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setApprovalDropdownOpen(null);
      setSelectedRowId(null); // Clear dropdown when clicking outside
    }
    if (
      dropdownEnquiryRef.current &&
      !dropdownEnquiryRef.current.contains(event.target)
    ) {
      setDropdownOpen(null);
    }
    if (
      dropdownEnquiryRef.current &&
      !dropdownEnquiryRef.current.contains(event.target)
    ) {
      setApprovalDropdownOpen(null);
    }
  };

  const dropdownRef = useRef(null); // Ref for the dropdown container

  useEffect(() => {
    if (selectedRowId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedRowId]);

  useEffect(() => {
    if (dropdownOpen !== null || approvalDropdownOpen !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen, approvalDropdownOpen]);

  const [enquiryStatus, setEnquiryStatus] = useState(
    APPCONFIG.EnquiryStatusOptions
  );

  const toggleApprovalDropdown = (id) => {
    setApprovalDropdownOpen(approvalDropdownOpen === id ? null : id);
  };

  const handleApprovalChange = async (item, status) => {
    try {
      const response = await _post("/api/approve", {
        id: item.id,
        status: status === "Approval" ? 1 : 0,
      });
      if (!response?.data?.error) {
      } else {
        console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  
  const { userInfoData } = useGlobalState();

  return (
    // <div className="py-4 overflow-x-auto">
    <div className="py-4 h-auto hide-scroller overflow-x-auto ">
      {/* <div className="inline-block min-w-full overflow-hidden"> */}
      <div className="inline-block min-w-full">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-bold text-gray-600 tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              {view && (
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-bold text-gray-600 tracking-wider">
                  Pricing
                </th>
              )}
              {actions.length > 0 && (
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-bold text-gray-600 tracking-wider">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? ( // Check if loading
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : data?.length > 0 ? (
              data.map((item, index) => (
                <tr
                  key={item.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-customGrey2"}
                >
                  {columns.map((column) => (
                    <td
                      key={`${item.id}-${column.key}`}
                      className="px-5 py-3 border-b border-gray-200 text-sm"
                    >
                      {page === "enquiry" && column.key === "status" ? (
                        <div className="">
                          <button
                            onClick={() => toggleStatusDropdown(item.id)}
                            className="flex relative items-center text-sm"
                          >
                            <span
                              className="mr-2 text-xs font-semibold whitespace-no-wrap"
                              style={{
                                color:
                                  item.status === "New"
                                    ? "#24BC94"
                                    : item.status === "Under Review"
                                    ? "#F39237"
                                    : item.status === "Completed"
                                    ? "#D44C59"
                                    : item.status === "Rejected"
                                    ? "#60A3F9"
                                    : "red",
                              }}
                            >
                              {item.status}
                            </span>
                            <FaChevronDown
                              className="text-[#808080]"
                              size={10}
                            />
                          </button>
                          {dropdownOpen === item.id && (
                            <ul
                              ref={dropdownEnquiryRef}
                              className="absolute w-32 lg:right-52 right-28 mt-3 bg-white shadow-lg rounded-md z-10"
                            >
                              {enquiryStatus.map((option) => (
                                <li
                                  key={option.status}
                                  className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                                  onClick={() => {
                                    onStatusChange(item, option.status);
                                    toggleStatusDropdown(item.id);
                                  }}
                                  style={{
                                    color:
                                      option.status === "New"
                                        ? "#24BC94"
                                        : option.status === "Under Review"
                                        ? "#F39237"
                                        : option.status === "Completed"
                                        ? "#D44C59"
                                        : option.status === "Rejected"
                                        ? "#60A3F9"
                                        : "red",
                                  }}
                                >
                                  <span className="text-xs font-semibold whitespace-no-wrap">
                                    {option.status}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : column.label === "Approve Status" ? (
                        <div className="relative">
                          <button
                            onClick={() => {
                              if (userInfoData?.role === "franchise_admin") {
                                return;
                              } else {
                                toggleApprovalDropdown(item.id);
                              }
                            }}
                            className={`flex relative items-center text-sm ${
                              userInfoData?.role === "franchise_admin"
                                ? "cursor-text"
                                : "cursor-pointer"
                            }`}
                          >
                            <span
                              className="mr-2 text-xs font-semibold whitespace-no-wrap"
                              style={{
                                color:
                                  item.approvalStatus === "Approved"
                                    ? "#24BC94"
                                    : "#D44C59",
                              }}
                            >
                              {item.approvalStatus || "Pending"}
                            </span>
                            {userInfoData?.role !== "franchise_admin" ? (
                              <FaChevronDown
                                className="text-[#808080]"
                                size={10}
                              />
                            ) : (
                              ""
                            )}
                          </button>

                          {approvalDropdownOpen === item.id && (
                            <ul
                              ref={dropdownEnquiryRef}
                              className={`absolute  ${
                                index >= data.length - 1
                                  ? "bottom-full"
                                  : "top-full"
                              } w-fit bg-white shadow-lg rounded-md z-10 border border-gray-200`}
                              // className="absolute left-0 mt-1 min-w-max bg-white shadow-lg rounded-md z-40"
                            >
                              {["Approved", "Rejected"].map((status) => (
                                <li
                                  key={status}
                                  className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                                  onClick={() => {
                                    // handleApprovalChange(item, status);
                                    toggleApprovalDropdown(item.id);
                                  }}
                                  style={{
                                    color:
                                      status === "Approved"
                                        ? "#24BC94"
                                        : "#D44C59",
                                  }}
                                >
                                  <span className="text-xs font-semibold whitespace-no-wrap">
                                    {status}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <span className="text-customBlack text-xs opacity-85 font-semibold whitespace-no-wrap">
                          {column.key === "parent.franchiseCode"
                            ? getNestedValue(item, column.key) || "-"
                            : column.render
                            ? column.render(getNestedValue(item, column.key))
                            : getNestedValue(item, column.key)}
                        </span>
                      )}
                    </td>
                  ))}
                  {view && (
                    <td className="px-5 py-3 border-b border-gray-200 text-sm">
                      <button
                        onClick={() => onView(item)}
                        className="text-customBlue1 relative text-xs flex items-center"
                      >
                        {view}
                      </button>
                    </td>
                  )}
                  {actions.length > 0 && (
                    <td className="px-5 py-3 border-b border-gray-200 text-sm relative">
                      <button
                        onClick={() => toggleDropdown(item.id)}
                        className="text-customBlue1 relative text-xs flex items-center"
                      >
                        Action
                        <FaChevronDown className="text-[#39A9DB] ml-2" />
                      </button>

                      {selectedRowId === item.id && (
                        <ul
                          ref={dropdownRef}
                          className={`absolute left-2 ${
                            index >= data.length - 1
                              ? "bottom-full -mb-4"
                              : "top-full -mt-2"
                          } w-fit bg-white shadow-lg rounded-md z-10 border border-gray-200`}
                        >
                          {actions.includes("view") && (
                            <li
                              onClick={() => onView(item)}
                              className="px-4 py-2 text-xs text-customGreen hover:bg-customGrey1 cursor-pointer"
                            >
                              View
                            </li>
                          )}
                          {actions.includes("edit") &&
                            item.role !== "Super Admin" &&
                            (page !== "Blog" ||
                              item.Companies?.length < 2 ||
                              role === "Super Admin") && (
                              <li
                                onClick={() => onEdit(item)}
                                className="px-4 py-2 text-xs text-customBlue hover:bg-customGrey1 cursor-pointer"
                              >
                                Edit
                              </li>
                            )}
                          {actions.includes("delete") &&
                            item.role !== "Super Admin" &&
                            (page !== "Blog" ||
                              item.Companies?.length < 2 ||
                              role === "Super Admin") && (
                              <li
                                onClick={() => onDelete(item)}
                                className="px-4 py-2 text-xs text-customRed hover:bg-customGrey1 cursor-pointer"
                              >
                                Delete
                              </li>
                            )}
                        </ul>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-4">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
