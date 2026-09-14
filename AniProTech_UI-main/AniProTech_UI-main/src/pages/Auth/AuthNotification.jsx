import React from "react";

const AuthNotification = ({ setActiveComponent,email }) => {
    return (
        <div
            className="flex min-h-screen items-center justify-center bg-customNavy px-4 font-poppins"
            style={{ backgroundImage: `url('/login-bg.svg')` }}
        >
            <div className="flex flex-col items-center">
                {/* Logo Circle and Title */}
                {/* <div className="z-10 flex flex-row items-center gap-2">
                    <div className="rounded-full bg-white p-1 shadow-lg">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/295/295128.png"
                            alt="Ani Tech Logo"
                            className="h-6 w-6"
                        />
                    </div>
                    <h2 className="text-3xl font-extrabold uppercase text-white">Ani Tech</h2>
                </div> */}

                {/* Popup Card */}
                <div className="z-0 mt-6 w-full max-w-4xl rounded-lg bg-white p-8 text-center shadow-xl sm:max-w-3xl md:max-w-3xl lg:max-w-3xl">
                    <h2 className="text-2xl font-bold text-customTextGrey1">Check your email!</h2>

                    <p className="mt-3 text-sm font-medium text-customGrey">
                        We just sent an email to your inbox at <br />
                        <a
                            href="#"
                            className="font-semibold text-customBlue3 underline"
                        >
                            {email ? email : ""}
                        </a>
                        .<br />
                        It contains a link that will sign you into Ani-Tech.
                    </p>

                    <button
                        onClick={() => {
                            setActiveComponent("Login");
                        }}
                        className="mt-6 rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium transition hover:bg-gray-100"
                    >
                        Back to Login
                    </button>

                </div>
            </div>
        </div>
    );
};

export default AuthNotification;
