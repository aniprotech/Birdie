import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SwitchComponents from "../../components/SwitchComponent/SwitchComponent";
import Login from "./Login";
import RegisterBusiness from "./RegisterBusiness";
import AuthNotification from "./AuthNotification";
import { _post } from "../../utils/ApiService";
import { showError, showSuccess } from "../../utils/toaster";
import { isNotEmpty } from "../../utils/common";
import { toast } from "sonner";
import { decryptData, encryptData } from "../../utils/cryptoHelpers";
import { waitFor } from "../../utils/debounce";
import DotLoader from "../../components/Loader/DotLoader";
import useAuthStore from "../../stores/authStore";

const AuthIndex = () => {
    const [activeComponent, setActiveComponent] = useState("Login");
    const [mode, setMode] = useState("");
    const [email, setEmail] = useState("");
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);

    const { setUserData } = useAuthStore();

    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");
    const accessToken = localStorage.getItem("access_token");

    useEffect(() => {
        if (!token && isNotEmpty(accessToken)) {
            try {
                const decrypted = decryptData(accessToken);
                if (isNotEmpty(decrypted)) {
                    const from = location.state?.from?.pathname || "/admin/teams";
                    navigate(from, { replace: true });
                }
            } catch (e) {
                navigate("/login", { replace: true });
            }
        }
    }, []);

    const hasRunRef = useRef(null);

    useEffect(() => {
        if (!token || hasRunRef.current === token) return;
        hasRunRef.current = token;

        if (isNotEmpty(token)) {
            setLoading(true);
            localStorage.removeItem("access_token");
            setUserData(null);
            let email, password;
            try {
                const decodedToken = atob(token.replace(/-/g, "+").replace(/_/g, "/"));
                [email, password] = decodedToken.split(":");
                if (!email || !password) throw new Error("Invalid login link");
            } catch {
                setLoading(false);
                showError("Invalid login link. Please request a new link.");
                navigate("/login", { replace: true });
                return;
            }

            const loginFromToken = async () => {
                try {
                    const response = await _post("/api/auth/get-token", {
                        email,
                        password,
                    });

                    toast.dismiss();
                    const accessToken = response?.data?.results?.data?.accessToken;
                    if (!accessToken || response?.data?.error) {
                        throw new Error("The server did not return a valid session.");
                    }
                    const eData = encryptData(accessToken);
                    localStorage.setItem("access_token", eData);

                    setUserData(response?.data?.results?.data);
                    setData(response?.data?.results?.data);

                    await waitFor(1000);
                    setLoading(false);
                    navigate("/admin/teams", { replace: true });
                } catch (error) {
                    localStorage.removeItem("access_token");
                    setUserData(null);
                    showError(error?.response?.data?.message || error.message || "Unable to sign in. Please request a new link.");
                    setLoading(false);
                    navigate("/login", { replace: true });
                }
            };

            loginFromToken();
        }
    }, [token]);

    return (
        <div className="relative">
            <div>{loading ? <DotLoader loading={loading} /> : ""}</div>
            <SwitchComponents active={activeComponent}>
                <Login
                    name="Login"
                    data={data}
                    setData={setData}
                    mode={mode}
                    setMode={setMode}
                    setActiveComponent={setActiveComponent}
                    setEmail={setEmail}
                    email={email}
                />
                <RegisterBusiness
                    name="RegisterBusiness"
                    setActiveComponent={setActiveComponent}
                    setEmail={setEmail}
                />
                <AuthNotification
                    name="AuthNotification"
                    data={data}
                    setData={setData}
                    mode={mode}
                    setMode={setMode}
                    setActiveComponent={setActiveComponent}
                    setEmail={setEmail}
                    email={email}
                />
            </SwitchComponents>
        </div>
    );
};

export default AuthIndex;
