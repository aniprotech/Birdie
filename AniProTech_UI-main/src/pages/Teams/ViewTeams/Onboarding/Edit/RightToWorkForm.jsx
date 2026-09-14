import React from "react";
import FileUploadField from "../../../../../components/FileUploads/FileUploadField";

const RightToWorkForm = ({ values, setFieldValue }) => {
    return (
        <>
            <h2 className="text-base poppins-medium text-customTextColor md:text-xl">Right to work</h2>
            {/* File Upload */}
            <FileUploadField
                label="ID"
                name="id_file"
                file={values?.id_file}
                setFile={(file) => setFieldValue("id_file", file)}
                accept="application/pdf,image/*"
            />
            <div className="py-2.5">
                <hr className="border-t border-gray-300" />
            </div>
            {/* File Upload */}
            <FileUploadField
                label="Driving licence"
                name="driving_licence"
                file={values?.driving_licence}
                setFile={(file) => setFieldValue("driving_licence", file)}
                accept="application/pdf,image/*"
            />
            <div className="py-2.5">
                <hr className="border-t border-gray-300" />
            </div>
            {/* File Upload */}
            <FileUploadField
                label="Bank statement"
                name="bank_statement"
                file={values?.bank_statement}
                setFile={(file) => setFieldValue("bank_statement", file)}
                accept="application/pdf,image/*"
            />
            <div className="py-2.5">
                <hr className="border-t border-gray-300" />
            </div>
            {/* File Upload */}
            <FileUploadField
                label="Utility bill"
                name="utility_bill"
                file={values?.utility_bill}
                setFile={(file) => setFieldValue("utility_bill", file)}
                accept="application/pdf,image/*"
            />
            <div className="py-2.5">
                <hr className="border-t border-gray-300" />
            </div>
            {/* File Upload */}
            <FileUploadField
                label="References"
                name="references_file"
                file={values?.references_file}
                setFile={(file) => setFieldValue("references_file", file)}
                accept="application/pdf,image/*"
            />
            <div className="py-2.5">
                <hr className="border-t border-gray-300" />
            </div>
            {/* File Upload */}
            <FileUploadField
                label="DBS record"
                name="dbs_record"
                file={values?.dbs_record}
                setFile={(file) => setFieldValue("dbs_record", file)}
                accept="application/pdf,image/*"
            />
        </>
    );
};

export default RightToWorkForm;
