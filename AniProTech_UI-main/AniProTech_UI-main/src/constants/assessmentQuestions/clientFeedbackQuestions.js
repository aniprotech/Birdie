export const CLIENT_FEEDBACK_QUESTIONS = [
    {
        id: "quality_assurance",
        title: "How was the quality assurance check carried out?",
        subtitle: null,
        section: "Method",
        section_id: "method",
        default_show_details: true,
        required: true,
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
    {
        id: "wellbeing_improvement",
        title: "How does our service help to improve your wellbeing?",
        subtitle: null,
        section: "Review",
        section_id: "review",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "desirable_outcomes",
        title: "Are there any outcomes you would like to achieve that we are not currently assisting with?",
        subtitle: null,
        section: "Review",
        section_id: "review",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "yes",
                    label: "Yes"
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
        id: "team_rating",
        title: "How would you rate the service provided by your care team?",
        subtitle: null,
        section: "Review",
        section_id: "review",
        default_show_details: true,
        answer_type: {
            type: "number"
        }
    },
    {
        id: "communication_rating",
        title: "How would you rate the office team's communication with you?",
        subtitle: null,
        section: "Review", 
        section_id: "review",
        default_show_details: true,
        answer_type: {
            type: "number"
        }
    },
    {
        id: "care_plan_changes",
        title: "Would you like to make changes to your care plan?",
        subtitle: null,
        section: "Review",
        section_id: "review",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "yes",
                    label: "Yes"
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
        id: "unresolved_issues",
        title: "Are there any unresolved issues?",
        subtitle: null,
        section: "Review",
        section_id: "review",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "yes",
                    label: "Yes"
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
        id: "service_improvement",
        title: "How can we improve the service?",
        subtitle: null,
        section: "Review",
        section_id: "review",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "further_comments",
        title: "Do you have any further comments?",
        subtitle: null,
        section: "Review",
        section_id: "review",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "yes",
                    label: "Yes"
                },
                {
                    choice_id: "no",
                    label: "No"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    }
];