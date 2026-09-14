import React from "react";
import { useLocation } from "react-router-dom";

const DotLoader = ({ loading, style }) => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith("/admin");

    return (
        <>
            {loading && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center ${style ? "" : "bg-slate-100/20"} `}>
                    <div className="flex space-x-2">
                        {[0, 1, 2].map((dot) => (
                            <span
                                key={dot}
                                className={`h-4 w-4 rounded-full ${isAdmin ? "bg-customNavy" : "bg-customNavy"} animate-bounce`}
                                style={{
                                    animationDelay: `${dot * 0.2}s`,
                                }}
                            ></span>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default DotLoader;
