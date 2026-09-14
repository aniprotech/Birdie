import ActionsNotifications from "../../pages/Teams/ViewTeams/CarerFeed/FeedNotifications/ActionsNotifications";
import AlertNotifications from "../../pages/Teams/ViewTeams/CarerFeed/FeedNotifications/AlertNotifications";
import AllFeedNotification from "../../pages/Teams/ViewTeams/CarerFeed/FeedNotifications/AllFeedNotification";
import NotesNotifications from "../../pages/Teams/ViewTeams/CarerFeed/FeedNotifications/NotesNotifications";
import VisitNotifications from "../../pages/Teams/ViewTeams/CarerFeed/FeedNotifications/VisitNotifications";
import { Bell, Flag, NotebookPen } from "lucide-react";
import NotesTypeFeed from "../../pages/Teams/ViewTeams/CarerFeed/NewFeedTabs/NotesTypeFeed";
import ConcernType from "../../pages/Teams/ViewTeams/CarerFeed/NewFeedTabs/ConcernType";

export const renderActiveNotification = (activeNotification, props) => {
    switch (activeNotification) {
        case "Alerts":
            return <AlertNotifications {...props} />;
        case "Visits":
            return <VisitNotifications {...props} />;
        case "Notes":
            return <NotesNotifications {...props} />;
        case "Actions":
            return <ActionsNotifications {...props} />;
        case "All":
        default:
            return <AllFeedNotification {...props} />;
    }
};

export const filterItems = [
    { label: "All", count: 0 },
    { label: "Alerts", count: 0 },
    { label: "Visits", count: 0 },
    { label: "Notes", count: 0 },
    { label: "Actions", count: 0 },
];

export const noteOptions = [
    {
        label: "Concern",
        icon: <Bell className="h-4 w-4 text-gray-600" />,
        to: "notes/concern",
    },
    {
        label: "Action",
        // component: () => <div>Action Component</div>,
        icon: <Flag className="h-4 w-4 text-gray-600" />,
        to: "notes/action",
    },
    ...["Complaint", "Compliment", "General note", "Introduction", "Check in call", "Audit"].map((label) => ({
        label,
        // component: () => (
        //     <div>
        //         <NotesTypeFeed
        //             noteLabel={label}
        //             titleDescription={label.toLowerCase()}
        //         />
        //     </div>
        // ),
        icon: <NotebookPen className="h-4 w-4 text-gray-600" />,
        to: `notes/${label.toLowerCase().replace(/\s+/g, "-")}`,
    })),
];

// data/notificationFilters.js

export const notificationFilters = [
    {
        key: "Alerts",
        sections: [
            {
                title: "All alerts",
                type: "checkbox",
                items: [{ id: "allAlerts", label: "All alerts", count: 0 }],
            },
            {
                title: "Alert status",
                type: "checkbox",
                items: [
                    { id: "actionNeeded", label: "Action needed", count: 0 },
                    { id: "inProgress", label: "In progress", count: 0 },
                    { id: "resolved", label: "Resolved", count: 0 },
                ],
            },
            {
                title: "Alert severity",
                type: "checkbox",
                items: [
                    { id: "high", label: "High", count: 0 },
                    { id: "medium", label: "Medium", count: 0 },
                    { id: "low", label: "Low", count: 0 },
                ],
            },
            {
                title: "Medication alerts",
                type: "checkbox",
                items: [
                    { id: "maybeTaken", label: "Maybe taken", count: 0 },
                    { id: "notTaken", label: "Not taken", count: 0 },
                    { id: "partiallyTaken", label: "Partially taken", count: 0 },
                    { id: "noReportReceived", label: "No report received", count: 0 },
                    { id: "additionalTaken", label: "Additional taken", count: 0 },
                ],
            },
            {
                title: "Visit alerts",
                type: "checkbox",
                items: [
                    { id: "visitNotStarted", label: "Visit not started in time", count: 0 },
                    { id: "checkinLate", label: "Care professional did not check in to visit on time", count: 0 },
                    { id: "visitPlanNotCompleted", label: "Visit plan not completed", count: 0 },
                    { id: "essentialTaskNotDone", label: "Essential task not done", count: 0 },
                    { id: "covidSymptoms", label: "Covid-19 symptoms reported", count: 0 },
                    { id: "covidAssessment", label: "NHS Covid-19 assessment completed", count: 0 },
                    { id: "news2Score", label: "NEWS2 score recorded", count: 0 },
                    { id: "forcedCheckIn", label: "Forced check in", count: 0 },
                    { id: "forcedCheckOut", label: "Forced check out", count: 0 },
                ],
            },
            {
                title: "Concern",
                type: "checkbox",
                items: [
                    { id: "accident", label: "Accident", count: 0 },
                    { id: "incident", label: "Incident", count: 0 },
                    { id: "skinIntegrity", label: "Skin integrity", count: 0 },
                    { id: "medicationConcern", label: "Medication", count: 0 },
                    { id: "other", label: "Other", count: 0 },
                ],
            },
        ],
    },
    {
        key: "Visits",
        sections: [
            {
                title: "All visits",
                type: "checkbox",
                items: [{ id: "allVisits", label: "All visits", count: 0 }],
            },
            {
                title: "Visit status",
                type: "checkbox",
                items: [
                    { id: "inProgressVisit", label: "In progress", count: 0 },
                    { id: "completedVisit", label: "Completed", count: 0 },
                    { id: "cancelledVisit", label: "Cancelled", count: 0 },
                ],
            },
        ],
    },
    {
        key: "Notes",
        sections: [
            {
                title: "All notes",
                type: "checkbox",
                items: [{ id: "allNotes", label: "All notes", count: 0 }],
            },
            {
                title: "Note type",
                type: "checkbox",
                items: [
                    { id: "complaint", label: "Complaint", count: 0 },
                    { id: "compliment", label: "Compliment", count: 0 },
                    { id: "general", label: "General", count: 0 },
                    { id: "introduction", label: "Introduction", count: 0 },
                    { id: "checkInCall", label: "Check in call", count: 0 },
                    { id: "audit", label: "Audit", count: 0 },
                    { id: "referral", label: "Referral", count: 0 },
                ],
            },
        ],
    },
    {
        key: "Actions",
        sections: [
            {
                title: "All actions",
                type: "checkbox",
                items: [{ id: "allActions", label: "All actions", count: 0 }],
            },
            {
                title: "Assignee",
                type: "select",
                placeholder: "action assignee",
                // you can fill this in at runtime:
                options: [{ value: "user1", label: "User One" }],
            },
            {
                title: "Due date",
                type: "dateRange",
                placeholder: "Choose a date range",
            },
            {
                title: "Action status",
                type: "checkbox",
                items: [
                    { id: "toDo", label: "To do", count: 0 },
                    { id: "inProg", label: "In progress", count: 0 },
                    { id: "completed", label: "Completed", count: 0 },
                    { id: "archived", label: "Archived", count: 0 },
                ],
            },
        ],
    },
];
