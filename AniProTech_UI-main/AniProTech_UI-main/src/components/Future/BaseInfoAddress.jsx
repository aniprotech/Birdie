import { Pencil } from "lucide-react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const BaseInfoAddress = ({ data, setActiveComponent }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const profile = data.find((person) => person.firstName === "David" && person.lastName === "Tuson" && person.status === "active");

    if (!profile) return null;

    const info = [
        { label: "Profile picture", value: "-" },
        { label: "Title", value: "Mr" },
        { label: "First name", value: profile.firstName },
        { label: "Last name", value: profile.lastName },
        { label: "Prefers to be referred to as", value: "He/Him" },
        { label: "Date of birth", value: "30 October 1944 (80 years old)" },
    ];

    return (
        <div className="mx-auto mt-6 max-w-4xl rounded-lg bg-white p-6 shadow-md">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-customTextGrey md:text-2xl">Personal details</h2>
                <button
                    className="flex items-center font-medium text-customTextNavy hover:underline"
                    onClick={() => {
                        setActiveComponent("EditBaseInfoDetails");
                        navigate(`/admin/clients/${id}/basic-info/edit`);
                    }}
                >
                    <Pencil className="mr-1 h-4 w-4" />
                    Edit
                </button>
            </div>
            <div className="divide-y divide-gray-200">
                {info.map((item, index) => (
                    <div
                        key={index}
                        className="flex flex-col py-4 text-base sm:flex-row sm:items-center sm:justify-between"
                    >
                        <p className="font-semibold text-gray-700 sm:w-1/2">{item.label}</p>
                        <p className="mt-1 text-left text-customTextGrey1 sm:mt-0 sm:w-1/2">{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BaseInfoAddress;
