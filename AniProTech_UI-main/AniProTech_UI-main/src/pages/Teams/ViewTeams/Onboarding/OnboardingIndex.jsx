import { useEffect, useState } from "react";
import useScrollToTop from "../../../../hooks/useScrollToTop";
import { useNavigationHelpers } from "../../../../hooks/useNavigationHelpers";
import { fetchData } from "../../../../utils/FetchData";
import { _get } from "../../../../utils/ApiService";
import APIConfig from "../../../../utils/ApiConfig";
import DotLoader from "../../../../components/Loader/DotLoader";
import { FileClock, Pencil } from "lucide-react";
import Section from "../../../../components/Section/Section";
import ArraySection from "../../../../components/Section/ArraySection";
import { isNotEmpty } from "../../../../utils/common";

const OnboardingIndex = () => {
    const { navigate, id } = useNavigationHelpers();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData(() => _get(APIConfig.TEAMS.TEAM_ONBOARDING_GET_BY_ID(id)), setData, setLoading, null);
    }, [id]);

    useScrollToTop();

    const handleEditClick = () => {
        navigate(`/admin/teams/${id}/onboarding/edit`, {
            state: { data },
        });
    };

    if (loading) {
        return (
            <div className="z-50 flex min-h-screen items-center justify-center">
                <DotLoader loading={loading} />
            </div>
        );
    }

    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="common-container">
                <div className="flex flex-col items-center justify-center space-y-4 rounded-md border border-customBorder bg-white px-5 py-10 lg:px-20 xl:px-44">
                    <FileClock className="h-6 w-6 text-customNavy" />
                    <div className="text-center text-lg text-customTextGrey1">Add onboarding information</div>
                    <button
                        className="rounded border border-customNavy px-4 py-2 text-sm font-semibold text-customTextGrey"
                        onClick={handleEditClick}
                    >
                        Add info
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="md:px-20 md:py-10 lg:py-14 xl:px-40">
            <div>
                <Section
                    title="Employment"
                    rows={[
                        { label: "Start date", value: data?.started },
                        { label: "National Insurance No.", value: data?.niNumber },
                        { label: "Social Worker No.", value: data?.socialWorkerNumber },
                        { label: "Employee No.", value: data?.employeeNumber },
                        { label: "Role", value: data?.role, isEnum: true },
                        { label: "Contract type", value: data?.contractType, isEnum: true },
                        { label: "Weekly contracted hours", value: data?.weeklyContractedHours },
                        { label: "Employment contract", value: data?.contractFilePath, isFile: true },
                        { label: "COVID Vaccination Status", value: data?.covidVaccinationStatus, isEnum: true },
                    ]}
                    data={data}
                />
            </div>
            <div className="py-5 md:py-10">
                <Section
                    title="Right to Work"
                    rows={[
                        { label: "ID File", value: data?.idFilePath, isFile: true },
                        { label: "Driving Licence", value: data?.drivingLicenceFilePath, isFile: true },
                        { label: "Bank Statement", value: data?.bankStatementFilePath, isFile: true },
                        { label: "Utility Bill", value: data?.utilityBillFilePath, isFile: true },
                        { label: "References File", value: data?.referencesFilePath, isFile: true },
                        { label: "DBS Record", value: data?.dbsRecordFilePath, isFile: true },
                    ]}
                    data={data}
                />
            </div>

            {isNotEmpty(data?.teamOnboardingAdditionalDocuments) ? (
                <ArraySection
                    title="Additional Documents"
                    data={data}
                    stateData={data?.teamOnboardingAdditionalDocuments || []}
                />
            ) : (
                <></>
            )}
        </div>
    );
};

export default OnboardingIndex;
