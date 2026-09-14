import React from "react";
import { SquarePen } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { format, parseISO, differenceInYears } from "date-fns";
import { teamsAgencyAdminConfig, teamsInfoConfigs } from "../../../../data/teams";
import { capitalizeFirstLetter, getReferredToAs, getStatusBadge, isEmpty, isNotEmpty } from "../../../../utils/common";
import useScrollToTop from "../../../../hooks/useScrollToTop";

const TeamsProfileSection = ({ data, setActiveComponent, sectionId, pageName }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const config =
        pageName === "TeamsPersonalDetails"
            ? teamsInfoConfigs?.find((section) => section.id === sectionId) || null
            : teamsAgencyAdminConfig?.find((section) => section.id === sectionId) || null;
    if (!config) return null;

    const profile = config?.id === "termination" ? data?.termination : data;
    useScrollToTop();

    return (
        <div className="mt-6 w-full rounded-lg bg-white p-5 shadow border border-customBorder/40">
            <div className="mb-6 flex items-center justify-between text-base md:text-xl">
                <h3 className="poppins-medium text-customTextColor">{config.componentTitle}</h3>
                <button
                    className="flex items-center text-base font-medium text-customTextNavy hover:underline "
                    onClick={() => {
                        // setActiveComponent(`EditBaseInfoDetails`);
                        navigate(`/admin/teams/${id}/teams-info/edit/${sectionId}`, {
                            state: {
                                data: data,
                            },
                        });
                    }}
                >
                    <SquarePen className="mr-1 h-4 w-4" />
                    Edit
                </button>
            </div>

            <div className=" ">
                {config?.fields?.map((field, index) => {
                    let value = "-";

                    if (profile && profile.hasOwnProperty(field.key)) {
                        if (field.isDate) {
                            try {
                                const date = parseISO(profile[field.key]);
                                const age = differenceInYears(new Date(), date);
                                value = `${format(date, "d MMMM yyyy")} (${age} years old)`;
                            } catch {
                                value = profile[field.key];
                            }
                        } else if (field.key === "map") {
                            value = (
                                <a
                                    href={profile[field.key]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="break-all text-customBlue1 hover:underline"
                                >
                                    {profile[field.key]}
                                </a>
                            );
                        } else {
                            if (field.key === "methodOfContact" && Array.isArray(profile[field.key])) {
                                value = profile[field.key].map((item) => capitalizeFirstLetter(item.toLowerCase())).join(", ");
                            } else {
                                value = profile[field.key];
                            }
                        }
                    }

                    return (
                        <div
                            key={index}
                            className="flex flex-col border border-customBorder/40 px-3 py-4 text-base sm:flex-row sm:items-center sm:justify-between poppins-medium"
                        >
                            <p className="   text-sm  text-customDefaultTextColor sm:w-1/2">{field.label}</p>
                            <p className="mt-1 text-left text-sm text-customTextGrey1 sm:mt-0 sm:w-1/2 ">
                                {value === null || value === "" || isEmpty(value)
                                    ? "-"
                                    : field.key === "gender" || field.key === "title" || field.key === "role" || field.key === "type"
                                      ? capitalizeFirstLetter(value)
                                      : field.key === "referredAs"
                                        ? getReferredToAs(value)
                                        : field.key === "isActive"
                                          ? getStatusBadge(value)
                                          : value}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TeamsProfileSection;
