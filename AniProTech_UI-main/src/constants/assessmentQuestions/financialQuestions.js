export const FINANCIAL_QUESTIONS = [
    // Collection Section
    {
        id: "pension_collection",
        title: "Does {{firstname}} need assistance with the collection of their pension?",
        section: "Collection",
        section_id: "collection",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "pension_collection_frequency",
        title: "How often?",
        section: "Collection",
        section_id: "collection",
        show_details: false,
        dependencies: {
            pension_collection: true
        },
        answer_type: {
            choices: [
                {
                    choice_id: "daily",
                    label: "Daily"
                },
                {
                    choice_id: "weekly",
                    label: "Weekly"
                },
                {
                    choice_id: "monthly",
                    label: "Monthly"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "pension_collection_support_provider",
        title: "Who provides support for collecting their pension?",
        section: "Collection",
        section_id: "collection",
        show_details: false,
        dependencies: {
            pension_collection: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "pension_collection_support_type",
        title: "What support is needed?",
        section: "Collection",
        section_id: "collection",
        show_details: false,
        dependencies: {
            pension_collection: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "money_collection",
        title: "Does {{firstname}} need assistance with the collection of their money?",
        section: "Collection",
        section_id: "collection",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "money_collection_frequency",
        title: "How often?",
        section: "Collection",
        section_id: "collection",
        show_details: false,
        dependencies: {
            money_collection: true
        },
        answer_type: {
            choices: [
                {
                    choice_id: "daily",
                    label: "Daily"
                },
                {
                    choice_id: "weekly",
                    label: "Weekly"
                },
                {
                    choice_id: "monthly",
                    label: "Monthly"
                },
                {
                    choice_id: "as_occurring",
                    label: "As occurring"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "money_collection_support_provider",
        title: "Who provides support for collecting their money?",
        section: "Collection",
        section_id: "collection",
        show_details: false,
        dependencies: {
            money_collection: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "money_collection_support_type",
        title: "What support is needed?",
        section: "Collection",
        section_id: "collection",
        show_details: false,
        dependencies: {
            money_collection: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "allowance_collection",
        title: "Does {{firstname}} need assistance with the collection of their allowance?",
        section: "Collection",
        section_id: "collection",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "allowance_collection_frequency",
        title: "How often?",
        section: "Collection",
        section_id: "collection",
        show_details: false,
        dependencies: {
            allowance_collection: true
        },
        answer_type: {
            choices: [
                {
                    choice_id: "weekly",
                    label: "Weekly"
                },
                {
                    choice_id: "monthly",
                    label: "Monthly"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "allowance_collection_support_provider",
        title: "Who provides support for collecting their allowance?",
        section: "Collection",
        section_id: "collection",
        show_details: false,
        dependencies: {
            allowance_collection: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "allowance_collection_support_type",
        title: "What support is needed?",
        section: "Collection",
        section_id: "collection",
        show_details: false,
        dependencies: {
            allowance_collection: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },

    // Management Section
    {
        id: "shopping_collection",
        title: "Does {{firstname}} need assistance with shopping?",
        section: "Management",
        section_id: "management",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "shopping_collection_frequency",
        title: "How often?",
        section: "Management",
        section_id: "management",
        show_details: false,
        dependencies: {
            shopping_collection: true
        },
        answer_type: {
            choices: [
                {
                    choice_id: "daily",
                    label: "Daily"
                },
                {
                    choice_id: "weekly",
                    label: "Weekly"
                },
                {
                    choice_id: "monthly",
                    label: "Monthly"
                },
                {
                    choice_id: "as_occurring",
                    label: "As occurring"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "shopping_collection_support_provider",
        title: "Who provides support for their shopping?",
        section: "Management",
        section_id: "management",
        show_details: false,
        dependencies: {
            shopping_collection: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "shopping_collection_support_type",
        title: "What support is needed?",
        section: "Management",
        section_id: "management",
        show_details: false,
        dependencies: {
            shopping_collection: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "bill_payment",
        title: "Does {{firstname}} need assistance with paying bills?",
        section: "Management",
        section_id: "management",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "bill_payment_frequency",
        title: "How often?",
        section: "Management",
        section_id: "management",
        show_details: false,
        dependencies: {
            bill_payment: true
        },
        answer_type: {
            choices: [
                {
                    choice_id: "monthly",
                    label: "Monthly"
                },
                {
                    choice_id: "quarterly",
                    label: "Quarterly"
                },
                {
                    choice_id: "annually",
                    label: "Annually"
                },
                {
                    choice_id: "as_occurring",
                    label: "As occurring"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "bill_payment_support_provider",
        title: "Who provides support for paying bills?",
        section: "Management",
        section_id: "management",
        show_details: false,
        dependencies: {
            bill_payment: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "bill_payment_support_type",
        title: "What support is needed?",
        section: "Management",
        section_id: "management",
        show_details: false,
        dependencies: {
            bill_payment: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "finance_management",
        title: "Does {{firstname}} need assistance with managing finances?",
        section: "Management",
        section_id: "management",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "finance_management_frequency",
        title: "How often?",
        section: "Management",
        section_id: "management",
        show_details: false,
        dependencies: {
            finance_management: true
        },
        answer_type: {
            choices: [
                {
                    choice_id: "daily",
                    label: "Daily"
                },
                {
                    choice_id: "weekly",
                    label: "Weekly"
                },
                {
                    choice_id: "monthly",
                    label: "Monthly"
                },
                {
                    choice_id: "as_occurring",
                    label: "As occurring"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "finance_management_support_provider",
        title: "Who provides support for managing their finances?",
        section: "Management",
        section_id: "management",
        show_details: false,
        dependencies: {
            finance_management: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "finance_management_support_type",
        title: "What support is needed?",
        section: "Management",
        section_id: "management",
        show_details: false,
        dependencies: {
            finance_management: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    }
];