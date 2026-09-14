import React from "react";
import PropTypes from 'prop-types';
import { SquarePen } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { format, parseISO, differenceInYears } from "date-fns";
import { baseInfoConfigs } from "../../../../data/clients";
import { capitalizeFirstLetter, getCleanFileName, getReferredToAs } from "../../../../utils/common";

const BaseInfoSection = ({ data, sectionId }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const config = baseInfoConfigs?.find((section) => section.id === sectionId);
    if (!config) return null;

    const formatAddress = (addresses) => {
        if (!addresses || !addresses.length) return "-";
        
        const primaryAddress = addresses.find(addr => addr.isPrimary);
        if (!primaryAddress) return "-";
        
        const parts = [];
        if (primaryAddress.addressLine1) parts.push(primaryAddress.addressLine1);
        // if (primaryAddress.addressLine2) parts.push(primaryAddress.addressLine2);
        
        const locationParts = [];
        if (primaryAddress.city) locationParts.push(primaryAddress.city);
        if (primaryAddress.county) locationParts.push(primaryAddress.county);
        if (primaryAddress.country) locationParts.push(primaryAddress.country);
        if (primaryAddress.postalCode) locationParts.push(primaryAddress.postalCode);
        
        if (locationParts.length > 0) {
            parts.push(locationParts.join(", "));
        }
        
        return parts.length > 0 ? parts.join("\n") : "-";
    };

    const formatValue = (field, value) => {
        if (value === null || value === undefined || value === "") return "-";

        if (field.isDate && value) {
            try {
                const date = parseISO(value);
                const age = differenceInYears(new Date(), date);
                return `${format(date, "d MMMM yyyy")} (${age} years old)`;
            } catch {
                return value;
            }
        }

        if(field.key === "profileImagePath") {
            return getCleanFileName(value);
        }

        if (field.key === "title") {
            return capitalizeFirstLetter(value);
        }

        if (field.key === "referredAs") {
            return getReferredToAs(value);
        }

        if (field.key === "primaryPhone" || field.key === "secondaryPhone") {
            const phoneCode = field.key === "primaryPhone" ? data.primaryPhoneCode : data.secondaryPhoneCode;
            return value ? `${phoneCode} - ${value}` : "-";
        }

        if (field.key === "primaryPhoneType" || field.key === "secondaryPhoneType") {
            return capitalizeFirstLetter(value);
        }

        if (field.key.startsWith("address.")) {
            const addresses = data?.addresses || [];
            const primaryAddress = addresses.find(addr => addr.isPrimary);
            
            if (!primaryAddress) return "-";

            const addressKey = field.key.split(".")[1];
            
            if (addressKey === "fullAddress") {
                return formatAddress(addresses);
            }
            
            if (addressKey === "secureCheckin") {
                return primaryAddress[addressKey] === "true" ? "Yes" : "No";
            }

            if (addressKey === "map") {
                return primaryAddress[addressKey] || "-";
            }

            return primaryAddress[addressKey] || "-";
        }

        return value;
    };

    return (
        <div className="mx-auto mt-6 max-w-4xl rounded-lg bg-white p-6 shadow border border-customBorder/40">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="poppins-medium text-customTextGrey text-base md:text-xl">{config.componentTitle}</h2>
                <button
                    className="flex items-center font-medium text-customTextNavy text-base hover:underline"
                    onClick={() => {
                        navigate(`/admin/clients/${id}/basic-info/edit`, {
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

            <div className="divide-y divide-gray-200">
                {config.fields.map((field, index) => {
                    const value = field.key.startsWith("address.") 
                        ? formatValue(field, data.addresses)
                        : formatValue(field, data[field.key]);

                    return (
                        <div
                            key={index}
                            className="flex flex-col py-4 text-base sm:flex-row sm:items-center sm:justify-between poppins-medium"
                        >
                            <p className="text-sm text-customDefaultTextColor sm:w-1/2">{field.label}</p>
                            <p className="mt-1 text-left text-sm text-customTextGrey1 sm:mt-0 sm:w-1/2 whitespace-pre-line">
                                {React.isValidElement(value) ? value : value}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

BaseInfoSection.propTypes = {
    data: PropTypes.array.isRequired,
    sectionId: PropTypes.string.isRequired
};

export default BaseInfoSection;
