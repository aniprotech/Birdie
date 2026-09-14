import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { RiAdminFill } from "react-icons/ri";

const NotFound = () => {
    const navigate = useNavigate();
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-customNavy1 text-white shadow-lg">
                    <RiAdminFill className="h-8 w-8" />
                </div>
                <h1 className="text-5xl font-bold text-customNavy1">404</h1>
                <p className="mt-2 text-lg text-gray-600">Oops! The page you're looking for doesn't exist.</p>
                <p className="mt-1 text-sm text-gray-500">It might have been moved or deleted.</p>

                <Link
                    onClick={() => navigate(-1)}
                    className="mt-6 inline-block rounded-md bg-customNavy px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-opacity-90"
                >
                    Back to Previous Page
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
