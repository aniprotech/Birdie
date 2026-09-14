export const COURTESY_CALL_QUESTIONS = [
    {
        id: "last_visit",
        title: "How was your last visit?",
        subtitle: null,
        section: "Review",
        section_id: "review",
        show_details: false,
        placeholder: "Describe overall experience including what went well or didn't go well",
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "which_care_professional_visited",
        title: "Which care professional visited you?",
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
        id: "care_professional_relationship",
        title: "How did you get on with the care professional during the visit?",
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
        id: "care_professional_arrival_punctuality",
        title: "Did the care professional arrive on time?",
        subtitle: null,
        section: "Review",
        section_id: "review",
        default_show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "care_professional_arrival_punctuality.yes",
                    label: "Yes"
                },
                {
                    choice_id: "care_professional_arrival_punctuality.no",
                    label: "No"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "care_professional_departure_punctuality",
        title: "Did the care professional leave on time?",
        subtitle: null,
        section: "Review",
        section_id: "review",
        default_show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "care_professional_departure_punctuality.yes",
                    label: "Yes"
                },
                {
                    choice_id: "care_professional_departure_punctuality.no",
                    label: "No"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "needs_met",
        title: "Did the visit meet your needs?",
        subtitle: null,
        section: "Review",
        section_id: "review",
        default_show_details: true,
        placeholder: "Describe how the visit did or did not meet your needs as expected",
        answer_type: {
            choices: [
                {
                    choice_id: "needs_met.yes",
                    label: "Yes"
                },
                {
                    choice_id: "needs_met.no",
                    label: "No"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "past_or_future_visits_further_discussion",
        title: "Is there anything else you would like to discuss about your last visit or future visits?",
        subtitle: null,
        section: "Review",
        section_id: "review",
        default_show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "past_or_future_visits_further_discussion.yes",
                    label: "Yes"
                },
                {
                    choice_id: "past_or_future_visits_further_discussion.no",
                    label: "No"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    }
]; 