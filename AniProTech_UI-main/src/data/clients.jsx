import { getRiskBadge, getStatusBadge } from "../utils/common";

export const clientColumns = [
    {
        header: "",
        accessor: "initials",
        render: (_, row) => {
            const initials = `${row?.firstName?.[0] ?? ""}${row?.lastName?.[0] ?? ""}`.toUpperCase();
            return (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">{initials}</div>
            );
        },
    },
    {
        header: "First name",
        accessor: "firstName",
        render: (val) => val || "-"
    },
    {
        header: "Last name",
        accessor: "lastName",
        render: (val) => val || "-"
    },
    {
        header: "Status",
        accessor: "isActive",
        render: (_, row) => getStatusBadge(row?.isActive, row),
    },
    {
        header: "Risk level",
        accessor: "risk",
        render: (_, row) => getRiskBadge(row?.overallRiskLevel, row),
    },
    // {
    //     header: "Group",
    //     accessor: "group",
    //     render: (val) => getGroupBadge(val),
    // },
];

export const clientData = [
    { id: "1a2b3c4d-0001", firstName: "David", lastName: "Tuson", status: "active", risk: "G", group: "Ungrouped" },
    { id: "1a2b3c4d-0002", firstName: "Rosemarie", lastName: "Powell", status: "active", risk: "A", group: "Grouped" },
    { id: "1a2b3c4d-0003", firstName: "Theresa", lastName: "Belfield", status: "active", risk: "A", group: "Ungrouped" },
    { id: "1a2b3c4d-0004", firstName: "David", lastName: "Tuson", status: "active", risk: "G", group: "Ungrouped" },
    { id: "1a2b3c4d-0005", firstName: "Rosemarie", lastName: "Powell", status: "active", risk: "A", group: "Mixed" },
    { id: "1a2b3c4d-0006", firstName: "Theresa", lastName: "Belfield", status: "active", risk: "A", group: "Grouped" },
    { id: "1a2b3c4d-0007", firstName: "David", lastName: "Tuson", status: "active", risk: "G", group: "Ungrouped" },
    { id: "1a2b3c4d-0008", firstName: "Rosemarie", lastName: "Powell", status: "inactive", risk: "A", group: "Ungrouped" },
    { id: "1a2b3c4d-0009", firstName: "Theresa", lastName: "Belfield", status: "inactive", risk: "A", group: "Grouped" },
    { id: "1a2b3c4d-0010", firstName: "David", lastName: "Tuson", status: "inactive", risk: "G", group: "Ungrouped" },
    { id: "1a2b3c4d-0011", firstName: "Rosemarie", lastName: "Powell", status: "temp_inactive", risk: "A", group: "Mixed" },
    { id: "1a2b3c4d-0012", firstName: "Theresa", lastName: "Belfield", status: "temp_inactive", risk: "A", group: "Ungrouped" },
    { id: "1a2b3c4d-0013", firstName: "David", lastName: "Tuson", status: "temp_inactive", risk: "G", group: "Ungrouped" },
    { id: "1a2b3c4d-0014", firstName: "Rosemarie", lastName: "Powell", status: "temp_inactive", risk: "A", group: "Ungrouped" },
    { id: "1a2b3c4d-0015", firstName: "Theresa", lastName: "Belfield", status: "inactive", risk: "A", group: "Mixed" },
];

export const clientsInitialValues = (data = {}) => ({
    id: data?.id || null,  // UUID for updates
    profileImage: data?.profileImage || null, // File object for upload
    title: data?.title || "",
    firstName: data?.firstName || "",
    lastName: data?.lastName || "",
    preferredName: data?.preferredName || "",
    referredAs: data?.referredAs || "", // This replaces pronoun in your structure
    dateOfBirth: data?.dateOfBirth || "",
    email: data?.email || "",
    highlights: data?.highlights || "",
    
    // Primary Phone Details
    primaryPhone: data?.primaryPhone || "",
    primaryPhoneCode: data?.primaryPhoneCode || "+44", // This replaces primaryCountry
    primaryPhoneType: data?.primaryPhoneType || "",
    
    // Secondary Phone Details (optional)
    secondaryPhone: data?.secondaryPhone || "", // This replaces additionalPhone
    secondaryPhoneCode: data?.secondaryPhoneCode || "+44", // This replaces additionalCountry
    secondaryPhoneType: data?.secondaryPhoneType || "", // This replaces additionalPhoneType
    
    role: data?.role || "CLIENT", // New required field from API
    
    // Addresses structure
    addresses: data?.addresses || [
        {
            type: "", 
            street: "", 
            city: "",
            state: "", 
            country: "",
            postalCode: "", 
            searchAddress: "",
            addressLine1: "",
            addressLine2: "",
            county: "",
            accessDetails: "",
            accessType: "",
        }
    ],
    
    // For tracking files to be removed
    filesToRemove: data?.filesToRemove || "",
});

export const baseInfoConfigs = [
    {
        id: "details",
        componentTitle: "Personal Details",
        fields: [
            { label: "Profile Picture", key: "profileImagePath" },
            { label: "Title", key: "title" },
            { label: "First name", key: "firstName" },
            { label: "Last name", key: "lastName" },
            // { label: "Preferred name", key: "preferredName" },
            { label: "Pronouns", key: "referredAs" },
            { label: "Date of birth", key: "dateOfBirth", isDate: true },
        ],
    },
    {
        id: "contact",
        componentTitle: "Contact Details",
        fields: [
            { label: "Email Address", key: "email" },
            { label: "Primary phone number", key: "primaryPhone" },
            { label: "Primary phone number type", key: "primaryPhoneType" },
            { label: "Additional phone number", key: "secondaryPhone" },
            { label: "Additional phone number type", key: "secondaryPhoneType" },
        ],
    },
    {
        id: "address",
        componentTitle: "Primary Address",
        fields: [
            { label: "Address", key: "address.fullAddress" },
            { label: "Access Details", key: "address.accessDetails" },
            { label: "Secure Check in", key: "address.secureCheckin" },
            { label: "Map", key: "address.map" },
        ],
    },
    {
        id: "highlights",
        componentTitle: "Highlight Details",
        fields: [
            { label: "Highlights", key: "highlights" },
            // { label: "Risk level", key: "risk" },
            // { label: "Group", key: "group" },
        ],
    },
];

export const testClientData = [
    {
      id: "1a2b3c4d-0001",
      status: "active",
      image_url: "https://via.placeholder.com/150",
      title: "Mr",
      firstName: "John",
      middleName: "Andrew",
      lastName: "Doe",
      pronouns: "He/Him",
      dateOfBirth: "1985-04-15",
  
      email: "john.doe@example.com",
      primaryPhone: "+1 123-456-7890",
      primaryPhoneType: "Mobile",
      additionalPhone: "+1 987-654-3210",
      additionalPhoneType: "Home",
  
      address1: "123 Main St, Springfield",
      access_details: "Gate code 1234",
      secure_check_in: "Yes",
      map: "https://maps.example.com/location123",
  
      highlights: "Very sociable and enjoys group activities",
    },
];
  
