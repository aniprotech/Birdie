import { SquarePen } from "lucide-react";
import React from "react";
import { useNavigationHelpers } from "../../../../hooks/useNavigationHelpers";
import { capitalizeFirstLetter } from "../../../../utils/common";

const OperationTravelInfo = ({ data }) => {
    const { navigate, id } = useNavigationHelpers();

    return (
        <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <div className="mb-6 flex items-center justify-between text-base md:text-xl poppins-medium">
                <h2 className=" text-customTextGrey">Travel information</h2>
                <button
                    className="flex items-center text-base poppins-medium text-customTextNavy hover:underline "
                    onClick={() => {
                        // setActiveComponent(`EditBaseInfoDetails`);
                        navigate(`/admin/teams/${id}/operations/edit/travel-info`, {
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
                <div className="poppins-medium flex flex-col border-b border-gray-300 p-4 text-sm sm:flex-row sm:items-center sm:justify-between ">
                    <p className="text-customDefaultTextColor">Address</p>
                    <p className="mt-1 text-customTextGrey1 sm:mt-0">{data?.address || "None"}</p>
                </div>
                <div className="flex flex-col p-4 text-left sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-medium text-customDefaultTextColor">Transport method</p>
                    <p className="mt-1 text-left text-customTextGrey1 sm:mt-0">
                        {data?.transportMethod ? capitalizeFirstLetter(data?.transportMethod) : "—"}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OperationTravelInfo;
