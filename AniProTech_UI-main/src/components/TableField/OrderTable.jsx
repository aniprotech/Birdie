import React, { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaEdit, FaTimes } from "react-icons/fa";
import {
  formatDate,
  getOrderStatus,
  getScheduleText,
  isEmpty,
  isNotEmpty,
} from "../../../utils/common";
import { Link, useNavigate } from "react-router-dom";
import { APPCONFIG } from "../../Config/AppConfig";
import { useGlobalState } from "../../pages/shopTIres/GlobalStateContext";
import OrderPopUp from "./OrderPopUp";

// Helper function to access nested object properties4
// const getNestedValue = (obj, path) => {
//   return path.split(".").reduce((acc, part) => acc && acc[part], obj);
// };
const getNestedValue = (item, key) => {
  if (key === "productDetails") {
    // Combine product names into a single string
    return (
      item.OrderItemProducts?.map(
        (p) =>
          (isNotEmpty(p.model) ? p.model : "") +
          " - " +
          (isNotEmpty(p.tireSize) ? p.tireSize : "")
      ).join(", ") || ""
    );
  }
  if (key === "deliveryOption") {
    return item.deliveryOption === "DELIVERY_INSTALLATION"
      ? "Delivery Installation"
      : item.deliveryOption === "DELIVERY"
      ? "Delivery"
      : item.deliveryOption === "INSTALLATION"
      ? "Installation"
      : "-";
  }
  if (key === "OrderSchedule") {
    return (item.deliveryOption === "DELIVERY_INSTALLATION" ||
      item.deliveryOption === "INSTALLATION") &&
      item.OrderSchedule
      ? item.OrderSchedule?.User
        ? item.OrderSchedule?.User?.firstName +
          " " +
          item.OrderSchedule?.User?.lastName
        : "Assign"
      : "-";
  }
  if (key === "OrderSchedule.status") {
    return getScheduleText(item?.OrderSchedule?.status);
  }

  return key.split(".").reduce((acc, cur) => acc?.[cur], item);
};

const OrderTable = ({
  columns,
  data = [],
  onView,
  onEdit,
  onDelete,
  actions = ["view", "edit", "delete"],
  view,
  symbol,
  employeeAssign,
  page,
  fetchOrderList,
}) => {
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // Track which item is in edit mode

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { userInfoData } = useGlobalState();

  const orderStatusOptions = [
    { orderStatus: "In Progress" },
    { orderStatus: "On the way" },
    { orderStatus: "Delivered" },
    { orderStatus: "Cancelled" },
  ];

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(loadingTimeout);
  }, []);

  useEffect(() => {
    if (isNotEmpty(data)) {
      setLoading(false);
    }
  }, [data]);

  const toggleDropdown = (orderId) => {
    setDropdownOpen(dropdownOpen === orderId ? null : orderId);
  };
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const updateStatus = (order, status) => {
    setSelectedOrder(order);
    setSelectedStatus(status);
    setShowOrderPopup(true);
    setDropdownOpen(null);
    // Logic to update the status in the backend can be added here
  };

  // const handleClickOutside = (event) => {
  //   if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //     setDropdownOpen(null);
  //     setIsEditing(!isEditing)
  //   }
  // };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
        setEditingItem(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle opening/closing dropdown and edit mode
  const handleIconClick = (itemId) => {
    setEditingItem(editingItem === itemId ? null : itemId); // Toggle edit mode for this item
    setDropdownOpen(dropdownOpen === itemId ? null : itemId); // Toggle dropdown for this item
  };

  return (
    <div className="py-4 overflow-auto text-customTextGrey1 font-semibold h-auto hide-scroller">
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
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : data?.length > 0 ? (
              data.map((item, index) => (
                <tr
                  key={item.id}
                  className={`${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } border-b`}
                >
                  {columns.map((column) => (
                    <td
                      key={`${item.id}-${column.key}`}
                      className="px-4 py-3 text-sm"
                    >
                      {column.key === "createdAt" ? (
                        <span className="text-xs font-semibold whitespace-no-wrap">
                          {formatDate(item[column.key])}
                        </span>
                      ) : column.key === "orderStatus" ? (
                        <div className="relative">
                          <button className="flex items-center text-sm">
                            <span
                              className={`mr-2 text-xs font-semibold ${
                                userInfoData?.role === "customer_support"
                                  ? "cursor-pointer"
                                  : "cursor-text"
                              } whitespace-no-wrap`}
                              style={{
                                color:
                                  item.orderStatus === "Delivered"
                                    ? "#24BC94"
                                    : item.orderStatus === "In Progress"
                                    ? "#F39237"
                                    : item.orderStatus === "Cancelled"
                                    ? "#D44C59"
                                    : item.orderStatus === "On the way"
                                    ? "#60A3F9"
                                    : "red",
                              }}
                            >
                              {getOrderStatus(item.orderStatus)}
                            </span>

                            {userInfoData?.role ===
                              "customer_support_executive" && (
                              <div
                                className="cursor-pointer text-[#808080]"
                                onClick={() => handleIconClick(item.id)}
                              >
                                {editingItem === item.id ? (
                                  <FaTimes
                                    size={14}
                                    className="text-customBlack opacity-75"
                                  />
                                ) : (
                                  <FaEdit
                                    size={14}
                                    className="text-customBlack opacity-55"
                                  />
                                )}
                              </div>
                            )}
                          </button>

                          {/* Dropdown menu */}
                          {dropdownOpen === item.id && (
                            <ul
                              ref={dropdownRef}
                              className={`absolute ${
                                index >= data.length - 2 ? "bottom-6" : "top-6"
                              } bg-white shadow-lg rounded-md z-50`}
                            >
                              {APPCONFIG.orderManagementStatus.map((option) => (
                                <li
                                  key={option.value}
                                  className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                                  onClick={() =>
                                    updateStatus(item, option.value)
                                  }
                                  style={{
                                    color:
                                      option.value === "DELIVERED"
                                        ? "#24BC94"
                                        : option.value === "REFUNDED"
                                        ? "#F39237"
                                        : option.value === "CANCELLED"
                                        ? "#D44C59"
                                        : "red",
                                  }}
                                >
                                  <span className="text-xs font-semibold whitespace-no-wrap">
                                    {option.label}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : column.key === "OrderSchedule" ? (
                        (item.deliveryOption === "DELIVERY_INSTALLATION" ||
                          item.deliveryOption === "INSTALLATION") &&
                        item.orderStatus === "ORDERED" ? (
                          item.OrderSchedule && item.OrderSchedule.User ? (
                            <>
                              <span className="flex gap-2 text-xs font-semibold whitespace-no-wrap">
                                {getNestedValue(item, column.key)}
                                <button
                                  onClick={() => employeeAssign(item)}
                                  className="text-customBlue1 text-xs font-semibold whitespace-no-wrap"
                                >
                                  <FaEdit size={18} />
                                  {/* <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 14 14"
                                  >
                                    <path
                                      id="Path_796"
                                      data-name="Path 796"
                                      d="M167-793a3.37,3.37,0,0,1-2.472-1.028A3.37,3.37,0,0,1,163.5-796.5a3.37,3.37,0,0,1,1.028-2.472A3.37,3.37,0,0,1,167-800a3.37,3.37,0,0,1,2.472,1.028A3.37,3.37,0,0,1,170.5-796.5a3.37,3.37,0,0,1-1.028,2.472A3.37,3.37,0,0,1,167-793Zm-7,5.25v-.7a2.564,2.564,0,0,1,.383-1.367,2.553,2.553,0,0,1,1.017-.951,12.992,12.992,0,0,1,2.756-1.017,12.044,12.044,0,0,1,2.844-.339,12.043,12.043,0,0,1,2.844.339,12.993,12.993,0,0,1,2.756,1.017,2.552,2.552,0,0,1,1.017.951A2.564,2.564,0,0,1,174-788.45v.7a1.685,1.685,0,0,1-.514,1.236,1.685,1.685,0,0,1-1.236.514h-10.5a1.685,1.685,0,0,1-1.236-.514A1.685,1.685,0,0,1,160-787.75Z"
                                      transform="translate(-160 800)"
                                      fill="#39a9db"
                                    />
                                  </svg> */}
                                </button>
                              </span>
                            </>
                          ) : (
                            ((item.OrderSchedule && !item.OrderSchedule.User) ||
                              !item.OrderSchedule) && (
                              <span className="text-xs font-semibold whitespace-no-wrap">
                                <button
                                  onClick={() => employeeAssign(item)}
                                  className="text-customBlue1 text-xs font-semibold whitespace-no-wrap"
                                >
                                  Assign
                                </button>
                              </span>
                            )
                          )
                        ) : (
                          <span className="text-xs font-semibold whitespace-no-wrap">
                            -
                          </span>
                        )
                      ) : (
                        <span
                          className={`text-xs font-semibold whitespace-nowrap ${
                            column?.key === "OrderSchedule.status"
                              ? item?.OrderSchedule?.status === "SCHEDULED"
                                ? "text-customGreen"
                                : item?.OrderSchedule?.status ===
                                  "JOB_COMPLETED"
                                ? "text-customGreen"
                                : item?.OrderSchedule?.status === "RE_SCHEDULED"
                                ? "text-customRed"
                                : item?.OrderSchedule?.status === "ASSIGNED"
                                ? "text-customBlue"
                                : "text-orange-500"
                              : ""
                          }`}
                        >
                          {/* {column?.key === "OrderSchedule.status" &&
                          item?.deliveryOption === "DELIVERY_INSTALLATION" &&
                          isEmpty(item?.OrderSchedule) ? (
                            "NOT SCHEDULED"
                          ) : column?.key === "OrderSchedule.status" &&
                            item?.deliveryOption === "DELIVERY" ? (
                            <span className="text-black">-</span>
                          ) : (
                            getNestedValue(item, column.key)
                          )} */}
                          {column?.key === "OrderSchedule.status" &&
                          (item?.deliveryOption === "DELIVERY_INSTALLATION" ||
                            item?.deliveryOption === "INSTALLATION") &&
                          isEmpty(item?.OrderSchedule) ? (
                            "Not Scheduled"
                          ) : column?.key === "OrderSchedule.status" &&
                            item?.deliveryOption === "DELIVERY" ? (
                            <span className="text-black">-</span>
                          ) : (
                            getNestedValue(item, column.key)
                          )}
                        </span>
                      )}
                    </td>
                  ))}

                  <td className="px-5 py-3 text-blue-500 cursor-pointer text-sm">
                    <button
                      onClick={() => {
                        onView(item);
                      }}
                      className="relative text-xs font-semibold whitespace-no-wrap"
                    >
                      View
                    </button>
                  </td>
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
      {showOrderPopup && (
        <OrderPopUp
          order={selectedOrder}
          status={selectedStatus}
          user={userInfoData}
          onClose={() => {
            setShowOrderPopup(false), setEditingItem(null);
          }}
          onConfirm={() => setShowOrderPopup(false)} // Close popup after confirming
          fetchOrderList={() => fetchOrderList()}
          setEditingItem={setEditingItem}
        />
      )}{" "}
    </div>
  );
};

export default OrderTable;
