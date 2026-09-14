import React, { useState } from "react";
import useDisableScroll from "../../../../hooks/useDisableScroll";
import {
  Bell,
  Calendar,
  FileText,
  CheckSquare,
  ChevronRight,
  X as CloseIcon,
} from "lucide-react";
import DropdownField from "../../../../components/DropdownInput/Dropdown";
import DropdownDateRangeSelector from "../../../../components/DateRange/DateRangePicker";
import { notificationFilters } from "../../../../data/teams/carerFeed";
import { clientsProfileTitleOptions } from "../../../../constants";

const iconMap = {
  Alerts: Bell,
  Visits: Calendar,
  Notes: FileText,
  Actions: CheckSquare,
};

export default function FeedFilterPopUp({ showFilterPopUp, setShowFilterPopUp }) {
  useDisableScroll();
  const [selections, setSelections] = useState({});

  if (!showFilterPopUp) return null;

  const toggleItem = (section, id) => {
    const key = `${section}__${id}`;
    setSelections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-md bg-white">
        
        {/* Sticky Top Navbar */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4 shadow-sm">
          <h1 className="text-base font-semibold">Advanced Filter</h1>
          <button
            className="text-gray-500 hover:text-black"
            onClick={() => setShowFilterPopUp((v) => !v)}
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Date Range and Title Dropdown */}
          <div className="space-y-4 border-b pb-6">
            <DropdownDateRangeSelector />
            <DropdownField
              label="Clients"
              name="clients"
              options={clientsProfileTitleOptions}
              valueChange={(e) => {
                console.log(e);
              }}
              componentName="FormikValidation"
              style={"textSize"}
              placeholder="client"
            />
          </div>

          {/* Notification Filters */}
          {notificationFilters?.map((config) => {
            const Icon = iconMap[config.key] || Bell;
            return (
              <div key={config.key} className="border-b pb-7">
                <h2 className="mb-4 flex items-center text-customTextGrey1 gap-2 text-base font-semibold">
                  <Icon className="h-4 w-4 " />
                  {config.key}
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {config.sections.map((section) => (
                    <div key={section.title}>
                      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-customGrey">
                        <ChevronRight className="h-4 w-4 text-text-customGrey" />
                        {section.title}
                      </h3>

                      {section.type === "checkbox" && (
                        <ul className="space-y-1 pl-6">
                          {section.items.map((item) => {
                            const selKey = `${section.title}__${item.id}`;
                            return (
                              <li key={item.id} className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 cursor-pointer rounded border border-gray-300 transition-all duration-200 ease-in-out checked:border-customBlue checked:accent-cyan-600 focus:outline-none focus:ring-0"
                                  checked={!!selections[selKey]}
                                  onChange={() => toggleItem(section.title, item.id)}
                                />
                                <span className="text-customGrey">
                                  {item.label} ({item.count})
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      {section.type === "dateRange" && (
                        <div className="pl-6">
                          <DropdownDateRangeSelector placeholder={section.placeholder} style="customize" />
                        </div>
                      )}

                      {/* Uncomment if using select fields */}
                      {section.type === "select" && (
                        <div className="pl-6">
                          <DropdownField
                            label={null}
                            name={section.title}
                            options={section.options}
                            placeholder={section.placeholder}
                            value={selections[section.title] || ""}
                            valueChange={(val) =>
                              setSelections((prev) => ({
                                ...prev,
                                [section.title]: val,
                              }))
                            }
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-10 flex justify-between border-t bg-white p-4">
          <button
            className="text-sm text-blue-600 hover:underline"
            onClick={() => setSelections({})}
          >
            Clear all
          </button>
          <button className="rounded bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
            Apply filters
          </button>
        </div>
      </div>
    </div>
  );
}
