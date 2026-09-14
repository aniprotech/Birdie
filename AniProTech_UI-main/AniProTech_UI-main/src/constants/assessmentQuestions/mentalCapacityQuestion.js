export const MENTAL_CAPACITY_QUESTIONS = [
    // Capacity Details Section
    {
        id: "brain_impairment",
        title: "Is there an impairment of, or disturbance in, the functioning of {{firstname}}'s mind or brain?",
        section: "Capacity Details",
        section_id: "capacity_details",
        show_details: true,
        default_show_details: true,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "lacks_capacity_for_decisions",
        title: "Is the impairment or disturbance sufficient that {{firstname}} lacks the capacity to make this decision?",
        section: "Capacity Details",
        section_id: "capacity_details",
        show_details: true,
        default_show_details: true,

        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "general_understanding_of_decisions",
        title: "Does {{firstname}} have a general understanding of which decision they need to make and why they need to make it?",
        section: "Capacity Details",
        section_id: "capacity_details",
        show_details: true,
        default_show_details: true,

        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "general_understanding_of_decision_consequences",
        title: "Does {{firstname}} have a general understanding of the likely consequences of making, or not making, this decision?",
        section: "Capacity Details",
        section_id: "capacity_details",
        default_show_details: true,

        show_details: true,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "understand_remember_compare_information",
        title: "Is {{firstname}} able to:",
        subtitle: [
            "• Understand information relevant to the decision",
            "• Remember the information long enough to make the decision",
            "• Weigh up information relevant to the decision",
        ],
        section: "Capacity Details",
        section_id: "capacity_details",
        default_show_details: true,

        show_details: true,
        has_note: true,
        answer_type: {
            type: "boolean",
            label: "Is {{firstname}} able to understand, remember and weigh up information?",
        },
    },
    {
        id: "able_to_communicate_decision",
        title: "Can {{firstname}} communicate their decision (vocally, using sign language, or any other means)?",
        section: "Capacity Details",
        section_id: "capacity_details",
        show_details: true,
        default_show_details: true,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "decision_making_support_details",
        title: "Give details about any support {{firstname}} received to make this decision (optional).",
        section: "Capacity Details",
        section_id: "capacity_details",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "decision_making_wishes_details",
        title: "Give details about {{firstname}}'s past and present wishes and feelings in regards to this decision (optional).",
        section: "Capacity Details",
        section_id: "capacity_details",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },

    // Conclusion Section
    {
        id: "mental_capacity_consent",
        title: "In regards to the following decision:  \n  **{{assessment-title}}**   \n &nbsp;  \n and in accordance with the Mental Capacity Act 2005, select one of the following options.",
        section: "Conclusion",
        section_id: "conclusion",
        show_details: false,
        required: true,
        answer_type: {
            choices: [
                {
                    choice_id: "has_capacity",
                    label: "I believe they have capacity at this time.",
                },
                {
                    choice_id: "lacks_capacity",
                    label: "I believe they lack capacity at this time.",
                },
                {
                    choice_id: "not_sure",
                    label: "I'm not sure. Assistance from a medical professional is required.",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },

    // Best Interest Decision Section
    {
        id: "best_interest_decision_required",
        title: "Is a best interest decision required?",
        section: "Best Interest Decision",
        section_id: "best_interest_decision",
        show_details: false,
        required: true,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "best_interest_decision_maker",
        title: "Who is the named decision maker for this best interest decision?",
        section: "Best Interest Decision",
        section_id: "best_interest_decision",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
        },
        answer_type: {
            type: "text_field",
            variant: "single_line",
        },
    },
    {
        id: "best_interest_decision_maker_relation",
        title: "What is their profession or relationship to {{firstname}}?",
        section: "Best Interest Decision",
        section_id: "best_interest_decision",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
        },
        answer_type: {
            type: "text_field",
            variant: "single_line",
        },
    },

    // Circumstances Section
    {
        id: "circumstances_values",
        title: "What are {{firstname}}'s values and beliefs in relation to this decision?",
        section: "Circumstances",
        section_id: "circumstances",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
        },
        placeholder: "e.g. religious, cultural, moral",
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "relevant_circumstances",
        title: "Are there any other relevant circumstances that should be taken into account?",
        section: "Circumstances",
        section_id: "circumstances",
        show_details: true,
        dependencies: {
            best_interest_decision_required: true,
        },
        answer_type: {
            type: "boolean",
        },
    },

    // Consultation Section
    {
        id: "who_was_involved",
        title: "Who was involved in the consultation?",
        section: "Consultation",
        section_id: "consultation",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "best_interests",
        title: "What do they consider to be {{firstname}}'s best interests on the matter in question?",
        section: "Consultation",
        section_id: "consultation",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "consultation_wishes",
        title: "Do they have any information about {{firstname}}'s wishes, feelings, values or beliefs in relation to this matter?",
        section: "Consultation",
        section_id: "consultation",
        show_details: true,
        dependencies: {
            best_interest_decision_required: true,
        },
        answer_type: {
            type: "boolean",
        },
    },

    // IMCA Section
    {
        id: "has_imca",
        title: "Does {{firstname}} have an Independent Mental Capacity Advocate (IMCA)?",
        section: "IMCA",
        section_id: "imca",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
        },
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "imca_date",
        title: "Date referral was made (if known)",
        section: "IMCA",
        section_id: "imca",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
            has_imca: true,
        },
        answer_type: {
            type: "date",
        },
    },
    {
        id: "imca_name",
        title: "Name of appointed IMCA",
        section: "IMCA",
        section_id: "imca",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
            has_imca: true,
        },
        answer_type: {
            type: "text_field",
            variant: "single_line",
        },
    },
    {
        id: "imca_organisation",
        title: "Organisation of appointed IMCA",
        section: "IMCA",
        section_id: "imca",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
            has_imca: true,
        },
        answer_type: {
            type: "text_field",
            variant: "single_line",
        },
    },
    {
        id: "imca_phone_number",
        title: "Phone number for IMCA",
        section: "IMCA",
        section_id: "imca",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
            has_imca: true,
        },
        answer_type: {
            type: "text_field",
            variant: "single_line",
        },
    },
    {
        id: "imca_email",
        title: "Email address for IMCA",
        section: "IMCA",
        section_id: "imca",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
            has_imca: true,
        },
        answer_type: {
            type: "text_field",
            variant: "single_line",
        },
    },
    {
        id: "imca_referral",
        title: "Is an IMCA referral required?",
        section: "IMCA",
        section_id: "imca",
        // show_details: true,
        dependencies: {
            best_interest_decision_required: true,
            has_imca: true,
        },
        placeholder:
            "​A referral is required if there is a decision relating to serious medical treatment or accommodation and the client does not have anyone to represent them",
        answer_type: {
            type: "boolean",
        },
    },

    // Options Section
    {
        id: "first_option",
        title: "What is the first option that has been considered in relation to this decision?",
        section: "Options",
        section_id: "options",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "benefits",
        title: "What are the benefits of this option?",
        section: "Options",
        section_id: "options",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "risks",
        title: "What are the risks of this option?",
        section: "Options",
        section_id: "options",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "second_option",
        title: "Have other options been considered?",
        section: "Options",
        section_id: "options",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
        },
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "describe_second_option",
        title: "What is the second option that has been considered in relation to this decision?",
        section: "Options",
        section_id: "options",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
            second_option: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "second_option_benefits",
        title: "What are the benefits of this option?",
        section: "Options",
        section_id: "options",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
            second_option: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "second_option_risks",
        title: "What are the risks of this option?",
        section: "Options",
        section_id: "options",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
            second_option: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "third_option",
        title: "Have other options been considered?",
        section: "Options",
        section_id: "options",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
            second_option: true,
        },
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "describe_third_option",
        title: "What is the third option that has been considered in relation to this decision?",
        section: "Options",
        section_id: "options",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
            third_option: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "third_option_benefits",
        title: "What are the benefits of this option?",
        section: "Options",
        section_id: "options",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
            third_option: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "third_option_risks",
        title: "What are the risks of this option?",
        section: "Options",
        section_id: "options",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
            third_option: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },

    // Final Decision Section
    {
        id: "final_decision_describe",
        title: "What is the final decision that has been made?",
        section: "Final Decision",
        section_id: "final_decision",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "reasons",
        title: "What are the reasons for making this decision?",
        section: "Final Decision",
        section_id: "final_decision",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "other_options",
        title: "Why have other options (if any) been rejected?",
        section: "Final Decision",
        section_id: "final_decision",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "least_restrictive",
        title: "Is this option the least restrictive approach?",
        section: "Final Decision",
        section_id: "final_decision",
        // show_details: true,
        dependencies: {
            best_interest_decision_required: true,
        },
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "disagree",
        title: "Did anyone disagree with the decision?",
        section: "Final Decision",
        section_id: "final_decision",
        show_details: true,
        dependencies: {
            best_interest_decision_required: true,
        },
        placeholder: "Record who disagrees with the decision and why",
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "intend_to_proceed",
        title: "How do you intend to proceed with this in mind?",
        section: "Final Decision",
        section_id: "final_decision",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
            disagree: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "client_involved",
        title: "How was the client involved in this decision?",
        section: "Final Decision",
        section_id: "final_decision",
        show_details: false,
        dependencies: {
            best_interest_decision_required: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },

    // Review Section
    {
        id: "future_review",
        title: "Does this decision need to be reviewed again in future?",
        section: "Review",
        section_id: "review",
        show_details: true,
        dependencies: {
            best_interest_decision_required: true,
        },
        placeholder: "E.g. expected date of review",
        answer_type: {
            type: "boolean",
        },
    },
];
