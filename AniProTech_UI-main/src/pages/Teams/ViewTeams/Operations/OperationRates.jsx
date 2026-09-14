import { SquarePen } from "lucide-react";
import React from "react";
import { useNavigationHelpers } from "../../../../hooks/useNavigationHelpers";
import { capitalizeFirstLetter } from "../../../../utils/common";

const OperationRates = ({ data }) => {
    const { navigate, id } = useNavigationHelpers();

    return (
        <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <div className="mb-6 flex items-center justify-between text-base md:text-xl">
                <h2 className="poppins-medium text-customTextColor">Rates</h2>
                <button
                    className="flex items-center text-base font-medium text-customTextNavy hover:underline "
                    onClick={() => {
                        // setActiveComponent(`EditBaseInfoDetails`);
                        navigate(`/admin/teams/${id}/operations/edit/rates`, {
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

            <div className="overflow-hidden rounded border border-gray-300 poppins-medium text-sm">
                <div className=" flex flex-col border-b border-gray-300 p-4 text- sm:flex-row sm:items-center sm:justify-between ">
                    <p className="text-customDefaultTextColor ">Rate card</p>
                    <p className="mt-1 text-customTextGrey1 sm:mt-0 text-sm">{data?.rateCard ? capitalizeFirstLetter(data?.rateCard) : "—"}</p>
                </div>
                <div className="flex flex-col p-4 text-left sm:flex-row sm:items-center sm:justify-between">
                    <p className=" text-customDefaultTextColor">Travel rate card</p>
                    <p className="mt-1 text-left text-customTextGrey1 sm:mt-0">
                        {data?.travelRateCard ? capitalizeFirstLetter(data?.travelRateCard) : "—"}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OperationRates;
