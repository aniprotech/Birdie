import { Switch } from "@headlessui/react";
import PropTypes from "prop-types";
import QRCodeSection from "./QRCodeSection";

const SettingToggle = ({ title, description, warningText, enabled, onChange, clientId, clientName, subTitle }) => {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                    <h3 className="text-lg font-medium text-customBlack1">{title}</h3>
                    <p className="text-sm text-customGrey1">{description}</p>
                    {warningText && <p className="mt-2 text-sm text-customTextDarkRed">{warningText}</p>}
                </div>
                <Switch
                    checked={enabled}
                    onChange={onChange}
                    className={`${
                        enabled ? "bg-customDropdownBorder" : "bg-gray-200"
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2`}
                >
                    <span
                        className={`${
                            enabled ? "translate-x-5" : "translate-x-0"
                        } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                </Switch>
            </div>
            {subTitle === "QRCode" && (
                <QRCodeSection
                    clientId={clientId}
                    clientName={clientName}
                />
            )}
        </div>
    );
};

export default SettingToggle;

SettingToggle.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    warningText: PropTypes.string,
    enabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    clientId: PropTypes.string.isRequired,
    clientName: PropTypes.string.isRequired,
};
