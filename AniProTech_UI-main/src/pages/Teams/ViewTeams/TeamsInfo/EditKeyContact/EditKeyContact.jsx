import clsx from "clsx";
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Formik, FieldArray } from "formik";
import KeyContactForm from "./KeyContactForm";
import { teamsKeyContactsValidationSchema } from "../../../../../utils/validationSchema";
import { Trash2 } from "lucide-react";
import InnerLoader from "../../../../../components/Loader/InnerLoader";
import { fetchData } from "../../../../../utils/FetchData";
import APIConfig from "../../../../../utils/ApiConfig";
import { showSuccess } from "../../../../../utils/toaster";
import { _put } from "../../../../../utils/ApiService";

const defaultContact = {
    firstName: "",
    lastName: "",
    phoneNumber: null,
    phoneCode: "+91",
    email: "",
    relationShip: null,
    typeOfContact: [],
};

const EditKeyContact = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const paramsData = location?.state?.data;
    const shouldTransform = true;
    const [loading, setLoading] = useState(false);

    const initialValues = useMemo(() => {
        const contacts = paramsData?.keyContacts;
        if (Array.isArray(contacts) && contacts.length > 0) {
            return {
                keyContacts: contacts.map((c) => ({
                    firstName: c?.firstName || "",
                    lastName: c?.lastName || "",
                    phoneNumber: c?.phoneNumber || null,
                    phoneCode: c?.phoneCode || "+91",
                    email: c?.email || "",
                    relationShip: c?.relationShip || null,
                    typeOfContact: c?.typeOfContact || [],
                })),
            };
        }
        return { keyContacts: [defaultContact] };
    }, [paramsData]);

    return (
        <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={teamsKeyContactsValidationSchema}
            onSubmit={async (values) => {
                const filteredKeyContacts = values.keyContacts.filter((contact) => {
                    const { phoneCode, ...rest } = contact;
                    return Object.values(rest).some((val) => val !== null && val !== "" && !(Array.isArray(val) && val.length === 0));
                });


                // const updated = {
                //     ...values,
                //     keyContacts: values.keyContacts.map((contact) => ({
                //         ...contact,
                //         typeOfContact: JSON.stringify(contact.typeOfContact || []),
                //     })),
                // };

                const finalPayload = {
                    ...paramsData,
                    keyContacts: filteredKeyContacts,
                };

                const response = await fetchData(
                    (data) => _put(APIConfig?.USERS?.UPDATE(id), data),
                    null, // setData
                    setLoading, // setLoading
                    null, // setGlobalData
                    finalPayload, // payload
                    shouldTransform, // transformUpdatePayload
                );

                if (response?.data?.error === false) {
                    navigate(-1);
                    showSuccess(response?.data?.message);
                }
            }}
        >
            {({ values, handleSubmit, setFieldValue }) => (
                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-screen flex-col md:px-20 xl:px-40"
                >
                    {/* Sticky Header */}
                    <div className="sticky top-0 z-10 border-b border-gray-300 bg-white">
                        <div className="container mx-auto px-6 pt-6">
                            <div
                                className={clsx(
                                    "relative inline-block pb-2 text-base font-semibold text-customTextNavy",
                                    "after:absolute after:inset-x-0 after:-bottom-[1px] after:h-[3px] after:bg-customTextNavy",
                                )}
                            >
                                Key contacts
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto py-10 md:px-6">
                        <p className="text-base font-medium">Next of kins / Emergency contacts</p>

                        <FieldArray name="keyContacts">
                            {({ push, remove }) => (
                                <>
                                    {values?.keyContacts.map((_, index) => (
                                        <div
                                            key={index}
                                            className="relative mt-6 rounded-lg border p-4 pt-10"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="absolute right-3 top-3 text-sm font-semibold text-red-600 hover:text-red-800"
                                            >
                                                <Trash2
                                                    className="mr-1 inline-block"
                                                    size={16}
                                                />
                                                Delete entry below
                                            </button>

                                            <KeyContactForm
                                                index={index}
                                                setFieldValue={setFieldValue}
                                            />
                                        </div>
                                    ))}

                                    <p
                                        className="mt-6 w-fit border border-customNavy px-3 py-2 text-sm hover:cursor-pointer hover:bg-customHoverBlue"
                                        onClick={() => push(defaultContact)}
                                    >
                                        + Add another
                                    </p>
                                </>
                            )}
                        </FieldArray>
                    </div>

                    {/* Sticky Footer */}
                    <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white py-4 md:py-7">
                        <div className="container mx-auto flex justify-between px-6 py-4">
                            <button
                                onClick={() => navigate(`/admin/teams/${id}/teams-info`)}
                                type="button"
                                className="rounded border border-customNavy px-4 py-2 text-sm font-medium text-customTextNavy hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded bg-customDropdownBorder px-6 py-2 text-sm font-medium text-white hover:bg-customDropdownBorder/90 disabled:cursor-not-allowed disabled:opacity-80"
                            >
                                {loading ? (
                                    <InnerLoader
                                        loading={loading}
                                        text="Updating..."
                                    />
                                ) : (
                                    "Submit"
                                )}
                            </button>{" "}
                        </div>
                    </div>
                </form>
            )}
        </Formik>
    );
};

export default EditKeyContact;
