import { SquarePen } from "lucide-react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import useScrollToTop from "../../../../hooks/useScrollToTop";
import { capitalizeFirstLetter, formatTypeOfContact } from "../../../../utils/common";

const KeyContactIndex = ({ data }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    useScrollToTop();

    return (
        <div>
            <div className="mb-6 px-4 flex items-center justify-between border-b py-10 text-base md:px-7 md:text-xl">
                <h3 className="poppins-medium text-customTextColor">Key Contact</h3>
                <button
                    className="flex items-center text-base poppins-medium text-customTextNavy hover:underline "
                    onClick={() => {
                        navigate(`/admin/teams/${id}/teams-info/edit/key-contact`, {
                            state: { data },
                        });
                    }}
                >
                    <SquarePen className="mr-1 h-4 w-4" />
                    Edit
                </button>
            </div>

            {data?.keyContacts?.map((contact, index) => (
                <div
                    key={index}
                    className="mb-8 rounded-lg bg-white border border-gray-200 p-4 shadow-sm poppins-medium"
                >
                    <div className="text-customDefaultTextColor">
                        <div className="flex flex-col border border-customBorder/40 px-3 py-4 text-base sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm sm:w-1/2 ">First name</p>
                            <p className="mt-1 text-left text-sm sm:mt-0 sm:w-1/2  text-customTextGrey1">{contact.firstName || "—"}</p>
                        </div>
                        <div className="flex flex-col border border-customBorder/40 px-3 py-4 text-base sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm sm:w-1/2 ">Last name</p>
                            <p className="mt-1 text-left text-sm sm:mt-0 sm:w-1/2  text-customTextGrey1">{contact.lastName || "—"}</p>
                        </div>
                        <div className="flex flex-col border border-customBorder/40 px-3 py-4 text-base sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm sm:w-1/2 ">Relationship</p>
                            <p className="mt-1 text-left text-sm sm:mt-0 sm:w-1/2  text-customTextGrey1">
                                {contact.relationShip ? capitalizeFirstLetter(contact.relationShip.toLowerCase()) : "—"}
                            </p>
                        </div>
                        <div className="flex flex-col border border-customBorder/40 px-3 py-4 text-base sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm sm:w-1/2 ">Phone number</p>
                            <p className="mt-1 text-left text-sm sm:mt-0 sm:w-1/2  text-customTextGrey1">
                                {(contact.phoneCode ? `${contact.phoneCode} - ` : "") + (contact.phoneNumber || "—")}
                            </p>
                        </div>
                        <div className="flex flex-col border border-customBorder/40 px-3 py-4 text-base sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm sm:w-1/2 ">Email address</p>
                            <p className="mt-1 text-left text-sm sm:mt-0 sm:w-1/2  text-customTextGrey1">{contact.email || "—"}</p>
                        </div>
                        <div className="flex flex-col border border-customBorder/40 px-3 py-4 text-base sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm sm:w-1/2 ">Type of contact</p>
                            <p className="mt-1 text-left text-sm sm:mt-0 sm:w-1/2  text-customTextGrey1">
                                {formatTypeOfContact(contact.typeOfContact)}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KeyContactIndex;
