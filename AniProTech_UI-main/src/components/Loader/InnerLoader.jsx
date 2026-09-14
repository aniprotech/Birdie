import React from "react";

const InnerLoader = ({ loading, text, style }) => {
    return (
        <div className="flex items-center justify-center">
            {loading && (
                <>
                    <div
                        className={`h-4 w-4 animate-spin rounded-full ${
                            style ? "mr-0 border-black" : "mr-2 border-white"
                        } border-2 border-t-transparent`}
                    ></div>
                    <span className="text-sm text-white">{text}</span>
                </>
            )}
        </div>
    );
};

export default InnerLoader;
