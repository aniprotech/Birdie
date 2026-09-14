export const WATERLOW_QUESTIONS = [
    {
        id: "age",
        title: "Age",
        subtitle: "Choose one option",
        section: "Age",
        section_id: "age",
        show_details: true,
        answer_type: {
            type: "single_choice",
            variant: "radio",
            choices: [
                {
                    choice_id: "14-49",
                    label: "14 - 49"
                },
                {
                    choice_id: "50-64",
                    label: "50 - 64"
                },
                {
                    choice_id: "65-74",
                    label: "65 - 74"
                },
                {
                    choice_id: "75-80",
                    label: "75 - 80"
                },
                {
                    choice_id: "80+",
                    label: "80+"
                }
            ]
        }
    },
    {
        id: "age_score",
        title: "Add score",
        section: "Age",
        section_id: "age",
        show_details: true,
        answer_type: {
            type: "number"
        }
    },
    {
        id: "sex",
        title: "Sex",
        section: "Sex",
        section_id: "sex",
        show_details: true,
        answer_type: {
            type: "single_choice",
            variant: "radio",
            choices: [
                {
                    choice_id: "male",
                    label: "Male"
                },
                {
                    choice_id: "female",
                    label: "Female"
                }
            ]
        }
    },
    {
        id: "sex_score",
        title: "Add score",
        section: "Sex",
        section_id: "sex",
        show_details: true,
        answer_type: {
            type: "number"
        }
    },
    {
        id: "bmi",
        title: "BMI",
        subtitle: "Do you know {{firstname}}'s exact height and weight?",
        section: "BMI",
        section_id: "bmi",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "height",
        title: "Height",
        section: "BMI",
        section_id: "bmi",
        dependencies: {
            bmi: true
        },
        show_details: true,
        answer_type: {
            type: "height"
        }
    },
    {
        id: "weight",
        title: "Weight",
        section: "BMI",
        section_id: "bmi",
        dependencies: {
            bmi: true
        },
        show_details: true,
        answer_type: {
            type: "weight"
        }
    },
    {
        id: "estimated_bmi",
        title: "Build / weight for height",
        subtitle: "Choose one option",
        section: "BMI",
        section_id: "bmi",
        dependencies: {
            bmi: false
        },
        show_details: true,
        answer_type: {
            type: "single_choice",
            variant: "radio",
            choices: [
                {
                    choice_id: "average",
                    label: "Average (BMI = 20 - 24.9)"
                },
                {
                    choice_id: "above_average",
                    label: "Above average (BMI = 25 - 29.9)"
                },
                {
                    choice_id: "obese",
                    label: "Obese (BMI >30)"
                },
                {
                    choice_id: "below_average",
                    label: "Below average (BMI <20)"
                }
            ]
        }
    },
    {
        id: "bmi_score",
        title: "Add score",
        section: "BMI",
        section_id: "bmi",
        show_details: true,
        answer_type: {
            type: "number"
        }
    },
    {
        id: "continence",
        title: "Continence",
        subtitle: "Choose one option",
        section: "Continence",
        section_id: "continence",
        show_details: true,
        answer_type: {
            type: "single_choice",
            variant: "radio",
            choices: [
                {
                    choice_id: "complete_or_catheterised",
                    label: "Complete / catheterised"
                },
                {
                    choice_id: "urinary_incontinence",
                    label: "Urinary incontinence"
                },
                {
                    choice_id: "faecal_incontinence",
                    label: "Faecal incontinence"
                },
                {
                    choice_id: "urinary_faecal_incontinence",
                    label: "Urinary and faecal incontinence"
                }
            ]
        }
    },
    {
        id: "continence_score",
        title: "Add score",
        section: "Continence",
        section_id: "continence",
        show_details: true,
        answer_type: {
            type: "number"
        }
    },
    {
        id: "skin_type",
        title: "Skin type - Visual risk areas",
        subtitle: "Select more than one if necessary",
        section: "Skin type",
        section_id: "skin_type",
        show_details: true,
        answer_type: {
            type: "multiple_choice",
            choices: [
                {
                    choice_id: "healthy",
                    label: "Healthy"
                },
                {
                    choice_id: "tissue_paper",
                    label: "Tissue paper"
                },
                {
                    choice_id: "dry",
                    label: "Dry"
                },
                {
                    choice_id: "oedematous",
                    label: "Oedematous"
                },
                {
                    choice_id: "clammy_pyrexia",
                    label: "Clammy, pyrexia"
                },
                {
                    choice_id: "discoloured_grade_1",
                    label: "Discoloured / Grade 1"
                },
                {
                    choice_id: "broken_spots_grade_2_4",
                    label: "Broken spots / Grade 2 - 4"
                }
            ]
        }
    },
    {
        id: "skin_type_score",
        title: "Add score",
        section: "Skin type",
        section_id: "skin_type",
        show_details: true,
        answer_type: {
            type: "number"
        }
    },
    {
        id: "mobility",
        title: "Mobility",
        subtitle: "Choose one option",
        section: "Mobility",
        section_id: "mobility",
        show_details: true,
        answer_type: {
            type: "single_choice",
            variant: "radio",
            choices: [
                {
                    choice_id: "fully",
                    label: "Fully"
                },
                {
                    choice_id: "restless_fidgety",
                    label: "Restless / fidgety"
                },
                {
                    choice_id: "apathetic",
                    label: "Apathetic"
                },
                {
                    choice_id: "restricted",
                    label: "Restricted"
                },
                {
                    choice_id: "bedbound",
                    label: "Bedbound e.g. traction"
                },
                {
                    choice_id: "chairbound",
                    label: "Chair bound e.g. wheelchair"
                }
            ]
        }
    },
    {
        id: "mobility_score",
        title: "Add score",
        section: "Mobility",
        section_id: "mobility",
        show_details: true,
        answer_type: {
            type: "number"
        }
    },
    {
        id: "mst",
        title: "Malnutrition screening tool (MST)",
        subtitle: "Has {{firstname}} lost weight recently?",
        section: "Malnutrition",
        section_id: "malnutrition",
        show_details: true,
        answer_type: {
            type: "single_choice",
            variant: "radio",
            choices: [
                {
                    choice_id: "yes",
                    label: "Yes"
                },
                {
                    choice_id: "no",
                    label: "No"
                },
                {
                    choice_id: "unsure",
                    label: "Unsure"
                }
            ]
        }
    },
    {
        id: "weight_loss",
        title: "Weight loss",
        section: "Malnutrition",
        section_id: "malnutrition",
        dependencies: {
            mst: "yes"
        },
        show_details: true,
        answer_type: {
            type: "weight"
        }
    },
    {
        id: "appetite",
        title: "Appetite",
        subtitle: "Does {{firstname}} have a lack of appetite or are they eating poorly?",
        section: "Malnutrition",
        section_id: "malnutrition",
        dependencies: {
            mst: ["no", "unsure"]
        },
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "nutrition_score",
        title: "Add score",
        section: "Malnutrition",
        section_id: "malnutrition",
        show_details: true,
        answer_type: {
            type: "number"
        }
    },
    {
        id: "tissue_malnutrition",
        title: "Tissue malnutrition",
        subtitle: "Select more than one if necessary",
        section: "Tissue malnutrition",
        section_id: "tissue_malnutrition",
        show_details: true,
        answer_type: {
            type: "multiple_choice",
            choices: [
                {
                    choice_id: "terminal_cachexia",
                    label: "Terminal cachexia"
                },
                {
                    choice_id: "multiple_organ_failure",
                    label: "Multiple organ failure"
                },
                {
                    choice_id: "single_organ_failure",
                    label: "Single organ failure e.g. cardiac, renal, respiratory"
                },
                {
                    choice_id: "peripheral_vascular_disease",
                    label: "Peripheral vascular disease"
                },
                {
                    choice_id: "anaemia",
                    label: "Anaemia (Hb < 8)"
                },
                {
                    choice_id: "smoking",
                    label: "Smoking"
                },
                {
                    choice_id: "none_of_the_above",
                    label: "None of the above"
                }
            ]
        }
    },
    {
        id: "tissue_nutrition_score",
        title: "Add score",
        section: "Tissue malnutrition",
        section_id: "tissue_malnutrition",
        show_details: true,
        answer_type: {
            type: "number"
        }
    },
    {
        id: "diabetes_ms_cva_deficit",
        title: "Diabetes, MS, CVA",
        section: "Neurological deficit",
        section_id: "neurological_deficit",
        show_details: true,
        answer_type: {
            type: "single_choice",
            variant: "radio",
            choices: [
                {
                    choice_id: "not_applicable",
                    label: "Not applicable"
                },
                {
                    choice_id: "4",
                    label: "4"
                },
                {
                    choice_id: "5",
                    label: "5"
                },
                {
                    choice_id: "6",
                    label: "6"
                }
            ]
        }
    },
    {
        id: "motor_sensory_deficit",
        title: "Motor / sensory",
        section: "Neurological deficit",
        section_id: "neurological_deficit",
        show_details: true,
        answer_type: {
            type: "single_choice",
            variant: "radio",
            choices: [
                {
                    choice_id: "not_applicable",
                    label: "Not applicable"
                },
                {
                    choice_id: "4",
                    label: "4"
                },
                {
                    choice_id: "5",
                    label: "5"
                },
                {
                    choice_id: "6",
                    label: "6"
                }
            ]
        }
    },
    {
        id: "paraplegia_deficit",
        title: "Paraplegia",
        section: "Neurological deficit",
        section_id: "neurological_deficit",
        show_details: true,
        answer_type: {
            type: "single_choice",
            variant: "radio",
            choices: [
                {
                    choice_id: "not_applicable",
                    label: "Not applicable"
                },
                {
                    choice_id: "4",
                    label: "4"
                },
                {
                    choice_id: "5",
                    label: "5"
                },
                {
                    choice_id: "6",
                    label: "6"
                }
            ]
        }
    },
    {
        id: "neurological_deficit_score",
        title: "Add score",
        section: "Neurological deficit",
        section_id: "neurological_deficit",
        show_details: true,
        answer_type: {
            type: "number"
        }
    },
    {
        id: "major_surgery_trauma_history",
        title: "Has {{firstname}} had any spinal or orthopaedic surgery or trauma?",
        section: "Surgery / Trauma",
        section_id: "surgery_trauma",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "time_on_operating_table",
        title: "How long has {{firstname}} spent on the operating table?",
        subtitle: "Include any type of surgery. Scores can be discounted after 48 hours provided patient is recovering normally.",
        section: "Surgery / Trauma",
        section_id: "surgery_trauma",
        dependencies: {
            major_surgery_trauma_history: true
        },
        show_details: true,
        answer_type: {
            type: "single_choice",
            variant: "radio",
            choices: [
                {
                    choice_id: "more_than_2_hours",
                    label: "On table > 2hrs"
                },
                {
                    choice_id: "more_than_6_hours",
                    label: "On table > 6hrs"
                },
                {
                    choice_id: "none_above",
                    label: "None of the above"
                }
            ]
        }
    },
    {
        id: "surgery_or_trauma_score",
        title: "Add score",
        section: "Surgery / Trauma",
        section_id: "surgery_trauma",
        dependencies: {
            time_on_operating_table: true
        },
        show_details: true,
        answer_type: {
            type: "number"
        }
    },
    {
        id: "cytotoxic_anti_inflammatory_steroids_intake",
        title: "Cytotoxic, anti-inflammatory, long term / high dose steroid",
        section: "Medication",
        section_id: "medication",
        show_details: true,
        answer_type: {
            type: "single_choice",
            variant: "radio",
            choices: [
                {
                    choice_id: "none_of_these",
                    label: "None of these"
                },
                {
                    choice_id: "1",
                    label: "1"
                },
                {
                    choice_id: "2",
                    label: "2"
                },
                {
                    choice_id: "3",
                    label: "3"
                },
                {
                    choice_id: "4",
                    label: "4"
                }
            ]
        }
    },
    {
        id: "medication_score",
        title: "Add score",
        section: "Medication",
        section_id: "medication",
        show_details: true,
        answer_type: {
            type: "number"
        }
    },
    {
        id: "total_score",
        title: "Add TOTAL score",
        section: "Total score",
        section_id: "total_score",
        show_details: true,
        answer_type: {
            type: "number"
        }
    },
    {
        id: "risk_level",
        title: "What is {{firstname}}'s level of risk in regards to pressure sores?",
        section: "Risk level",
        section_id: "risk_level",
        show_details: true,
        answer_type: {
            type: "single_choice",
            variant: "radio",
            choices: [
                {
                    choice_id: "no_risk",
                    label: "No risk stated"
                },
                {
                    choice_id: "at_risk",
                    label: "At risk"
                },
                {
                    choice_id: "high_risk",
                    label: "High risk"
                },
                {
                    choice_id: "very_high_risk",
                    label: "Very high risk"
                }
            ]
        }
    }
];
