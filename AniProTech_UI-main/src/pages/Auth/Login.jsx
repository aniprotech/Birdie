import { Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { loginValidationSchema } from "../../utils/validationSchema";
import InnerLoader from "../../components/Loader/InnerLoader";
import { _post } from "../../utils/ApiService";
import { showError } from "../../utils/toaster";

const Login = ({ setActiveComponent, setEmail }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const apiOrigin = (import.meta.env.VITE_APP_BASE_LIVE_URL || "https://backend.aniprotech.com").replace(/\/$/, "");

    useEffect(() => {
        const reason = new URLSearchParams(window.location.search).get("authError");
        if (reason) showError(reason === "microsoft_not_configured" ? "Microsoft sign-in is not configured yet." : "Microsoft sign-in could not be completed.");
    }, []);

    const handleFormSubmit = async (values, { resetForm }) => {
        setIsSubmitting(true);
        try {
            setEmail(values?.email);
            const response = await _post("/api/auth/request-link", {
                email: values?.email,
            });

            if (response?.data?.error === false) {
                // showSuccess(response?.data?.message);
                setIsSubmitting(false);
                setActiveComponent("AuthNotification");
                resetForm();
            }
        } catch (error) {
            console.log("error", error);
            setEmail("");
            setIsSubmitting(false);
            console.error("Error during form submission:", error);
            showError(error?.response?.data?.message || "Network Error, please try again later.");
            // toast.dismiss();
        }
    };

    return (
        <div
            className="relative flex min-h-screen items-center justify-center overflow-hidden bg-customNavy px-4 font-poppins"
            style={{ backgroundImage: `url('/login-bg.svg')` }}
        >
            <div className="flex flex-col items-center">
                {/* Login Card */}
                <div className="z-0 m-5 w-full space-y-6 rounded-2xl bg-white p-10 text-center shadow-xl md:w-[420px]">
                    <div>
                        <h1 className="text-2xl font-bold text-customTextGrey1">Welcome Back!</h1>
                        <p className="mt-1 text-sm text-customGrey">We're excited to have you here</p>
                    </div>

                    <Formik
                        initialValues={{ email: "" }}
                        validationSchema={loginValidationSchema}
                        onSubmit={handleFormSubmit}
                        validateOnChange
                        validateOnBlur
                    >
                        {({ errors, touched, handleBlur, handleChange, values, isValid }) => (
                            <Form className="space-y-4">
                                <div className="relative text-left">
                                    <label
                                        htmlFor="email"
                                        className="mb-2 block font-medium text-customTextGrey"
                                    >
                                        Email
                                    </label>
                                    <Mail className="absolute left-3 top-[54px] h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                    <Field name="email">
                                        {({ field }) => (
                                            <input
                                                {...field}
                                                id="email"
                                                placeholder="Enter your email"
                                                readOnly={isSubmitting} // Prevent typing
                                                disabled={isSubmitting} // Greyed out
                                                className={`w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-sm focus:border-customBlue focus:outline-none ${
                                                    isSubmitting ? "cursor-not-allowed bg-gray-100" : ""
                                                }`}
                                            />
                                        )}
                                    </Field>

                                    {touched.email && errors.email && <div className="mt-1 text-left text-xs text-red-500">{errors.email}</div>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !values.email || !isValid}
                                    className="w-full rounded-lg bg-customBlue py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:bg-customBlue/60"
                                >
                                    {isSubmitting ? (
                                        <InnerLoader
                                            loading={isSubmitting}
                                            text="Sending..."
                                        />
                                    ) : (
                                        "Send me a link"
                                    )}
                                </button>
                            </Form>
                        )}
                    </Formik>

                    <div className="relative flex w-full items-center">
                        <hr className="flex-grow border-customGrey" />
                        <span className="mx-4 bg-white text-sm text-gray-500">OR</span>
                        <hr className="flex-grow border-customGrey" />
                    </div>

                    <div>
                        <p className="mb-2 text-sm font-semibold text-gray-600">Sign in using SSO (Single Sign-on)</p>
                        <button type="button" onClick={() => window.location.assign(`${apiOrigin}/api/auth/microsoft`)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 py-2.5 text-sm font-medium transition hover:bg-gray-100">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
                                alt="Microsoft Logo"
                                className="h-5 w-5"
                            />
                            Sign in via Microsoft
                        </button>
                    </div>

                    <p className="text-xs text-customGrey">
                        Not sure if your company uses SSO? <br />
                        Contact your administrator for help.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
