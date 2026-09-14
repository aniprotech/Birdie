import Activities from "../../pages/Clients/ViewClients/Visit/DialogComponents/Activities";
import Alerts from "../../pages/Clients/ViewClients/Visit/DialogComponents/Alerts";
import CareTeam from "../../pages/Clients/ViewClients/Visit/DialogComponents/CareTeam";
import Details from "../../pages/Clients/ViewClients/Visit/DialogComponents/Details";
import Observations from "../../pages/Clients/ViewClients/Visit/DialogComponents/Observations";
import Timeline from "../../pages/Clients/ViewClients/Visit/DialogComponents/Timeline";

export const clientVisitData = [
    {
        id: 1,
        title: "Mon 7:30 - 8:45am",
        start: new Date(2024, 5, 9, 7, 30), // Monday
        end: new Date(2024, 5, 9, 8, 45),
        resource: {
            status: "Completed",
            provider: "K. Reddy Pallela",
            tasks: "9/9",
            medication: "0/0",
            duration: "1:15",
        },
    },
    {
        id: 2,
        title: "Tue 7:32 - 8:36am",
        start: new Date(2024, 5, 10, 7, 32), // Tuesday
        end: new Date(2024, 5, 10, 8, 36),
        resource: {
            status: "Completed",
            provider: "K. Reddy Pallela",
            tasks: "9/9",
            medication: "0/0",
            duration: "1:03",
        },
    },
    {
        id: 3,
        title: "Wed 7:30 - 8:30am",
        start: new Date(2024, 5, 11, 7, 30), // Wednesday
        end: new Date(2024, 5, 11, 8, 30),
        resource: {
            status: "Scheduled",
            provider: "K. Reddy Pallela",
            tasks: "9",
            medication: "0",
            duration: "",
        },
    },
    {
        id: 4,
        title: "Thu 7:30",
        start: new Date(2024, 5, 12, 7, 30), // Thursday
        end: new Date(2024, 5, 12, 8, 30),
        resource: {
            status: "Scheduled",
            provider: "K. Reddy Pallela",
            tasks: "9",
            medication: "0",
            duration: "",
        },
    },
];

export const renderContent = (activeTab, visit, setShowTimeline, clientName) => {
    switch (activeTab) {
        case "Details":
            return <Details visit={visit} />;
        case "Care team":
            return <CareTeam careTeam={visit?.careTeam || []} />;
        case "Activities":
            return (
                <Activities
                    visit={visit}
                    clientName={clientName}
                />
            );
        case "Observations":
            return <Observations observations={visit?.observations || []} />;
        case "Alerts":
            return <Alerts alerts={visit?.alerts || []} />;
        case "Timeline":
            return (
                <Timeline
                    events={[
                        {
                            title: "Visit schedule created",
                            author: "Bhaskar Reddy",
                            time: "6 Jun 2025, 06:45",
                        },
                        {
                            title: "Visit started",
                            author: "Anita Devi",
                            time: "6 Jun 2025, 07:00",
                        },
                        {
                            title: "Visit started",
                            author: "Anita Devi",
                            time: "6 Jun 2025, 07:00",
                        },
                        {
                            title: "Visit started",
                            author: "Anita Devi",
                            time: "6 Jun 2025, 07:00",
                        },
                    ]}
                />
            );
        default:
            return <div className="p-5 text-gray-500">Coming soon</div>;
    }
};

export const customStyles = {
    table: {
        style: {
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
        },
    },
    headRow: {
        style: {
            backgroundColor: "#E0E5EB",
            color: "#1a1a1a",
            fontSize: "13px",
            fontWeight: 500,
            minHeight: "44px",
            borderBottom: "1px solid #e5e7eb",
            // margin: '10px 0px',
        },
    },
    headCells: {
        style: {
            paddingLeft: "16px",
            paddingRight: "16px",
            paddingTop: "12px",
            paddingBottom: "12px",
        },
        sortIcon: {
            style: {
                opacity: "0.5",
                marginLeft: "8px",
            },
        },
    },
    cells: {
        style: {
            paddingLeft: "16px",
            paddingRight: "16px",
        },
    },
    rows: {
        style: {
            backgroundColor: "white",
            minHeight: "50px",
            "&:not(:last-of-type)": {
                borderBottom: "1px solid #f0f0f0",
            },
            "&:hover": {
                backgroundColor: "#f9fafb",
            },
        },
    },
};

export const CARER_OPTIONS = [
    { label: 'John Doe', value: 'john' },
    { label: 'Jane Smith', value: 'jane' },
  ];

export const TYPE_OPTIONS = [
    { label: 'Introduction', value: 'INTRODUCTION' },
    { label: 'Shadowing', value: 'SHADOWING' },
    { label: 'Supervision', value: 'SUPERVISION' },
  ];

export const PAY_RATE_OPTIONS = [{ label: 'Default pay rate card', value: 'DEFAULT_PAY_RATE_CARD' }];
export const CHARGE_RATE_OPTIONS = [{ label: 'Default charge rate card', value: 'DEFAULT_CHARGE_RATE_CARD' }];
