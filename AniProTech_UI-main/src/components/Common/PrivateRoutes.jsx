import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { _post } from "../../utils/ApiService";
import { showError } from "../../utils/toaster";
import { toast } from "sonner";
import DotLoader from "../Loader/DotLoader";
import useAuthStore from "../../stores/authStore";

const IDLE_LIMIT_MS = 5 * 60 * 1000;
const WARNING_MS = 30 * 1000;

const ProtectedRoute = ({ children }) => {
    const [isAuth, setIsAuth] = useState(null);
    const token = localStorage.getItem("access_token");

    useEffect(() => {
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
        let lastActivity = Date.now(), warningOpen = false, ending = false;
        const activity = () => { lastActivity = Date.now(); warningOpen = false; };
        const endSession = async (message) => {
            if (ending) return;
            ending = true;
            try { await _post("/api/auth/logout"); } catch { /* the local session must still end */ }
            localStorage.removeItem("access_token");
            localStorage.removeItem("userInfo");
            useAuthStore.getState().setUserData(null);
            setIsAuth(false);
            showError(message);
        };
        const events = ["pointerdown", "keydown", "touchstart", "scroll"];
        events.forEach((event) => window.addEventListener(event, activity, { passive: true }));
        const check = window.setInterval(async () => {
            const idle = Date.now() - lastActivity;
            if (idle >= IDLE_LIMIT_MS) return endSession("You were signed out after 5 minutes of inactivity. Request a new sign-in link to continue.");
            if (idle >= IDLE_LIMIT_MS - WARNING_MS && !warningOpen) {
                warningOpen = true;
                if (window.confirm("Your Caremonitor session will end in 30 seconds because there has been no activity. Stay signed in?")) {
                    activity();
                    try { await _post("/api/auth/validate-token"); } catch { await endSession("Your session expired. Request a new sign-in link to continue."); }
                }
            }
        }, 1000);
        const heartbeat = window.setInterval(() => {
            if (Date.now() - lastActivity < 60000) _post("/api/auth/validate-token").catch(() => endSession("Your session expired. Request a new sign-in link to continue."));
        }, 60000);
        return () => {
            events.forEach((event) => window.removeEventListener(event, activity));
            window.clearInterval(check);
            window.clearInterval(heartbeat);
        };
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
