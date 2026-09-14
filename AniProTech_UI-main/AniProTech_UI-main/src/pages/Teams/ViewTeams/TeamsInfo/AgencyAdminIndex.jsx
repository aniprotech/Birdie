import React, { useState } from "react";
import SwitchComponents from "../../../../components/SwitchComponent/SwitchComponent";
import TeamsProfileSection from "./TeamsProfileIndex";
import { teamsAgencyAdminConfig } from "../../../../data/teams";
import EditRolesAndStatus from "./EditAgencyAdmin/EditRolesAndStatus";
import EditGroups from "./EditAgencyAdmin/EditGroups";
import EditCommunication from "./EditAgencyAdmin/EditCommunication";
import EditTermination from "./EditAgencyAdmin/EditTermination";
import useScrollToTop from "../../../../hooks/useScrollToTop";

const AgencyAdminIndex = ({data,setData}) => {
    const [activeComponent, setActiveComponent] = useState("TeamsAgencyDetails");
    const [mode, setMode] = useState("");

    useScrollToTop();


    return (
        <div className="pb-10">
            <div>
                {/* Switch Component */}
                <SwitchComponents active={activeComponent}>
                    <div name="TeamsAgencyDetails">
                        {teamsAgencyAdminConfig.map((section) => (
                            <TeamsProfileSection
                                key={section.id}
                                sectionId={section.id}
                                componentTitle={section.componentTitle}
                                fields={section.fields}
                                data={data}
                                setData={setData}
                                mode={mode}
                                setMode={setMode}
                                activeComponent={activeComponent}
                                setActiveComponent={setActiveComponent}
                                pageName="TeamsAgencyDetails"
                            />
                        ))}
                    </div>
                    <div name="EditRolesAndStatus">
                        <EditRolesAndStatus
                            data={data}
                            setData={setData}
                            mode={mode}
                            setMode={setMode}
                            setActiveComponent={setActiveComponent}
                        />
                    </div>
                    <div name="EditGroups">
                        <EditGroups
                            data={data}
                            setData={setData}
                            mode={mode}
                            setMode={setMode}
                            setActiveComponent={setActiveComponent}
                        />
                    </div>
                    <div name="EditCommunication">
                        <EditCommunication
                            data={data}
                            setData={setData}
                            mode={mode}
                            setMode={setMode}
                            setActiveComponent={setActiveComponent}
                        />
                    </div>
                    <div name="EditTermination">
                        <EditTermination
                            data={data}
                            setData={setData}
                            mode={mode}
                            setMode={setMode}
                            setActiveComponent={setActiveComponent}
                        />
                    </div>
                </SwitchComponents>
            </div>
        </div>
    );
};

export default AgencyAdminIndex;
