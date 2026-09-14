import React from 'react';
import AssessmentFormField from '../FormFields/AssessmentFormField';

const ChokingAssessment = ({ clientName }) => {
    const questions = {
        general: [
            {
                id: "confirmed_diagnosis_dysphagia",
                title: "Does {{firstname}} have a confirmed diagnosis of dysphagia?",
                answer_type: {
                    choices: [
                        { choice_id: "yes", label: "Yes" },
                        { choice_id: "no", label: "No" },
                        { choice_id: "dont_know", label: "Don't know" }
                    ],
                    type: "single_choice",
                    variant: "radio"
                },
                show_details: true
            },
            {
                id: "known_speech_language_therapy_team",
                title: "Is {{firstname}} known to the Speech and Language Therapy team?",
                answer_type: {
                    choices: [
                        { choice_id: "yes", label: "Yes" },
                        { choice_id: "no", label: "No" },
                        { choice_id: "dont_know", label: "Don't know" }
                    ],
                    type: "single_choice",
                    variant: "radio"
                },
                show_details: true
            },
            {
                id: "speech_language_therapy_(salt)_guidelines_eating_drinking",
                title: "Does {{firstname}} have Speech and Language Therapy (SALT) guidelines for eating and drinking?",
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
                answer_type: { type: "boolean" },
                dependencies: {
                    "speech_language_therapy_(salt)_guidelines_eating_drinking": "yes"
                }
            },
            {
                id: "why_arent_these_guidelines_being_followed",
                title: "Why aren't these guidelines being followed?",
                answer_type: {
                    type: "free_text",
                    variant: "multi_line"
                },
                dependencies: {
                    "these_guidelines_being_followed": false
                }
            }
        ],
        choking_history: [
            {
                id: "been_known_choking_incident_last_12_months",
                title: "Has there been a known choking incident in the last 12 months?",
                answer_type: { type: "boolean" },
                show_details: true
            },
            {
                id: "how_many_times_happened_last_12_months",
                title: "How many times has this happened in the last 12 months?",
                answer_type: {
                    type: "free_text",
                    variant: "single_line"
                },
                dependencies: {
                    "been_known_choking_incident_last_12_months": true
                }
            },
            {
                id: "eating_and_or_drinking_at_time_incident",
                title: "Was {{firstname}} eating and/or drinking at the time of the incident/s?",
                answer_type: { type: "boolean" },
                dependencies: {
                    "been_known_choking_incident_last_12_months": true
                }
            },
            {
                id: "being_eaten_and_or_drunk",
                title: "What was being eaten and/or drunk?",
                answer_type: {
                    type: "free_text",
                    variant: "multi_line"
                },
                dependencies: {
                    "eating_and_or_drinking_at_time_incident": true
                }
            },
            {
                id: "choking_incident_additional_details",
                title: "Additional details",
                answer_type: {
                    type: "free_text",
                    variant: "multi_line"
                },
                dependencies: {
                    "been_known_choking_incident_last_12_months": true
                }
            }
        ],
        behavioral_risks: [
            {
                id: "behaviours_increase_their_risk_choking",
                title: "Does {{firstname}} have any behaviours that increase their risk of choking?",
                answer_type: { type: "boolean" },
                show_details: true
            },
            {
                id: "strategies_place_manage_behaviour",
                title: "What strategies are in place to manage this behaviour?",
                answer_type: {
                    type: "free_text",
                    variant: "multi_line"
                },
                dependencies: {
                    "behaviours_increase_their_risk_choking": true
                }
            }
        ],
        eating_and_drinking_risks: [
            {
                id: "dentures",
                title: "Does {{firstname}} have dentures?",
                answer_type: { type: "boolean" }
            },
            {
                id: "usually_wear_these_eating_drinking",
                title: "Does {{firstname}} usually wear these for eating and drinking?",
                answer_type: { type: "boolean" },
                dependencies: {
                    "dentures": true
                }
            },
            {
                id: "why_not_wear_their_dentures_eating_drinking",
                title: "Why does {{firstname}} not wear their dentures when eating and drinking?",
                answer_type: {
                    type: "free_text",
                    variant: "multi_line"
                },
                dependencies: {
                    "usually_wear_these_eating_drinking": false
                }
            },
            {
                id: "frequently_continually_cough_before_during_after_eating",
                title: "Does {{firstname}} frequently or continually cough before, during or after eating?",
                answer_type: { type: "boolean" },
                show_details: true
            },
            {
                id: "frequently_continually_cough_before_during_after_drinking",
                title: "Does {{firstname}} frequently or continually cough before, during or after drinking?",
                answer_type: { type: "boolean" },
                show_details: true
            },
            {
                id: "ever_difficulty_breathing_whilst_they_eating",
                title: "Does {{firstname}} ever have difficulty breathing whilst they are eating?",
                answer_type: { type: "boolean" },
                show_details: true
            }
        ],
        eating_habits: [
            {
                id: "currently_able_chew_normal_diet",
                title: "Is {{firstname}} currently able to chew a normal diet?",
                answer_type: { type: "boolean" },
                show_details: true
            },
            {
                id: "started_eating_less",
                title: "Has {{firstname}} started eating less?",
                answer_type: { type: "boolean" },
                show_details: true
            },
            {
                id: "hold_food_their_mouth",
                title: "Does {{firstname}} hold food in their mouth?",
                answer_type: { type: "boolean" },
                show_details: true
            },
            {
                id: "lost_their_enjoyment_food",
                title: "Has {{firstname}} lost their enjoyment of food?",
                answer_type: { type: "boolean" },
                show_details: true
            }
        ],
        modifications: [
            {
                id: "food_texture_need_modified",
                title: "Does {{firstname}}'s food texture need to be modified?",
                answer_type: { type: "boolean" }
            },
            {
                id: "level_should_food_texture_according_iddsi_framework",
                title: "What level should {{firstname}}'s food texture be according to the IDDSI framework?",
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
                },
                dependencies: {
                    "food_texture_need_modified": true
                }
            },
            {
                id: "drinks_texture_need_modified",
                title: "Does {{firstname}}'s drinks texture need to be modified?",
                answer_type: { type: "boolean" }
            },
            {
                id: "level_should_drinks_texture_according_iddsi_framework",
                title: "What level should {{firstname}}'s drinks texture be according to the IDDSI framework?",
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
                },
                dependencies: {
                    "drinks_texture_need_modified": true
                }
            },
            {
                id: "how_should_these_prepared",
                title: "How should these be prepared?",
                answer_type: {
                    type: "free_text",
                    variant: "multi_line"
                },
                dependencies: {
                    "drinks_texture_need_modified": true
                }
            }
        ],
        equipment: [
            {
                id: "where_thickening_powder_stored",
                title: "Where is {{firstname}}'s thickening powder stored?",
                answer_type: {
                    type: "free_text",
                    variant: "multi_line"
                },
                dependencies: {
                    "drinks_texture_need_modified": true
                }
            },
            {
                id: "measuring_jug_preparing_thickened_fluids",
                title: "Does {{firstname}} have a measuring jug for preparing thickened fluids?",
                answer_type: { type: "boolean" },
                dependencies: {
                    "drinks_texture_need_modified": true
                }
            },
            {
                id: "where_kept",
                title: "Where is this kept?",
                answer_type: {
                    type: "free_text",
                    variant: "multi_line"
                },
                dependencies: {
                    "measuring_jug_preparing_thickened_fluids": true
                }
            },
            {
                id: "use_special_cutlery_cups_help_with_eating_drinking",
                title: "Does {{firstname}} use any special cutlery or cups to help with eating and drinking?",
                answer_type: { type: "boolean" },
                show_details: true
            }
        ],
        medication: [
            {
                id: "take_oral_medication",
                title: "Does {{firstname}} take oral medication?",
                answer_type: { type: "boolean" }
            },
            {
                id: "difficulties_swallowing_their_oral_medication",
                title: "Does {{firstname}} have difficulties swallowing their oral medication?",
                answer_type: { type: "boolean" },
                dependencies: {
                    "take_oral_medication": true
                }
            },
            {
                id: "strategies_place_help_take_their_medication_more_easily",
                title: "What strategies are in place to help {{firstname}} take their medication more easily?",
                answer_type: {
                    type: "free_text",
                    variant: "multi_line"
                },
                dependencies: {
                    "difficulties_swallowing_their_oral_medication": true
                }
            }
        ],
        risk_management: [
            {
                id: "other_risks_not_captured_here",
                title: "Are there any other risks not captured here?",
                answer_type: { type: "boolean" },
                show_details: true
            },
            {
                id: "can_do_reduce_their_risk_choking",
                title: "What can {{firstname}} do to reduce their risk of choking?",
                answer_type: {
                    type: "free_text",
                    variant: "multi_line"
                }
            },
            {
                id: "should_care_team_do_reduce_risk_choking",
                title: "What should the care team do to reduce risk of {{firstname}} choking?",
                answer_type: {
                    type: "free_text",
                    variant: "multi_line"
                }
            },
            {
                id: "warning_signs_might_choking",
                title: "What are the warning signs that {{firstname}} might be choking?",
                answer_type: {
                    type: "free_text",
                    variant: "multi_line"
                }
            },
            {
                id: "how_should_carers_support_if_they_begin_choking",
                title: "How should carers support {{firstname}} if they begin choking?",
                answer_type: {
                    type: "free_text",
                    variant: "multi_line"
                }
            }
        ]
    };

    const renderSection = (section, title) => (
        <div key={title} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <div className="space-y-6">
                {section.map((question) => (
                    <AssessmentFormField
                        key={question.id}
                        field={question}
                        clientName={clientName}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {renderSection(questions.general, "General")}
            {renderSection(questions.choking_history, "Choking History")}
            {renderSection(questions.behavioral_risks, "Behavioural Risks")}
            {renderSection(questions.eating_and_drinking_risks, "Eating and Drinking Risks")}
            {renderSection(questions.eating_habits, "Eating Habits")}
            {renderSection(questions.modifications, "Modifications")}
            {renderSection(questions.equipment, "Equipment")}
            {renderSection(questions.medication, "Medication")}
            {renderSection(questions.risk_management, "Risk Management")}
        </div>
    );
};

export default ChokingAssessment; 