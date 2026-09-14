import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { _post } from "../../utils/ApiService";
import { showError } from "../../utils/toaster";
import { toast } from "sonner";
import DotLoader from "../Loader/DotLoader";

const ProtectedRoute = ({ children }) => {
    const [isAuth, setIsAuth] = useState(null);
    const token = localStorage.getItem("access_token");
    const hasRunRef = useRef(false);

    useEffect(() => {
        if (hasRunRef.current) return;
        hasRunRef.current = true;

        const handleValidateToken = async () => {
            if (!token) {
                setIsAuth(false);
                return;
            }

            try {
                const response = await _post("/api/auth/validate-token");

                if (response?.data?.error === false) {
                    setIsAuth(true);
                } else {
                    localStorage.clear();
                    setIsAuth(false);
                }
            } catch (error) {
                console.error("Token validation failed:", error);
                localStorage.clear();
                setIsAuth(false);
                showError(error?.response?.data?.message || "Network Error, please try again later.");
                toast.dismiss();
            }
        };

        handleValidateToken();
    }, []);

    if (isAuth === null) {
        return (
            <div>
                {" "}
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100/20">
                    <div className="flex space-x-2">
                        {[0, 1, 2].map((dot) => (
                            <span
                                key={dot}
                                className={`h-4 w-4 rounded-full bg-customNavy animate-bounce`}
                                style={{
                                    animationDelay: `${dot * 0.2}s`,
                                }}
                            ></span>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuth) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return children;
};

export default ProtectedRoute;
