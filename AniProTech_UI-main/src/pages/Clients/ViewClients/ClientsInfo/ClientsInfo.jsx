import ClientIdentifiers from "./ClientIdentifiers";
import { useEffect, useState } from "react";
import clsx from "clsx";
import useScrollToTop from "../../../../hooks/useScrollToTop";
import DotLoader from "../../../../components/Loader/DotLoader";
import SwitchComponents from "../../../../components/SwitchComponent/SwitchComponent";
import { clientsInfoConfigs } from "../../../../data/clients/clientInfoData";
import ClientsInfoSection from "./ClientsInfoSection";
import { 
    clinicalDetailsConfig, 
    futurePlanningConfig, 
    keyContactsConfig, 
    agencyAdminConfig 
} from "../../../../data/clients/clinicalDetailsConfig";
import { fetchData } from "../../../../utils/FetchData";
import { _get } from "../../../../utils/ApiService";
import APIConfig from "../../../../utils/ApiConfig";
import { useParams } from "react-router-dom";
import { useGlobalStore } from "../../../../stores/useGlobalStore";

const TABS = [
    { label: "Personal Identity", value: "ClientsInfoSection" },
    { label: "Clinical Details", value: "EditClinicalDetails" },
    { label: "Key Contacts", value: "EditClientKeyContact" },
    { label: "Future Planning", value: "EditFuturePlanning" },
    { label: "Agency Admin", value: "EditClientAgencyAdmin" },
];

const ClientsInfo = () => {
    const [activeComponent, setActiveComponent] = useState("ClientsInfoSection");
    const [mode, setMode] = useState("");
    const [data, setData] = useState({});
    const [loading,setLoading] = useState(false);
    const { id } = useParams();

    useScrollToTop();
 
    // const { setTeamsPersonalDetailData } = useGlobalStore();

    useEffect(() => {
        fetchData(() => _get(APIConfig?.CLIENTS?.CLIENT_INFO_GET_BY_ID(id)), setData, setLoading, null);
    }, [id]);

    if (loading) {
        return (
            <div className="z-50 flex min-h-screen items-center justify-center">
                <DotLoader loading={loading} />
            </div>
        );
    }

    return (
        <div className="pb-10">
            <div className="md:mx-20 xl:mx-40">
                <div className="sticky top-14 z-30 border-b bg-white md:px-3 pt-7">
                    <div className="relative border-b border-gray-300">
                        <div className="flex w-52 space-x-6 overflow-x-auto overflow-y-hidden md:w-full md:space-x-12">
                            {TABS?.map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setActiveComponent(tab.value)}
                                    className={clsx(
                                        "relative whitespace-nowrap pb-2 text-xs font-semibold text-customTextNavy md:text-sm",
                                        activeComponent === tab.value
                                            ? "after:absolute after:inset-x-0 after:-bottom-[1px] after:h-[4px] after:bg-customTextNavy"
                                            : "hover:text-customTextNavy/80",
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Switch Component */}
                <SwitchComponents active={activeComponent}>
                    <div name="ClientsInfoSection">
                        {clientsInfoConfigs?.map((section) => (
                            <ClientsInfoSection
                                key={section?.id}
                                sectionId={section?.id}
                                componentTitle={section?.componentTitle}
                                fields={section?.fields}
                                data={data}
                                setData={setData}
                                mode={mode}
                                setMode={setMode}
                                activeComponent={activeComponent}
                                setActiveComponent={setActiveComponent}
                                componentName="ClientsInfoSection"
                            />
                        ))}
                    </div>

                    <div name="EditClinicalDetails">
                        {clinicalDetailsConfig?.map((section) => (
                            <ClientsInfoSection
                                key={section?.id}
                                sectionId={section?.id}
                                componentTitle={section?.componentTitle}
                                fields={section?.fields}
                                data={data}
                                setData={setData}
                                mode={mode}
                                setMode={setMode}
                                activeComponent={activeComponent}
                                setActiveComponent={setActiveComponent}
                                componentName="EditClinicalDetails"
                            />
                        ))}
                    </div>

                    <div name="EditClientAgencyAdmin">
                        <ClientIdentifiers data={data} onSaved={setData} />
                        {agencyAdminConfig?.map((section) => (
                            <ClientsInfoSection
                                key={section?.id}
                                sectionId={section?.id}
                                componentTitle={section?.componentTitle}
                                fields={section?.fields}
                                data={data}
                                setData={setData}
                                mode={mode}
                                setMode={setMode}
                                activeComponent={activeComponent}
                                setActiveComponent={setActiveComponent}
                                componentName="EditClientAgencyAdmin"
                            />
                        ))}
                    </div>

                    <div name="EditFuturePlanning">
                        {futurePlanningConfig?.map((section) => (
                            <ClientsInfoSection
                                key={section?.id}
                                sectionId={section?.id}
                                componentTitle={section?.componentTitle}
                                fields={section?.fields}
                                data={data}
                                setData={setData}
                                mode={mode}
                                setMode={setMode}
                                activeComponent={activeComponent}
                                setActiveComponent={setActiveComponent}
                                componentName="EditFuturePlanning"
                            />
                        ))}
                    </div>

                    <div name="EditClientKeyContact">
                        {keyContactsConfig?.map((section) => (
                            <ClientsInfoSection
                                key={section?.id}
                                sectionId={section?.id}
                                componentTitle={section?.componentTitle}
                                fields={section?.fields}
                                data={data}
                                setData={setData}
                                mode={mode}
                                setMode={setMode}
                                activeComponent={activeComponent}
                                setActiveComponent={setActiveComponent}
                                componentName="EditClientKeyContact"
                            />
                        ))}
                    </div>
                </SwitchComponents>
            </div>
        </div>
    );
};

export default ClientsInfo;
