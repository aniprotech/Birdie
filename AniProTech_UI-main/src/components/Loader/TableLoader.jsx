import React from "react";
import { FaSpinner } from "react-icons/fa";

const TableLoader = () => {
    return (
        <div className="flex items-center justify-center gap-2">
            <FaSpinner className="animate-spin text-gray-500" />
            <span className="text-gray-500">Loading...</span>
        </div>
    );
};

export default TableLoader;
