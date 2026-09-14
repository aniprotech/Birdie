export const RESTRICTIVE_PRACTICE_QUESTIONS = [
    // Capacity and Decisions Section
    {
        id: "concerns_around_ability_to_consent",
        title: "Are there any concerns around {{firstname}}'s ability to give consent to this aspect of their care?",
        section: "Capacity and decisions",
        section_id: "capacity",
        show_details: false,
        answer_type: {
            type: "boolean"
        }
    },

    // Restrictive Practices Section
    {
        id: "doors_kept_locked",
        title: "Are {{firstname}}'s doors kept locked?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: false,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "reasonable_non-restrictive_alternatives_doors",
        title: "Are there any reasonable non-restrictive alternatives to this?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: true,
        dependencies: {
            doors_kept_locked: true
        },
        has_note_condition: {
            reasonable_non_restrictive_alternatives_doors: true
        },
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "reason_for_locking_doors",
        title: "What is the reason for locking {{firstname}}'s doors?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: false,
        dependencies: {
            doors_kept_locked: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "medication_locked_away",
        title: "Is {{firstname}}'s medication locked away?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: false,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "reasonable_non-restrictive_alternatives_medication",
        title: "Are there any reasonable non-restrictive alternatives to this?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: true,
        dependencies: {
            medication_locked_away: true
        },
        has_note_condition: {
            reasonable_non_restrictive_alternatives_medication: true
        },
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "locking_medication_away",
        title: "What is the reason for locking {{firstname}}'s medication away?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: false,
        dependencies: {
            medication_locked_away: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "medication_administered_covertly",
        title: "Is {{firstname}}'s medication administered covertly?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: true,
        has_note_condition: {
            medication_administered_covertly: "yes_all"
        },
        answer_type: {
            choices: [
                {
                    choice_id: "yes_all",
                    label: "Yes, all"
                },
                {
                    choice_id: "yes_partially",
                    label: "Yes, partially"
                },
                {
                    choice_id: "no",
                    label: "No"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "reasonable_non-restrictive_alternatives_administered",
        title: "Are there any reasonable non-restrictive alternatives to this?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: true,
        dependencies: {
            medication_administered_covertly: "yes_all"
        },
        has_note_condition: {
            reasonable_non_restrictive_alternatives_administered: true
        },
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "reason_for_administering_medication_covertly",
        title: "What is the reason for administering {{firstname}}'s medication covertly?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: false,
        dependencies: {
            medication_administered_covertly: "yes_all"
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "money_locked_away",
        title: "Is {{firstname}}'s money locked away?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: false,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "reasonable_non-restrictive_alternatives-money",
        title: "Are there any reasonable non-restrictive alternatives to this?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: true,
        dependencies: {
            money_locked_away: true
        },
        has_note_condition: {
            reasonable_non_restrictive_alternatives_money: true
        },
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "reason_for_locking_money_away",
        title: "What is the reason for locking {{firstname}}'s money away?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: false,
        dependencies: {
            money_locked_away: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "food_and_or_drink_locked_away",
        title: "Is {{firstname}}'s food and/or drink locked away?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: false,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "reasonable_non-restrictive_alternatives_food",
        title: "Are there any reasonable non-restrictive alternatives to this?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: true,
        dependencies: {
            food_and_or_drink_locked_away: true
        },
        has_note_condition: {
            reasonable_non_restrictive_alternatives_food: true
        },
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "reason_for_locking_food_and_or_drink",
        title: "What is the reason for locking {{firstname}}'s food and/or drink away?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: false,
        dependencies: {
            food_and_or_drink_locked_away: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "have_bedrails",
        title: "Does {{firstname}} have bedrails?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: false,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "reasonable_non-restrictive_alternatives_bedrails",
        title: "Are there any reasonable non-restrictive alternatives to this?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: true,
        dependencies: {
            have_bedrails: true
        },
        has_note_condition: {
            reasonable_non_restrictive_alternatives_bedrails: true
        },
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "reason_for_using_bedrails",
        title: "What is the reason for using bedrails?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: false,
        dependencies: {
            have_bedrails: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "use_a_riser_recliner_chair",
        title: "Does {{firstname}} use a riser recliner chair?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: false,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "reasonable_non-restrictive_alternatives_riser",
        title: "Are there any reasonable non-restrictive alternatives to this?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: true,
        dependencies: {
            use_a_riser_recliner_chair: true
        },
        has_note_condition: {
            reasonable_non_restrictive_alternatives_riser: true
        },
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "reason_for_using_a_riser_recliner_chair",
        title: "What is the reason for using a riser recliner chair?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: false,
        dependencies: {
            use_a_riser_recliner_chair: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "relatives_had_cctv_surveillance_systems_installed",
        title: "Have {{firstname}}'s relatives had CCTV/surveillance systems installed?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: false,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "reasonable_non-restrictive_alternatives_surveillance",
        title: "Are there any reasonable non-restrictive alternatives to this?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: true,
        dependencies: {
            relatives_had_cctv_surveillance_systems_installed: true
        },
        has_note_condition: {
            reasonable_non_restrictive_alternatives_surveillance: true
        },
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "reason_for_relatives_having_cctv_surveillance_systems_installed",
        title: "What is the reason for {{firstname}}'s relatives having CCTV/surveillance systems installed?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: false,
        dependencies: {
            relatives_had_cctv_surveillance_systems_installed: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "other_restricrive_practice_measures_in_place",
        title: "Are there any other restrictive practice measures in place?",
        section: "Restrictive practices",
        section_id: "restrictive",
        show_details: true,
        has_note_condition: {
            other_restricrive_practice_measures_in_place: true
        },
        answer_type: {
            type: "boolean"
        }
    },

    // Consent Section
    {
        id: "given_consent_for_the_above_restriction_measures_to_be_in_place",
        title: "Has {{firstname}} given consent for the above restriction measures to be in place?",
        section: "Consent",
        section_id: "consent",
        show_details: true,
        has_note_condition: {
            given_consent_for_the_above_restriction_measures_to_be_in_place: true
        },
        placeholder: "e.g. client lacks capacity to consent but measures are in place to keep them safe at home",
        answer_type: {
            type: "boolean"
        }
    }
]; 