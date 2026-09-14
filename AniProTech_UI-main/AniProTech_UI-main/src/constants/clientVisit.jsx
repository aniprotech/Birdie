export const cancelledByOptions = [
    { label: 'Client', value: 'CLIENT' },
    { label: 'Care Manager', value: 'CARE_MANAGER' },
    // { label: 'Admin', value: 'ADMIN' }
];

export const reasonOptions = [
    { label: 'Select a reason', value: '' },
    { label: 'Family', value: 'FAMILY' },
    { label: 'Refused', value: 'REFUSED' },
    { label: 'RAG', value: 'RAG' },
    { label: 'Not required', value: 'NOT_REQUIRED' },
    { label: 'Other', value: 'OTHER' }
];

export const fundingOptions = [
    { label: 'Select funding', value: '' },
    { label: 'Private', value: 'PRIVATE' },
    { label: 'Insurance', value: 'INSURANCE' },
    { label: 'Government', value: 'GOVERNMENT' }
];

export const rateOptions = [
    { label: 'Select rate', value: '' },
    { label: '$30/hour', value: '30' },
    { label: '$35/hour', value: '35' },
    { label: '$40/hour', value: '40' },
    { label: '$45/hour', value: '45' }
];

export const moreOptions = [
    { label: "View history", value: "history" },
    { label: "Cancel visit", value: "cancel" },
    { label: "Set funding information", value: "funding" },
    { label: "Override rate cards", value: "rate" },
];

export const carerOptions = [
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
];

export const getModalContent = (modalType) => {
    switch (modalType) {
        case "cancel":
            return {
                title: "Cancel Visit",
                description:
                    "Cancelling this visit will remove it from the carer app. Tasks and medications need to be removed if you want to re-assign them to another visit.",
                confirmText: "Yes, Cancel Visit",
            };
        case "funding":
            return {
                title: "Set Funding Information",
                description:
                    "Please select the contract and the service type for this visit schedule. This will be applied to this and all following visits that are part of the schedule.",
                confirmText: "Save Changes",
            };
        case "rate":
            return {
                title: "Override Rate Cards",
                description:
                    "Please select the pay and/or charge rate cards to use for this visit schedule. This will be applied to this and all following visits that are part of the schedule.",
                confirmText: "Apply Changes",
            };
        default:
            return {
                title: "View History",
                description: "View the history of changes for this visit.",
                confirmText: "Close",
            };
    }
};

