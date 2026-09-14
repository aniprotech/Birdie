import { Info, MessagesSquare, ClipboardList, UserPlus, Settings, Users, Clock, Calendar, ShieldCheck, SquareUser, FileBadge2 } from "lucide-react";

import { getGroupBadge, getStatusBadge } from "../utils/common";
import { values } from "lodash";

export const teamColumns = [
    {
        header: "",
        accessor: "avatar",
        render: (_, row) => {
            const initials = `${row.firstName?.[0] ?? ""}${row.lastName?.[0] ?? ""}`;
            return (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">{initials}</div>
            );
        },
    },
    {
        header: "First name",
        accessor: "firstName",
    },
    {
        header: "Last name",
        accessor: "lastName",
    },
    {
        header: "Status",
        accessor: "isActive",
        render: (val) => getStatusBadge(val, "teams"),
    },
    {
        header: "Role",
        accessor: "role",
        render: (val) => val?.charAt(0)?.toUpperCase() + val?.slice(1)?.toLowerCase(),
        // render: (val) => (typeof val === "string" && val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : "-"),
    },

    {
        header: "Phone number",
        accessor: "primaryPhone",
    },
    // {
    //     header: "Group",
    //     accessor: "group",
    //     render: (val) => getGroupBadge(val),
    // },
];
export const teamData = [
    { id: "1a2b3c4d-0001", firstName: "David", lastName: "Tuson", status: "active", role: "Manager", phone: "+1 555-123-4567", group: "Ungrouped" },
    {
        id: "1a2b3c4d-0002",
        firstName: "Rosemarie",
        lastName: "Powell",
        status: "active",
        role: "Supervisor",
        phone: "+1 555-987-6543",
        group: "Grouped",
    },
    {
        id: "1a2b3c4d-0003",
        firstName: "Theresa",
        lastName: "Belfield",
        status: "active",
        role: "Coordinator",
        phone: "+1 555-111-2222",
        group: "Ungrouped",
    },
    { id: "1a2b3c4d-0004", firstName: "David", lastName: "Tuson", status: "active", role: "Manager", phone: "+1 555-123-4567", group: "Ungrouped" },
    {
        id: "1a2b3c4d-0005",
        firstName: "Rosemarie",
        lastName: "Powell",
        status: "active",
        role: "Supervisor",
        phone: "+1 555-987-6543",
        group: "Mixed",
    },
    {
        id: "1a2b3c4d-0006",
        firstName: "Theresa",
        lastName: "Belfield",
        status: "active",
        role: "Coordinator",
        phone: "+1 555-111-2222",
        group: "Grouped",
    },
    { id: "1a2b3c4d-0007", firstName: "David", lastName: "Tuson", status: "active", role: "Manager", phone: "+1 555-123-4567", group: "Ungrouped" },
    {
        id: "1a2b3c4d-0008",
        firstName: "Rosemarie",
        lastName: "Powell",
        status: "inactive",
        role: "Supervisor",
        phone: "+1 555-987-6543",
        group: "Ungrouped",
    },
    {
        id: "1a2b3c4d-0009",
        firstName: "Theresa",
        lastName: "Belfield",
        status: "inactive",
        role: "Coordinator",
        phone: "+1 555-111-2222",
        group: "Grouped",
    },
    {
        id: "1a2b3c4d-00010",
        firstName: "David",
        lastName: "Tuson",
        status: "inactive",
        role: "Manager",
        phone: "+1 555-123-4567",
        group: "Ungrouped",
    },
    {
        id: "1a2b3c4d-00011",
        firstName: "Theresa",
        lastName: "Belfield",
        status: "inactive",
        role: "Coordinator",
        phone: "+1 555-111-2222",
        group: "Mixed",
    },
];

export const teamsInitialValues = (data = {}) => ({
    firstName: data?.firstName || "",
    lastName: data?.lastName || "",
    primaryPhone: data?.primaryPhone ? Number(data.primaryPhone) : null,
    email: data?.email || "",
    primaryPhoneCode: data?.primaryPhoneCode || "+91",
    isActive: data?.isActive ?? true,
    role: data?.role || "",
    groups: data?.groups || [],
});

export const teamsSidebarItems = [
    {
        icon: (
            <SquareUser
                strokeWidth={2}
                size={18}
            />
        ),
        text: "Basic Info",
        to: "/admin/teams/:id/teams-info",
        active: true,
    },
    {
        icon: <MessagesSquare size={18} />,
        text: "Carer Feed",
        to: "/admin/teams/:id/carer-feed",
    },
    {
        icon: <ClipboardList size={18} />,
        text: "Operations",
        to: "/admin/teams/:id/operations",
    },
    {
        icon: <Calendar size={18} />,
        text: "Time off",
        to: "/admin/teams/:id/time-off",
    },
    {
        icon: <UserPlus size={18} />,
        text: "Onboarding",
        to: "/admin/teams/:id/onboarding",
    },
    {
        icon: <FileBadge2 size={18} />,
        text: "Skills",
        to: "/admin/teams/:id/skills",
    },
    {
        icon: <Users size={18} />,
        text: "Clients",
        to: "/admin/teams/:id/clients",
    },
    {
        icon: <Clock size={18} />,
        text: "Availability",
        to: "/admin/teams/:id/availability",
    },
    {
        icon: <Calendar size={18} />,
        text: "Calendar",
        to: "/admin/teams/:id/calendar",
    },
    {
        icon: <ShieldCheck size={18} />,
        text: "Admin",
        to: "/admin/teams/:id/admin",
    },
];

export const teamsInfoConfigs = [
    {
        id: "profile",
        componentTitle: "Basic Profile",
        fields: [
            { label: "First name", key: "firstName" },
            { label: "Last name", key: "lastName" },
            { label: "Mobile number", key: "primaryPhone" },
            { label: "Email Address", key: "email" },
        ],
    },
    {
        id: "additional-details",
        componentTitle: "Additional Details",
        fields: [
            { label: "Date of birth", key: "dateOfBirth", isDate: true },
            { label: "Additional phone number", key: "secondaryPhone" },
            { label: "Highlights", key: "highlights" },
        ],
    },
    {
        id: "personal-identity",
        componentTitle: "Personal Identity",
        fields: [
            { label: "Title", key: "title" },
            { label: "Preferred name", key: "preferredName" },
            { label: "Prefers to be referred to as", key: "referredAs" },
            { label: "Gender", key: "gender" },
        ],
    },
];

export const teamsAgencyAdminConfig = [
    {
        id: "roles-and-status",
        componentTitle: "Roles & Status",
        fields: [
            { label: "Status", key: "isActive" },
            { label: "Admin", key: "role" },
        ],
    },
    {
        id: "groups",
        componentTitle: "Groups",
        fields: [{ label: "Groups", key: "groups" }],
    },
    {
        id: "communication",
        componentTitle: "Communication",
        fields: [{ label: "Preferred method of contact", key: "methodOfContact" }],
    },
    {
        id: "termination",
        componentTitle: "Termination",
        fields: [
            { label: "Last Working Day", key: "lastWorkingDay" },
            { label: "Type", key: "type" },
            { label: "Note", key: "note" },
        ],
    },
];

export const onBoardingRoleOptions = [
    { label: "Select role", value: "" },
    { label: "Junior carer", value: "JUNIOR_CARER" },
    { label: "Carer", value: "CARER" },
    { label: "Senior Carer", value: "SENIOR_CARER" },
    { label: "Team Lead", value: "TEAM_LEAD" },
    { label: "Branch Manager", value: "BRANCH_MANAGER" },
    { label: "Office Staff", value: "OFFICE_STAFF" },
];

export const onBoardingDocumentCategoryOptions = [
    { label: "Select Category", value: "" },
    { label: "Spot Check", value: "SPOT_CHECK" },
    { label: "Probation Review", value: "PROBATION_REVIEW" },
    { label: "Appraisal", value: "APPRAISAL" },
    { label: "Supervision", value: "SUPERVISION" },
    { label: "Disciplinary Action", value: "DISCIPLINARY_ACTION" },
    { label: "MOT", value: "MOT" },
    { label: "Car insurance", value: "CAR_INSURANCE" },
    { label: "Other", value: "OTHER" },
];

export const onBoardingContractTypeOptions = [
    { label: "Select Contract", value: "" },
    { label: "Zero Hours", value: "ZERO_HOURS" },
    { label: "Guaranteed Hours", value: "GUARANTEED_HOURS" },
    { label: "Self Employed", value: "SELF_EMPLOYED" },
    { label: "Salaried", value: "SALARIED" },
];

export const onBoardingVaccinationStatus = [
    { label: "Select Vaccination Status", value: "" },
    { label: "Partial Course", value: "PARTIAL_COURSE" },
    { label: "Full Course", value: "FULL_COURSE" },
    { label: "Full Course with Booster Dose", value: "FULL_COURSE_WITH_BOOSTER_DOSE" },
    { label: "Full Course with Two Booster Dose", value: "FULL_COURSE_WITH_TWO_BOOSTER_DOSE" },
    { label: "Not Vaccinated", value: "NOT_VACCINATED" },
    { label: "Unknown", value: "UNKNOWN" },
];

export const skillOptions = [
    { label: "Select skills", value: "" },
    { label: "Moving and Handling", value: "MOVING_AND_HANDLING" },
    { label: "First Aid", value: "FIRST_AID" },
    { label: "Communication", value: "COMMUNICATION" },
    { label: "Dignity", value: "DIGNITY" },
    { label: "Equality and Diversity", value: "EQUALITY_AND_DIVERSITY" },
    { label: "Fire safety", value: "FIRE_SAFETY" },
    { label: "Food hygiene", value: "FOOD_HYGIENE" },
    { label: "Health and Safety Awareness", value: "HEALTH_AND_SAFETY_AWARENESS" },
    { label: "Infection Prevention and Control", value: "INFECTION_PREVENTION_AND_CONTROL" },
    { label: "Medication management", value: "MEDICATION_MANAGEMENT" },
    { label: "Mental Capacity and Liberty Safeguards", value: "MENTAL_CAPACITY_AND_LIBERTY_SAFEGUARDS" },
    { label: "Moving and Handling Objects", value: "MOVING_AND_HANDLING_OBJECTS" },
    { label: "Nutrition and Hydration", value: "NUTRITION_AND_HYDRATION" },
    { label: "Oral Health", value: "ORAL_HEALTH" },
    { label: "Person Centered Care", value: "PERSON_CENTERED_CARE" },
    { label: "Positive Behaviour Support and Non Restrictive Practice", value: "POSITIVE_BEHAVIOUR_SUPPORT_AND_NON_RESTRICTIVE_PRACTICE" },
    { label: "Recording and Reporting", value: "RECORDING_AND_REPORTING" },
];
