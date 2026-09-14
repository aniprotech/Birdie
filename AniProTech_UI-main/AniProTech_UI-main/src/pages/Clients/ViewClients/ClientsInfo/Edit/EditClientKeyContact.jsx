import React from 'react'
import { keyContactsConfig } from "../../../../../data/clients/clinicalDetailsConfig";

const EditClientKeyContact = ({ data, setData, mode, setMode }) => {
    return (
        <div className="space-y-6">
            {keyContactsConfig.map((section) => (
                <div
                    key={section.id}
                    id={section.id}
                    className="mt-6 w-full rounded-lg bg-white p-5 shadow border border-customBorder/40"
                >
                    <h2 className="mb-6 text-xl font-medium text-customTextGrey">
                        {section.componentTitle}
                    </h2>
                    <div className="space-y-4">
                        {section.fields.map((field, index) => (
                            <div key={index} className="space-y-2">
                                <label className="block text-sm font-medium text-customTextGrey">
                                    {field.label}
                                </label>
                                <input
                                    type="text"
                                    value={data[field.key] || ""}
                                    onChange={(e) =>
                                        setData((prev) => ({
                                            ...prev,
                                            [field.key]: e.target.value,
                                        }))
                                    }
                                    className="w-full rounded-md border border-customBorder p-2 text-sm focus:border-customTextNavy focus:outline-none"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EditClientKeyContact