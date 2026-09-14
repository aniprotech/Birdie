export const SERVICE_REVIEW_QUESTIONS = [
    // Attendance Section
    {
        id: "invited_attendees",
        title: "Who was invited to the service review?",
        subtitle: null,
        section: "Attendance",
        section_id: "attendance_details",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "actual_attendees",
        title: "Who was present at the service review?",
        subtitle: null,
        section: "Attendance",
        section_id: "attendance_details",
        show_details: false,
        placeholder: "e.g. client, family members, third party professionals",
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },

    // Method Section
    {
        id: "service_review_method",
        title: "How was the service review carried out?",
        subtitle: null,
        section: "Method",
        section_id: "method",
        default_show_details: true,
        required: true,
        placeholder: "e.g. carried out during a home visit",
        answer_type: {
            choices: [
                {
                    choice_id: "telephone",
                    label: "Telephone"
                },
                {
                    choice_id: "video_call",
                    label: "Video call"
                },
                {
                    choice_id: "home_visit",
                    label: "Home visit"
                },
                {
                    choice_id: "other",
                    label: "Other"
                }
            ],
            type: "multiple_choice"
        }
    },

    // Review Section
    {
        id: "service_opinion",
        title: "What is {{firstname}}'s view of the service received to date?",
        subtitle: null,
        section: "Review",
        section_id: "review",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },

    // Outcomes Section
    {
        id: "achieved_outcomes",
        title: "Have any outcomes been achieved since the last review?",
        subtitle: null,
        section: "Outcomes",
        section_id: "outcomes",
        default_show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "achieved_outcomes.yes",
                    label: "Yes"
                },
                {
                    choice_id: "achieved_outcomes.no",
                    label: "No"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "active_outcomes",
        title: "Are any outcomes still active?",
        subtitle: null,
        section: "Outcomes",
        section_id: "outcomes",
        default_show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "active_outcomes.yes",
                    label: "Yes"
                },
                {
                    choice_id: "active_outcomes.no",
                    label: "No"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "new_outcomes",
        title: "Have any new outcomes been identified?",
        subtitle: null,
        section: "Outcomes",
        section_id: "outcomes",
        default_show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "new_outcomes.yes",
                    label: "Yes"
                },
                {
                    choice_id: "new_outcomes.no",
                    label: "No"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },

    // Support Section
    {
        id: "support_level_met_client",
        title: "Does {{firstname}} feel that the level of support continues to meet their needs?",
        subtitle: null,
        section: "Support",
        section_id: "support",
        default_show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "support_level_met_client.yes",
                    label: "Yes"
                },
                {
                    choice_id: "support_level_met_client.no",
                    label: "No"
                },
                {
                    choice_id: "support_level_met_client.not_applicable",
                    label: "Not applicable"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "support_level_met_team",
        title: "Do the care team feel that the level of support continues to meet {{firstname}}'s needs?",
        subtitle: null,
        section: "Support",
        section_id: "support",
        default_show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "support_level_met_team.yes",
                    label: "Yes"
                },
                {
                    choice_id: "support_level_met_team.no",
                    label: "No"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "support_level_met_third_party",
        title: "Do family members/third party professionals feel that the level of support continues to meet {{firstname}}'s needs?",
        subtitle: null,
        section: "Support",
        section_id: "support",
        default_show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "support_level_met_third_party.yes",
                    label: "Yes"
                },
                {
                    choice_id: "support_level_met_third_party.no",
                    label: "No"
                },
                {
                    choice_id: "support_level_met_third_party.not_applicable",
                    label: "Not applicable"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "assessments_reviewed",
        title: "Have {{firstname}}'s needs assessments, risk assessments and care plan been reviewed?",
        subtitle: null,
        section: "Support",
        section_id: "support",
        default_show_details: true,
        placeholder: "Confirm areas of the care plan to update based on changing circumstances, needs or risks",
        answer_type: {
            choices: [
                {
                    choice_id: "assessments_reviewed.yes",
                    label: "Yes"
                },
                {
                    choice_id: "assessments_reviewed.no",
                    label: "No"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "training_required",
        title: "Do carers need any additional training to meet {{firstname}}'s needs?",
        subtitle: null,
        section: "Support",
        section_id: "support",
        default_show_details: true,
        placeholder: "Record details of training required",
        answer_type: {
            choices: [
                {
                    choice_id: "training_required.yes",
                    label: "Yes"
                },
                {
                    choice_id: "training_required.no",
                    label: "No"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "further_notes",
        title: "Are there any further points to note as part of this review?",
        subtitle: null,
        section: "Support",
        section_id: "support",
        default_show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "further_notes.yes",
                    label: "Yes"
                },
                {
                    choice_id: "further_notes.no",
                    label: "No"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    }
]; 