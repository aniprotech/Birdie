export const MEDICATION_QUESTIONS = [
    // Administration Support Section
    {
        id: "administration_support_level",
        title: "What level of support is required to ensure that we are supporting {{firstname}} safely with their medication?",
        section: "Administration Support",
        section_id: "administration_support",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "administer",
                    label: "Administer"
                },
                {
                    choice_id: "verbal_prompting",
                    label: "Verbal prompting"
                },
                {
                    choice_id: "assist",
                    label: "Assist"
                },
                {
                    choice_id: "prepare",
                    label: "Prepare"
                },
                {
                    choice_id: "none",
                    label: "None"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "friends_and_family_administration",
        title: "Do friends, family or other providers administer {{firstname}}'s medication?",
        section: "Administration Support",
        section_id: "administration_support",
        show_details: true, 
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "needs_with_medication_support",
        title: "Does {{firstname}} have any social, cultural, emotional, religious or spiritual needs associated with their medication support?",
        section: "Administration Support",
        section_id: "administration_support",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },

    // Types of Medication Section
    {
        id: "taking_oral_medication",
        title: "Is {{firstname}} taking any oral medication?",
        section: "Types of Medication",
        section_id: "types_of_medication",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "on_insulin",
        title: "Is {{firstname}} on insulin?",
        section: "Types of Medication",
        section_id: "types_of_medication",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "peg_in_situ",
        title: "Does {{firstname}} have a PEG in situ?",
        section: "Types of Medication",
        section_id: "types_of_medication",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "taking_inhalers",
        title: "Does {{firstname}} use any inhalers?",
        section: "Types of Medication",
        section_id: "types_of_medication",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "blood_glucose_testing_required",
        title: "Does {{firstname}} need glucose testing?",
        section: "Types of Medication",
        section_id: "types_of_medication",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "has_recipient_suffered_side_effects_from_medication",
        title: "Has {{firstname}} suffered any side effects from their medication?",
        section: "Types of Medication",
        section_id: "types_of_medication",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "taking_warfarin_or_anticoagulant",
        title: "Is {{firstname}} taking any Warfarin and/or any other anticoagulant?",
        section: "Types of Medication",
        section_id: "types_of_medication",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "on_syringe_driver",
        title: "Is {{firstname}} on a syringe driver?",
        section: "Types of Medication",
        section_id: "types_of_medication",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },

    // Current Medication Section
    {
        id: "medication_container",
        title: "Is {{firstname}}'s medication in one of the following:",
        section: "Current Medication",
        section_id: "current_medication",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "blister_pack",
                    label: "Blister pack"
                },
                {
                    choice_id: "individual_boxes",
                    label: "Individual boxes"
                },
                {
                    choice_id: "both",
                    label: "Both"
                },
                {
                    choice_id: "none",
                    label: "None"
                },
                {
                    choice_id: "other",
                    label: "Other (please specify)"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "medication_taken_at_set_time",
        title: "Does {{firstname}} need to take their medication at a set time?",
        section: "Current Medication",
        section_id: "current_medication",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "prn_medication",
        title: "Does {{firstname}} take any PRN medication?",
        section: "Current Medication",
        section_id: "current_medication",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "over_the_counter_medication_authorised",
        title: "Has over-the-counter medication been authorised by {{firstname}}'s doctor/pharmacist?",
        section: "Current Medication",
        section_id: "current_medication",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "over_the_counter_medication_authorised_help_requested",
        title: "Has {{firstname}} or their family requested help with over-the-counter medication?",
        section: "Current Medication",
        section_id: "current_medication",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },

    // Medication Risks Section
    {
        id: "medication_decision_making_concerns",
        title: "Are there concerns about {{firstname}}'s capacity to make decisions about their medication?",
        section: "Medication Risks",
        section_id: "medication_risks",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "can_understand_their_medication",
        title: "Does {{firstname}} understand their medication?",
        section: "Medication Risks",
        section_id: "medication_risks",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "want_to_take_medication",
        title: "Does {{firstname}} want to take their medication?",
        section: "Medication Risks",
        section_id: "medication_risks",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "forget_their_medication",
        title: "Can {{firstname}} forget their medication?",
        section: "Medication Risks",
        section_id: "medication_risks",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "can_read_medication_label",
        title: "Can {{firstname}} read the label on their medication?",
        section: "Medication Risks",
        section_id: "medication_risks",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "risk_of_overdose",
        title: "Is {{firstname}} at risk of overdosing?",
        section: "Medication Risks",
        section_id: "medication_risks",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "excess_medication_available",
        title: "Is there excess medication available that can cause {{firstname}} confusion or mistakes?",
        section: "Medication Risks",
        section_id: "medication_risks",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },

    // Functional Section
    {
        id: "can_open_bottles_and_packets",
        title: "Can {{firstname}} open bottles and packets?",
        section: "Functional",
        section_id: "functional",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "can_pour_liquids",
        title: "Can {{firstname}} pour and measure liquids?",
        section: "Functional",
        section_id: "functional",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "can_apply_remove_patches",
        title: "Can {{firstname}} apply and remove patches?",
        section: "Functional",
        section_id: "functional",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "can_apply_creams_ointments",
        title: "Can {{firstname}} apply creams and ointments?",
        section: "Functional",
        section_id: "functional",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "can_instill_ear_drops",
        title: "Can {{firstname}} instill ear drops?",
        section: "Functional",
        section_id: "functional",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "can_instill_eye_drops",
        title: "Can {{firstname}} instill eye drops?",
        section: "Functional",
        section_id: "functional",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "can_instill_nasal_sprays",
        title: "Can {{firstname}} instill nasal sprays?",
        section: "Functional",
        section_id: "functional",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "has_medication_that_requires_sharps",
        title: "Does {{firstname}} have any medication requiring sharps?",
        section: "Functional",
        section_id: "functional",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "can_temper_with_medication",
        title: "Can {{firstname}} tamper with medication?",
        section: "Functional",
        section_id: "functional",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },

    // Prescriptions Section
    {
        id: "prescription_ordering_method",
        title: "How does {{firstname}} order their prescriptions?",
        section: "Prescriptions",
        section_id: "prescriptions",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "manually",
                    label: "Manually pack"
                },
                {
                    choice_id: "electronically",
                    label: "Electronically"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "prescription_ordering_person",
        title: "Who orders {{firstname}}'s prescription?",
        section: "Prescriptions",
        section_id: "prescriptions",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "themselves",
                    label: "Themselves"
                },
                {
                    choice_id: "friend_or_relative",
                    label: "Friend or relative"
                },
                {
                    choice_id: "other",
                    label: "Other (please specify)"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "prescription_collection_method",
        title: "Method of prescription collection",
        section: "Prescriptions",
        section_id: "prescriptions",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "themselves",
                    label: "Themselves"
                },
                {
                    choice_id: "collected_by_friend_or_relative",
                    label: "Collected by friend or relative"
                },
                {
                    choice_id: "delivered_by_pharmacy",
                    label: "Delivered by pharmacy"
                },
                {
                    choice_id: "other",
                    label: "Other (please specify)"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "medication_obtaining_problems",
        title: "Does {{firstname}} or their family have a problem obtaining medicine supplies from the pharmacist/doctor as required?",
        section: "Prescriptions",
        section_id: "prescriptions",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },

    // Collecting Section
    {
        id: "medicine_collection_frequency",
        title: "How often is medication collected or delivered?",
        section: "Collecting",
        section_id: "collecting",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },

    // Storing Section
    {
        id: "medication_stored_appropriately",
        title: "Is medication stored appropriately?",
        section: "Storing",
        section_id: "storing",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "medication_storing_method",
        title: "How does {{firstname}} store their medication?",
        section: "Storing",
        section_id: "storing",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "medication_location",
        title: "Where is {{firstname}}'s medication located?",
        section: "Storing",
        section_id: "storing",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "can_access_medication",
        title: "Can {{firstname}} access their own medication?",
        section: "Storing",
        section_id: "storing",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },

    // Disposing Section
    {
        id: "excess_medication_disposition",
        title: "Who disposes of {{firstname}}'s excess medication?",
        section: "Disposing",
        section_id: "disposing",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "themselves",
                    label: "Themselves"
                },
                {
                    choice_id: "friend_or_relative",
                    label: "Friend or relative"
                },
                {
                    choice_id: "other",
                    label: "Other (please specify)"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "medication_disposition",
        title: "How is {{firstname}}'s medication disposed of?",
        section: "Disposing",
        section_id: "disposing",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    }
];