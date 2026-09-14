export const SEIZURES_QUESTIONS = [
    {
        id: "at_risk_having_seizures",
        title: "Is {{firstname}} at risk of having seizures?",
        section: "General",
        section_id: "general",
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "concerns_about_capacity_make_decisions_about_their_seizure_management",
        title: "Are there any concerns about {{firstname}}'s capacity to make decisions about their seizure management?",
        section: "Capacity and decisions",
        section_id: "capacity",
        answer_type: {
            type: "boolean"
        },
        dependencies: {
            at_risk_having_seizures: true
        }
    },
    {
        id: "confirmed_diagnosis_epilepsy",
        title: "Does {{firstname}} have a confirmed diagnosis of epilepsy?",
        section: "Background",
        section_id: "background",
        answer_type: {
            type: "boolean"
        },
        dependencies: {
            at_risk_having_seizures: true
        }
    },
    {
        id: "seizure_before",
        title: "Has {{firstname}} had a seizure before?",
        section: "Background",
        section_id: "background",
        answer_type: {
            type: "boolean"
        },
        dependencies: {
            at_risk_having_seizures: true
        }
    },
    {
        id: "describe_last_seizure",
        title: "Describe {{firstname}}'s last seizure?",
        section: "Background",
        section_id: "background",
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        },
        dependencies: {
            seizure_before: true
        }
    },
    {
        id: "know_their_last_seizure_happened",
        title: "Does {{firstname}} know when their last seizure happened?",
        section: "Background",
        section_id: "background",
        answer_type: {
            type: "boolean"
        },
        dependencies: {
            seizure_before: true
        }
    },
    {
        id: "date_last_seizure",
        title: "Date of last seizure",
        section: "Background",
        section_id: "background",
        answer_type: {
            type: "date"
        },
        dependencies: {
            know_their_last_seizure_happened: true
        }
    },
    {
        id: "type_seizure_known",
        title: "Is the type of seizure known?",
        section: "Background",
        section_id: "background",
        answer_type: {
            type: "boolean"
        },
        dependencies: {
            seizure_before: true
        },
        show_details: true,
        has_note_condition: {
            type_seizure_known: true
        }
    },
    {
        id: "how_frequently_do_seizures_occur",
        title: "How frequently do seizures occur?",
        section: "Background",
        section_id: "background",
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        },
        dependencies: {
            seizure_before: true
        }
    },
    {
        id: "how_long_do_seizures_typically_last_for",
        title: "How long do seizures typically last for?",
        section: "Background",
        section_id: "background",
        answer_type: {
            type: "free_text",
            variant: "single_line"
        },
        dependencies: {
            seizure_before: true
        }
    },
    {
        id: "known_harm_been_caused_during_previous_seizures",
        title: "Has any known harm been caused during previous seizures?",
        section: "Background",
        section_id: "background",
        answer_type: {
            type: "boolean"
        },
        dependencies: {
            seizure_before: true
        },
        show_details: true,
        has_note_condition: {
            known_harm_been_caused_during_previous_seizures: true
        }
    },
    {
        id: "seizure_management_plan_already_place",
        title: "Is a seizure management plan already in place?",
        section: "Management",
        section_id: "management",
        answer_type: {
            type: "boolean"
        },
        dependencies: {
            at_risk_having_seizures: true
        },
        show_details: true,
        has_note_condition: {
            seizure_management_plan_already_place: true
        }
    },
    {
        id: "take_regular_medication_prevent_their_seizures",
        title: "Does {{firstname}} take any regular medication to prevent their seizures?",
        section: "Management",
        section_id: "management",
        answer_type: {
            type: "boolean"
        },
        dependencies: {
            at_risk_having_seizures: true
        },
        show_details: true,
        has_note_condition: {
            take_regular_medication_prevent_their_seizures: true
        }
    },
    {
        id: "require_emergency_(prn)_medication_manage_their_seizures",
        title: "Does {{firstname}} require any emergency (PRN) medication to manage their seizures?",
        section: "Management",
        section_id: "management",
        answer_type: {
            type: "boolean"
        },
        dependencies: {
            at_risk_having_seizures: true
        },
        show_details: true,
        has_note_condition: {
            "require_emergency_(prn)_medication_manage_their_seizures": true
        }
    },
    {
        id: "warning_signs_seizure_might_about_happen",
        title: "What are the warning signs that a seizure might be about to happen?",
        section: "Management",
        section_id: "management",
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        },
        dependencies: {
            at_risk_having_seizures: true
        }
    },
    {
        id: "how_should_carers_support_seizure_happening",
        title: "How should carers support {{firstname}} when a seizure is happening?",
        section: "Management",
        section_id: "management",
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        },
        dependencies: {
            at_risk_having_seizures: true
        }
    },
    {
        id: "how_should_carers_support_immediately_after_seizure_occured",
        title: "How should carers support immediately after a seizure has occured?",
        section: "Management",
        section_id: "management",
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        },
        dependencies: {
            at_risk_having_seizures: true
        }
    },
    {
        id: "equipment_aid_them_having_seizure",
        title: "Does {{firstname}} have any equipment to aid them when having a seizure?",
        section: "Management",
        section_id: "management",
        answer_type: {
            type: "boolean"
        },
        dependencies: {
            at_risk_having_seizures: true
        },
        show_details: true,
        has_note_condition: {
            equipment_aid_them_having_seizure: true
        }
    },
    {
        id: "provide_additional_guidance_on_how_support_with_managing_their_seizures",
        title: "Provide any additional guidance on how to support {{firstname}} with managing their seizures.",
        section: "Management",
        section_id: "management",
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        },
        dependencies: {
            at_risk_having_seizures: true
        }
    }
];

export const SEIZURES_LAYOUT = [
    {
        type: "section",
        id: "general",
        label: "General",
        layout: [
            {
                type: "section-title",
                title: "General"
            },
            {
                type: "question",
                attribute: {
                    id: "at_risk_having_seizures",
                    title: "Is {{firstname}} at risk of having seizures?",
                    answer_type: {
                        type: "boolean"
                    }
                },
                question_id: "at_risk_having_seizures"
            }
        ]
    },
    {
        type: "section",
        id: "capacity",
        label: "Capacity and decisions",
        visible: [
            {
                question_id: "at_risk_having_seizures",
                hasValue: true
            }
        ],
        layout: [
            {
                type: "section-title",
                title: "Capacity and decisions"
            },
            {
                type: "question",
                attribute: {
                    id: "concerns_about_capacity_make_decisions_about_their_seizure_management",
                    title: "Are there any concerns about {{firstname}}'s capacity to make decisions about their seizure management?",
                    answer_type: {
                        type: "boolean"
                    }
                },
                question_id: "concerns_about_capacity_make_decisions_about_their_seizure_management"
            }
        ]
    },
    {
        type: "section",
        id: "background",
        label: "Background",
        visible: [
            {
                question_id: "at_risk_having_seizures",
                hasValue: true
            }
        ],
        layout: [
            {
                type: "section-title",
                title: "Background"
            },
            {
                type: "question",
                attribute: {
                    id: "confirmed_diagnosis_epilepsy",
                    title: "Does {{firstname}} have a confirmed diagnosis of epilepsy?",
                    answer_type: {
                        type: "boolean"
                    }
                },
                question_id: "confirmed_diagnosis_epilepsy"
            },
            {
                type: "question",
                attribute: {
                    id: "seizure_before",
                    title: "Has {{firstname}} had a seizure before?",
                    answer_type: {
                        type: "boolean"
                    }
                },
                question_id: "seizure_before"
            },
            {
                type: "question",
                attribute: {
                    id: "describe_last_seizure",
                    title: "Describe {{firstname}}'s last seizure?",
                    answer_type: {
                        type: "free_text",
                        variant: "multi_line"
                    }
                },
                visible: [
                    {
                        question_id: "seizure_before",
                        hasValue: true
                    }
                ],
                question_id: "describe_last_seizure"
            },
            {
                type: "question",
                attribute: {
                    id: "know_their_last_seizure_happened",
                    title: "Does {{firstname}} know when their last seizure happened?",
                    answer_type: {
                        type: "boolean"
                    }
                },
                visible: [
                    {
                        question_id: "seizure_before",
                        hasValue: true
                    }
                ],
                question_id: "know_their_last_seizure_happened"
            },
            {
                type: "question",
                attribute: {
                    id: "date_last_seizure",
                    title: "Date of last seizure",
                    answer_type: {
                        type: "date"
                    }
                },
                visible: [
                    {
                        question_id: "know_their_last_seizure_happened",
                        hasValue: true
                    }
                ],
                question_id: "date_last_seizure"
            },
            {
                type: "question",
                attribute: {
                    id: "type_seizure_known",
                    title: "Is the type of seizure known?",
                    answer_type: {
                        type: "boolean"
                    }
                },
                has_note: [
                    {
                        question_id: "type_seizure_known",
                        hasValue: true
                    }
                ],
                visible: [
                    {
                        question_id: "seizure_before",
                        hasValue: true
                    }
                ],
                question_id: "type_seizure_known"
            },
            {
                type: "question",
                attribute: {
                    id: "how_frequently_do_seizures_occur",
                    title: "How frequently do seizures occur?",
                    answer_type: {
                        type: "free_text",
                        variant: "multi_line"
                    }
                },
                visible: [
                    {
                        question_id: "seizure_before",
                        hasValue: true
                    }
                ],
                question_id: "how_frequently_do_seizures_occur"
            },
            {
                type: "question",
                attribute: {
                    id: "how_long_do_seizures_typically_last_for",
                    title: "How long do seizures typically last for?",
                    answer_type: {
                        type: "free_text",
                        variant: "single_line"
                    }
                },
                visible: [
                    {
                        question_id: "seizure_before",
                        hasValue: true
                    }
                ],
                question_id: "how_long_do_seizures_typically_last_for"
            },
            {
                type: "question",
                attribute: {
                    id: "known_harm_been_caused_during_previous_seizures",
                    title: "Has any known harm been caused during previous seizures?",
                    answer_type: {
                        type: "boolean"
                    }
                },
                visible: [
                    {
                        question_id: "seizure_before",
                        hasValue: true
                    }
                ],
                has_note: [
                    {
                        question_id: "known_harm_been_caused_during_previous_seizures",
                        hasValue: true
                    }
                ],
                question_id: "known_harm_been_caused_during_previous_seizures"
            }
        ]
    },
    {
        type: "section",
        id: "management",
        label: "Management",
        visible: [
            {
                question_id: "at_risk_having_seizures",
                hasValue: true
            }
        ],
        layout: [
            {
                type: "section-title",
                title: "Management"
            },
            {
                type: "question",
                attribute: {
                    id: "seizure_management_plan_already_place",
                    title: "Is a seizure management plan already in place?",
                    answer_type: {
                        type: "boolean"
                    }
                },
                has_note: [
                    {
                        question_id: "seizure_management_plan_already_place",
                        hasValue: true
                    }
                ],
                question_id: "seizure_management_plan_already_place"
            },
            {
                type: "question",
                attribute: {
                    id: "take_regular_medication_prevent_their_seizures",
                    title: "Does {{firstname}} take any regular medication to prevent their seizures?",
                    answer_type: {
                        type: "boolean"
                    }
                },
                has_note: [
                    {
                        question_id: "take_regular_medication_prevent_their_seizures",
                        hasValue: true
                    }
                ],
                question_id: "take_regular_medication_prevent_their_seizures"
            },
            {
                type: "question",
                attribute: {
                    id: "require_emergency_(prn)_medication_manage_their_seizures",
                    title: "Does {{firstname}} require any emergency (PRN) medication to manage their seizures?",
                    answer_type: {
                        type: "boolean"
                    }
                },
                has_note: [
                    {
                        question_id: "require_emergency_(prn)_medication_manage_their_seizures",
                        hasValue: true
                    }
                ],
                question_id: "require_emergency_(prn)_medication_manage_their_seizures"
            },
            {
                type: "question",
                attribute: {
                    id: "warning_signs_seizure_might_about_happen",
                    title: "What are the warning signs that a seizure might be about to happen?",
                    answer_type: {
                        type: "free_text",
                        variant: "multi_line"
                    }
                },
                question_id: "warning_signs_seizure_might_about_happen"
            },
            {
                type: "question",
                attribute: {
                    id: "how_should_carers_support_seizure_happening",
                    title: "How should carers support {{firstname}} when a seizure is happening?",
                    answer_type: {
                        type: "free_text",
                        variant: "multi_line"
                    }
                },
                question_id: "how_should_carers_support_seizure_happening"
            },
            {
                type: "question",
                attribute: {
                    id: "how_should_carers_support_immediately_after_seizure_occured",
                    title: "How should carers support immediately after a seizure has occured?",
                    answer_type: {
                        type: "free_text",
                        variant: "multi_line"
                    }
                },
                question_id: "how_should_carers_support_immediately_after_seizure_occured"
            },
            {
                type: "question",
                attribute: {
                    id: "equipment_aid_them_having_seizure",
                    title: "Does {{firstname}} have any equipment to aid them when having a seizure?",
                    answer_type: {
                        type: "boolean"
                    }
                },
                has_note: [
                    {
                        question_id: "equipment_aid_them_having_seizure",
                        hasValue: true
                    }
                ],
                question_id: "equipment_aid_them_having_seizure"
            },
            {
                type: "question",
                attribute: {
                    id: "provide_additional_guidance_on_how_support_with_managing_their_seizures",
                    title: "Provide any additional guidance on how to support {{firstname}} with managing their seizures.",
                    answer_type: {
                        type: "free_text",
                        variant: "multi_line"
                    }
                },
                question_id: "provide_additional_guidance_on_how_support_with_managing_their_seizures"
            }
        ]
    }
]; 