export const DYSPHAGIA_QUESTIONS = [
    // General Section
    {
        id: "confirmed_diagnosis_dysphagia",
        title: "Does {{firstname}} have a confirmed diagnosis of dysphagia?",
        section: "General",
        section_id: "general",
        answer_type: {
            choices: [
                { choice_id: "yes", label: "Yes" },
                { choice_id: "no", label: "No" },
                { choice_id: "dont_know", label: "Don't know" }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "known_speech_language_therapy_team",
        title: "Is {{firstname}} known to the Speech and Language Therapy team?",
        section: "General",
        section_id: "general",
        answer_type: {
            choices: [
                { choice_id: "yes", label: "Yes" },
                { choice_id: "no", label: "No" },
                { choice_id: "dont_know", label: "Don't know" }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "speech_language_therapy_salt_guidelines_eating_drinking",
        title: "Does {{firstname}} have Speech and Language Therapy (SALT) guidelines for eating and drinking?",
        section: "General",
        section_id: "general",
        dependencies: {
            known_speech_language_therapy_team: "yes"
        },
        show_details: true,
        answer_type: {
            choices: [
                { choice_id: "yes", label: "Yes" },
                { choice_id: "no", label: "No" },
                { choice_id: "dont_know", label: "Don't know" }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "these_guidelines_being_followed",
        title: "Are these guidelines being followed?",
        section: "General",
        section_id: "general",
        dependencies: {
            speech_language_therapy_salt_guidelines_eating_drinking: "yes"
        },
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "why_arent_these_guidelines_being_followed",
        title: "Why aren't these guidelines being followed?",
        section: "General",
        section_id: "general",
        dependencies: {
            speech_language_therapy_salt_guidelines_eating_drinking: ["yes","dont_know","no"],
            these_guidelines_being_followed: false
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        },
        placeholder: "e.g. because the client is refusing to follow them."
    },
    // Choking History Section
    {
        id: "been_known_choking_incident_last_12_months",
        title: "Has there been a known choking incident in the last 12 months?",
        section: "Choking History",
        section_id: "choking",
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_many_times_happened_last_12_months",
        title: "How many times has this happened in the last 12 months?",
        section: "Choking History",
        section_id: "choking",
        dependencies: {
            been_known_choking_incident_last_12_months: true
        },
        answer_type: {
            type: "text_field",
            variant: "single_line"
        }
    },
    {
        id: "eating_and_or_drinking_at_time_incident",
        title: "Was {{firstname}} eating and/or drinking at the time of the incident/s?",
        section: "Choking History",
        section_id: "choking",
        dependencies: {
            been_known_choking_incident_last_12_months: true
        },
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "being_eaten_and_or_drunk",
        title: "What was being eaten and/or drunk?",
        section: "Choking History",
        section_id: "choking",
        dependencies: {
            been_known_choking_incident_last_12_months: true,
            eating_and_or_drinking_at_time_incident: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        },
        placeholder: "e.g. a sandwich; a cup of coffee."
    },
    {
        id: "choking_incident_additional_details",
        title: "Additional details",
        section: "Choking History",
        section_id: "choking",
        dependencies: {
            been_known_choking_incident_last_12_months: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    // Behavioral Risks Section
    {
        id: "behaviours_increase_their_risk_choking",
        title: "Does {{firstname}} have any behaviours that increase their risk of choking?",
        section: "Behavioral Risks",
        section_id: "behavioural",
        show_details: true, 
        answer_type: {
            type: "boolean"
        },
        placeholder: "e.g. eating non-food items."
    },
    {
        id: "strategies_place_manage_behaviour",
        title: "What strategies are in place to manage this behaviour?",
        section: "Behavioral Risks",
        section_id: "behavioural",
        dependencies: {
            behaviours_increase_their_risk_choking: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        },
        placeholder: "e.g. observing during mealtimes."
    },
    // Eating and Drinking Risks Section
    {
        id: "dentures",
        title: "Does {{firstname}} have dentures?",
        section: "Eating and Drinking Risks",
        section_id: "eating",
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "usually_wear_these_eating_drinking",
        title: "Does {{firstname}} usually wear these for eating and drinking?",
        section: "Eating and Drinking Risks",
        section_id: "eating",
        dependencies: {
            dentures: true
        },
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "why_not_wear_their_dentures_eating_drinking",
        title: "Why does {{firstname}} not wear their dentures when eating and drinking?",
        section: "Eating and Drinking Risks",
        section_id: "eating",
        dependencies: {
            dentures: true,
            usually_wear_these_eating_drinking: false
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        },
        placeholder: "e.g. because they find them uncomfortable; because they forget."
    },
    {
        id: "frequently_continually_cough_before_during_after_eating",
        title: "Does {{firstname}} frequently or continually cough before, during or after eating?",
        section: "Eating and Drinking Risks",
        section_id: "eating",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "frequently_continually_cough_before_during_after_drinking",
        title: "Does {{firstname}} frequently or continually cough before, during or after drinking?",
        section: "Eating and Drinking Risks",
        section_id: "eating",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "ever_difficulty_breathing_whilst_they_eating",
        title: "Does {{firstname}} ever have difficulty breathing whilst they are eating?",
        section: "Eating and Drinking Risks",
        section_id: "eating",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "currently_able_chew_normal_diet",
        title: "Is {{firstname}} currently able to chew a normal diet?",
        section: "Eating and Drinking Risks",
        section_id: "eating",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "started_eating_less",
        title: "Has {{firstname}} started eating less?",
        section: "Eating and Drinking Risks",
        section_id: "eating",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "hold_food_their_mouth",
        title: "Does {{firstname}} hold food in their mouth?",
        section: "Eating and Drinking Risks",
        section_id: "eating",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "lost_their_enjoyment_food",
        title: "Has {{firstname}} lost their enjoyment of food?",
        section: "Eating and Drinking Risks",
        section_id: "eating",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    // Modifications Section
    {
        id: "food_texture_need_modified",
        title: "Does {{firstname}}'s food texture need to be modified?",
        section: "Modifications",
        section_id: "modifications",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "level_should_food_texture_according_iddsi_framework",
        title: "What level should {{firstname}}'s food texture be according to the IDDSI framework?",
        section: "Modifications",
        section_id: "modifications",
        show_details: true,
        dependencies: {
            food_texture_need_modified: true
        },
        answer_type: {
            choices: [
                { choice_id: "3", label: "3" },
                { choice_id: "4", label: "4" },
                { choice_id: "5", label: "5" },
                { choice_id: "6", label: "6" },
                { choice_id: "7", label: "7" }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "drinks_texture_need_modified",
        title: "Does {{firstname}}'s drinks texture need to be modified?",
        section: "Modifications",
        section_id: "modifications",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "level_should_drinks_texture_according_iddsi_framework",
        title: "What level should {{firstname}}'s drinks texture be according to the IDDSI framework?",
        section: "Modifications",
        section_id: "modifications",
        dependencies: {
            drinks_texture_need_modified: true
        },
        answer_type: {
            choices: [
                { choice_id: "0", label: "0" },
                { choice_id: "1", label: "1" },
                { choice_id: "2", label: "2" },
                { choice_id: "3", label: "3" },
                { choice_id: "4", label: "4" }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "how_should_these_prepared",
        title: "How should these be prepared?",
        section: "Modifications",
        section_id: "modifications",
        dependencies: {
            drinks_texture_need_modified: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "where_thickening_powder_stored",
        title: "Where is {{firstname}}'s thickening powder stored?",
        section: "Modifications",
        section_id: "modifications",
        dependencies: {
            drinks_texture_need_modified: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "measuring_jug_preparing_thickened_fluids",
        title: "Does {{firstname}} have a measuring jug for preparing thickened fluids?",
        section: "Modifications",
        section_id: "modifications",
        dependencies: {
            drinks_texture_need_modified: true
        },
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "where_kept",
        title: "Where is this kept?",
        section: "Modifications",
        section_id: "modifications",
        dependencies: {
            drinks_texture_need_modified: true,
            measuring_jug_preparing_thickened_fluids: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "use_special_cutlery_cups_help_with_eating_drinking",
        title: "Does {{firstname}} use any special cutlery or cups to help with eating and drinking?",
        section: "Modifications",
        section_id: "modifications",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    // Medication Section
    {
        id: "take_oral_medication",
        title: "Does {{firstname}} take oral medication?",
        section: "Medication",
        section_id: "medication",
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "difficulties_swallowing_their_oral_medication",
        title: "Does {{firstname}} have difficulties swallowing their oral medication?",
        section: "Medication",
        section_id: "medication",
        dependencies: {
            take_oral_medication: true
        },
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "strategies_place_help_take_their_medication_more_easily",
        title: "What strategies are in place to help {{firstname}} take their medication more easily?",
        section: "Medication",
        section_id: "medication",
        dependencies: {
            take_oral_medication: true,
            difficulties_swallowing_their_oral_medication: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    // Other Risks Section
    {
        id: "other_risks_not_captured_here",
        title: "Are there any other risks not captured here?",
        section: "Other Risks",
        show_details: true,
        section_id: "other",
        answer_type: {
            type: "boolean"
        }
    },
    // Support Section
    {
        id: "can_do_reduce_their_risk_choking",
        title: "What can {{firstname}} do to reduce their risk of choking?",
        section: "Support",
        section_id: "support",
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "should_care_team_do_reduce_risk_choking",
        title: "What should the care team do to reduce risk of {{firstname}} choking?",
        section: "Support",
        section_id: "support",
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "warning_signs_might_choking",
        title: "What are the warning signs that {{firstname}} might be choking?",
        section: "Support",
        section_id: "support",
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "how_should_carers_support_if_they_begin_choking",
        title: "How should carers support {{firstname}} if they begin choking?",
        section: "Support",
        section_id: "support",
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    }
]; 