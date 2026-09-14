export const END_OF_LIFE_QUESTIONS = [
    // General Section
    {
        id: "does_need_end_of_life",
        title: "Does {{firstname}} need end of life care?",
        section: "General",
        section_id: "general",
        // show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "is_comfortable_discussing_topic",
        title: "Is {{firstname}} comfortable to discuss this topic?",
        section: "General",
        section_id: "general",
        // show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "anyone_else_present_during_discussion",
        title: "Would {{firstname}} like to have anyone else present in the room during this discussion?",
        section: "General",
        section_id: "general",
        show_details: true,
        dependencies: {
            is_comfortable_discussing_topic: true
        },
        has_note: [{ question_id: "anyone_else_present_during_discussion", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "does_require_communication_support",
        title: "Does {{firstname}} require any communication support in expressing their wishes around end of life care?",
        section: "General",
        section_id: "general",
        show_details: true,
        has_note: [{ question_id: "does_require_communication_support", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "already_has_end_of_life_in_place",
        title: "Is there already an end of life care plan in place?",
        section: "General",
        section_id: "general",
        show_details: true,
        has_note: [{ question_id: "already_has_end_of_life_in_place", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "topics_to_avoid_or_encourage",
        title: "Are there any specific topics of communication to avoid or encourage?",
        section: "General",
        section_id: "general",
        show_details: true,
        has_note: [{ question_id: "topics_to_avoid_or_encourage", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    // Capacity Section
    {
        id: "concerns_around_ability_consent",
        title: "Are there any concerns around {{firstname}}'s ability to give consent to this aspect of their care?",
        section: "Capacity",
        section_id: "capacity",
        // show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    // Documentation Section
    {
        id: "lpa_in_place_health_welfare",
        title: "Is there a Lasting Power of Attorney in place for health and welfare?",
        section: "Documentation",
        section_id: "documentation",
        // show_details: true,
        answer_type: {
            choices: [
                { choice_id: "yes", label: "Yes" },
                { choice_id: "no", label: "No" },
                { choice_id: "dont_know", label: "Don't know" }
            ],
            type: "single_choice",
            variant: "button-group"
        }
    },
    {
        id: "lpa_certificate_number_health_welfare",
        title: "LPA certificate number",
        section: "Documentation",
        section_id: "documentation",
        show_details: true,
        dependencies: {
            lpa_in_place_health_welfare: "yes"
        },
        answer_type: {
            type: "text_field",
            variant: "single_line"
        }
    },
    {
        id: "lpa_in_place_property_financial",
        title: "Is there a Lasting Power of Attorney in place for property and financial affairs?",
        section: "Documentation",
        section_id: "documentation",
        // show_details: true,
        answer_type: {
            choices: [
                { choice_id: "yes", label: "Yes" },
                { choice_id: "no", label: "No" },
                { choice_id: "dont_know", label: "Don't know" }
            ],
            type: "single_choice",
            variant: "button-group"
        }
    },
    {
        id: "lpa_certificate_number_property_financial",
        title: "LPA certificate number",
        section: "Documentation",
        section_id: "documentation",
        show_details: true,
        dependencies: {
            lpa_in_place_property_financial: "yes"
        },
        answer_type: {
            type: "text_field",
            variant: "single_line"
        }
    },
    {
        id: "adrt",
        title: "Does {{firstname}} have an Advance Decision to Refuse Treatment (ADRT)?",
        section: "Documentation",
        section_id: "documentation",
        // show_details: true,
        answer_type: {
            choices: [
                { choice_id: "yes", label: "Yes" },
                { choice_id: "no", label: "No" },
                { choice_id: "dont_know", label: "Don't know" }
            ],
            type: "single_choice",
            variant: "button-group"
        }
    },
    {
        id: "where_is_it_kept_adrt",
        title: "Where is it kept?",
        section: "Documentation",
        section_id: "documentation",
        show_details: true,
        dependencies: {
            adrt: "yes"
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. study desk drawer"
    },
    {
        id: "respect_plan_in_place",
        title: "Does {{firstname}} have a ReSPECT plan in place?",
        section: "Documentation",
        section_id: "documentation",
        // show_details: true,
        answer_type: {
            choices: [
                { choice_id: "yes", label: "Yes" },
                { choice_id: "no", label: "No" },
                { choice_id: "dont_know", label: "Don't know" }
            ],
            type: "single_choice",
            variant: "button-group"
        }
    },
    {
        id: "where_is_it_kept_respect",
        title: "Where is it kept?",
        section: "Documentation",
        section_id: "documentation",
        show_details: true,
        dependencies: {
            respect_plan_in_place: "yes"
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. study desk drawer"
    },
    {
        id: "made_a_will",
        title: "Has {{firstname}} made a will?",
        section: "Documentation",
        section_id: "documentation",
        // show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "where_is_it_kept_will",
        title: "Where is it kept?",
        section: "Documentation",
        section_id: "documentation",
        show_details: true,
        dependencies: {
            made_a_will: true
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. study desk drawer"
    },
    {
        id: "named_executor_will",
        title: "Who is named as the Executor of the will?",
        section: "Documentation",
        section_id: "documentation",
        show_details: true,
        dependencies: {
            made_a_will: true
        },
        answer_type: {
            type: "text_field",
            variant: "multi_line"
        }
    },
    {
        id: "opt_out_organ_donation",
        title: "Has {{firstname}} opted out of being on the organ donation register?",
        section: "Documentation",
        section_id: "documentation",
        // show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "organ_donation_number",
        title: "Organ donation number",
        section: "Documentation",
        section_id: "documentation",
        show_details: true,
        dependencies: {
            opt_out_organ_donation: false
        },
        answer_type: {
            type: "text_field",
            variant: "single_line"
        }
    },
    // Wishes and Preferences Section
    {
        id: "health_deterioration_where_be_cared",
        title: "If {{firstname}}'s health deteriorates considerably, where would they like to be cared for?",
        section: "Wishes and Preferences",
        section_id: "wishes",
        show_details: true,
        answer_type: {
            choices: [
                { choice_id: "home", label: "At home" },
                { choice_id: "family", label: "With family" },
                { choice_id: "residential_home", label: "In a residential home" },
                { choice_id: "other", label: "Other" },
                { choice_id: "prefer_not_to_say", label: "Prefer not to say" }
            ],
            type: "single_choice",
            variant: "button-group"
        }
    },
    {
        id: "other-details",
        title: "Other - details",
        section: "Wishes and Preferences",
        section_id: "wishes",
        show_details: true,
        dependencies: {
            health_deterioration_where_be_cared: "other"
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "thoughts_pain_management",
        title: "What are {{firstname}}'s thoughts about pain management?",
        section: "Wishes and Preferences",
        section_id: "wishes",
        show_details: true,
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. client is happy to take painkillers as and when needed."
    },
    {
        id: "specific_care_plan",
        title: "Is there a specific care plan put in place by the GP for pain management?",
        section: "Wishes and Preferences",
        section_id: "wishes",
        // show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "where_is_it_kept_care_plan",
        title: "Where is it kept",
        section: "Wishes and Preferences",
        section_id: "wishes",
        show_details: true,
        dependencies: {
            specific_care_plan: true
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. study desk drawer"
    },
    {
        id: "treatments_dont_want",
        title: "Are there any treatments that {{firstname}} does not want to have when approaching end of life?",
        section: "Wishes and Preferences",
        section_id: "wishes",
        show_details: true,
        has_note: [{ question_id: "treatments_dont_want", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "important_final_days_hours",
        title: "What would be important for {{firstname}} in their final days and hours of life?",
        section: "Wishes and Preferences",
        section_id: "wishes",
        show_details: true,
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. having loved ones around as much as possible."
    },
    {
        id: "wishes_final_days_hours",
        title: "What specific wishes, if any, does {{firstname}} have for their final days and hours of life?",
        section: "Wishes and Preferences",
        section_id: "wishes",
        show_details: true,
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. to have the curtains open during the day; to sleep with the light on."
    },
    {
        id: "present_final_days_hours",
        title: "Who would {{firstname}} like to be present during their final days and hours of life?",
        section: "Wishes and Preferences",
        section_id: "wishes",
        show_details: true,
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. particular friends and/or family members."
    },
    {
        id: "worry_final_days_hours",
        title: "What, if anything, does {{firstname}} worry about or fear happening during their final days and hours of life?",
        section: "Wishes and Preferences",
        section_id: "wishes",
        show_details: true,
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. being uncomfortable or in pain."
    },
    {
        id: "comfort_final_days_hours",
        title: "What might comfort {{firstname}} during their final days and hours of life?",
        section: "Wishes and Preferences",
        section_id: "wishes",
        show_details: true,
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. smells, music, photos"
    },
    {
        id: "religious_cultural_beliefs",
        title: "Are there any religious or cultural beliefs to be considered?",
        section: "Wishes and Preferences",
        section_id: "wishes",
        show_details: true,
        has_note: [{ question_id: "religious_cultural_beliefs", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "buried_or_cremated",
        title: "Would {{firstname}} like to be buried or cremated?",
        section: "Wishes and Preferences",
        section_id: "wishes",
        show_details: true,
        answer_type: {
            choices: [
                { choice_id: "buried", label: "Buried" },
                { choice_id: "cremated", label: "Cremated" },
                { choice_id: "no_preference", label: "No preference" },
                { choice_id: "not_assessed", label: "Not assessed" }
            ],
            type: "single_choice",
            variant: "button-group"
        }
    },
    {
        id: "funeral_wishes",
        title: "Describe any wishes that {{firstname}} has for their funeral",
        section: "Wishes and Preferences",
        section_id: "wishes",
        show_details: true,
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. where the funeral should be held."
    },
    // Other Section
    {
        id: "further_guidance_eof_needs",
        title: "Provide any further guidance on meeting end of life care needs",
        section: "Other",
        section_id: "other",
        show_details: true,
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    }
]; 