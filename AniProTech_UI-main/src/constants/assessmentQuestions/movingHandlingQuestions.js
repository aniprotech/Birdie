export const MOVING_HANDLING_QUESTIONS = [
    // Client Specific Section
    {
        id: "fall_history",
        title: "Does {{firstname}} have a history of falls?",
        section: "Client Specific",
        section_id: "client_specific",
        show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "number_of_falls",
        title: "How many falls has {{firstname}} had in the last 12 months?",
        section: "Client Specific",
        section_id: "client_specific",
        show_details: true,
        dependencies: {
            fall_history: true
        },
        answer_type: {
            type: "number"
        }
    },
    {
        id: "weight_bear",
        title: "Can {{firstname}} weight bear?",
        section: "Client Specific",
        section_id: "client_specific",
        show_details: true,
        has_note_condition: {
            weight_bear: false
        },
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "pain_rest_or_movement",
        title: "Does {{firstname}} have any pain while resting or during movement?",
        section: "Client Specific",
        section_id: "client_specific",
        show_details: true,
        has_note_condition: {
            pain_rest_or_movement: true
        },
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "physique_move_or_hold",
        title: "Does {{firstname}}'s physique make them difficult to move or hold?",
        section: "Client Specific",
        section_id: "client_specific",
        show_details: true,
        has_note_condition: {
            physique_move_or_hold: true
        },
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "cognitive_impairment",
        title: "Does {{firstname}} have any cognitive impairments?",
        section: "Client Specific",
        section_id: "client_specific",
        show_details: true,
        has_note_condition: {
            cognitive_impairment: true
        },
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "challenging_behaviour",
        title: "Does {{firstname}} present with any challenging behaviour or can they be uncooperative, violent or aggressive?",
        section: "Client Specific",
        section_id: "client_specific",
        show_details: true,
        has_note_condition: {
            challenging_behaviour: true
        },
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "client_specific",
        title: "Are there any other client-specific concerns regarding moving or handling {{firstname}}?",
        section: "Client Specific",
        section_id: "client_specific",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },

    // Mobility Section
    {
        id: "walking_independence",
        title: "How independent is {{firstname}} when walking?",
        section: "Mobility",
        section_id: "mobility",
        default_show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "independent_without_equipment",
                    label: "Independent without equipment"
                },
                {
                    choice_id: "independent_with_equipment",
                    label: "Independent with equipment"
                },
                {
                    choice_id: "requires_some_assistance",
                    label: "Requires some assistance (minimal or moderate)"
                },
                {
                    choice_id: "fully_dependent",
                    label: "Unable/fully dependent"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "balancing_standing_independence",
        title: "How independent is {{firstname}} when balancing in the standing position?",
        section: "Mobility",
        section_id: "mobility",
        default_show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "independent_without_equipment",
                    label: "Independent without equipment"
                },
                {
                    choice_id: "independent_with_equipment",
                    label: "Independent with equipment"
                },
                {
                    choice_id: "requires_some_assistance",
                    label: "Requires some assistance (minimal or moderate)"
                },
                {
                    choice_id: "fully_dependent",
                    label: "Unable/fully dependent"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "stairs_independence",
        title: "How independent is {{firstname}} when ascending and descending stairs?",
        section: "Mobility",
        section_id: "mobility",
        default_show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "independent_without_equipment",
                    label: "Independent without equipment"
                },
                {
                    choice_id: "independent_with_equipment",
                    label: "Independent with equipment"
                },
                {
                    choice_id: "requires_some_assistance",
                    label: "Requires some assistance (minimal or moderate)"
                },
                {
                    choice_id: "fully_dependent",
                    label: "Unable/fully dependent"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "from_sitting_to_moving_independence",
        title: "How independent is {{firstname}} when moving from sitting to standing position?",
        section: "Mobility",
        section_id: "mobility",
        default_show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "independent_without_equipment",
                    label: "Independent without equipment"
                },
                {
                    choice_id: "independent_with_equipment",
                    label: "Independent with equipment"
                },
                {
                    choice_id: "requires_some_assistance",
                    label: "Requires some assistance (minimal or moderate)"
                },
                {
                    choice_id: "fully_dependent",
                    label: "Unable/fully dependent"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "sitting_balance",
        title: "Does {{firstname}} have limited sitting balance?",
        section: "Mobility",
        section_id: "mobility",
        show_details: true,
        has_note_condition: {
            sitting_balance: true
        },
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "lying_down_independence",
        title: "How independent is {{firstname}} when rolling or turning from side to side in bed?",
        section: "Mobility",
        section_id: "mobility",
        default_show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "independent_without_equipment",
                    label: "Independent without equipment"
                },
                {
                    choice_id: "independent_with_equipment",
                    label: "Independent with equipment"
                },
                {
                    choice_id: "requires_some_assistance",
                    label: "Requires some assistance (minimal or moderate)"
                },
                {
                    choice_id: "fully_dependent",
                    label: "Unable/fully dependent"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "sitting_down_independence",
        title: "How independent is {{firstname}} when moving from lying to sitting position?",
        section: "Mobility",
        section_id: "mobility",
        default_show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "independent_without_equipment",
                    label: "Independent without equipment"
                },
                {
                    choice_id: "independent_with_equipment",
                    label: "Independent with equipment"
                },
                {
                    choice_id: "requires_some_assistance",
                    label: "Requires some assistance (minimal or moderate)"
                },
                {
                    choice_id: "fully_dependent",
                    label: "Unable/fully dependent"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "other_mobility",
        title: "Are there any other mobility scenarios not listed here?",
        section: "Mobility",
        section_id: "mobility",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },

    // Transfers Section
    {
        id: "in_and_out_of_bed_independence",
        title: "How independent is {{firstname}} when getting in and out of their bed?",
        section: "Transfers",
        section_id: "transfers",
        default_show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "independent_without_equipment",
                    label: "Independent without equipment"
                },
                {
                    choice_id: "independent_with_equipment",
                    label: "Independent with equipment"
                },
                {
                    choice_id: "requires_some_assistance",
                    label: "Requires some assistance (minimal or moderate)"
                },
                {
                    choice_id: "fully_dependent",
                    label: "Unable/fully dependent"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "transferring_from_chair_to_shower_independence",
        title: "How independent is {{firstname}} when transferring from a chair to the bath or shower?",
        section: "Transfers",
        section_id: "transfers",
        default_show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "independent_without_equipment",
                    label: "Independent without equipment"
                },
                {
                    choice_id: "independent_with_equipment",
                    label: "Independent with equipment"
                },
                {
                    choice_id: "requires_some_assistance",
                    label: "Requires some assistance (minimal or moderate)"
                },
                {
                    choice_id: "fully_dependent",
                    label: "Unable/fully dependent"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "transferring_from_shower_to_chair_independence",
        title: "How independent is {{firstname}} when transferring from a bath or shower to a chair?",
        section: "Transfers",
        section_id: "transfers",
        default_show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "independent_without_equipment",
                    label: "Independent without equipment"
                },
                {
                    choice_id: "independent_with_equipment",
                    label: "Independent with equipment"
                },
                {
                    choice_id: "requires_some_assistance",
                    label: "Requires some assistance (minimal or moderate)"
                },
                {
                    choice_id: "fully_dependent",
                    label: "Unable/fully dependent"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "transferring_from_chair_to_bed_independence",
        title: "How independent is {{firstname}} when transferring from a chair or commode to a bed?",
        section: "Transfers",
        section_id: "transfers",
        default_show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "independent_without_equipment",
                    label: "Independent without equipment"
                },
                {
                    choice_id: "independent_with_equipment",
                    label: "Independent with equipment"
                },
                {
                    choice_id: "requires_some_assistance",
                    label: "Requires some assistance (minimal or moderate)"
                },
                {
                    choice_id: "fully_dependent",
                    label: "Unable/fully dependent"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "transferring_from_bed_to_chair_independence",
        title: "How independent is {{firstname}} when transferring from their bed to a chair or commode?",
        section: "Transfers",
        section_id: "transfers",
        default_show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "independent_without_equipment",
                    label: "Independent without equipment"
                },
                {
                    choice_id: "independent_with_equipment",
                    label: "Independent with equipment"
                },
                {
                    choice_id: "requires_some_assistance",
                    label: "Requires some assistance (minimal or moderate)"
                },
                {
                    choice_id: "fully_dependent",
                    label: "Unable/fully dependent"
                }
            ],
            type: "single_choice",
            variant: "radio"
        }
    },
    {
        id: "other_transfers",
        title: "Are there any other transfer scenarios not listed here?",
        section: "Transfers",
        section_id: "transfers",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },

    // Working Environment Section
    {
        id: "floor_surfaces",
        title: "Are there any problems with the floor surfaces?",
        section: "Working Environment",
        section_id: "working_environment",
        show_details: true,
        has_note_condition: {
            floor_surfaces: true
        },
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "bed_chair_low_to_ground",
        title: "Is the bed or chair low to the ground?",
        section: "Working Environment",
        section_id: "working_environment",
        default_show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "light_sufficient",
        title: "Is the lighting sufficient?",
        section: "Working Environment",
        section_id: "working_environment",
        show_details: true,
        set_no_details: true,
        has_note_condition: {
            light_sufficient: false
        },
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "risk_by_room_layout",
        title: "Are there any space constraints / risks caused by the room layout?",
        section: "Working Environment",
        section_id: "working_environment",
        show_details: true,
        has_note_condition: {
            risk_by_room_layout: true
        },
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "other_working_environment",
        title: "Other",
        subtitle: "Additional details (optional)",
        section: "Working Environment",
        section_id: "working_environment",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },

    // Equipment Section
    {
        id: "hoist",
        title: "Hoist",
        section: "Equipment",
        section_id: "equipment",
        show_details: false,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "hoist_last_service_date",
        title: "Last service date of hoist",
        section: "Equipment",
        section_id: "equipment",
        show_details: true,
        dependencies: {
            hoist: true
        },
        answer_type: {
            type: "date"
        }
    },
    {
        id: "hoist_last_service_details",
        title: "Additional details for last service",
        section: "Equipment",
        section_id: "equipment",
        show_details: false,
        dependencies: {
            hoist: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "hoist_next_service_date",
        title: "Next service date of hoist",
        section: "Equipment",
        section_id: "equipment",
        show_details: true,
        dependencies: {
            hoist: true
        },
        answer_type: {
            type: "date"
        }
    },
    {
        id: "hoist_next_service_details",
        title: "Additional details for next service",
        section: "Equipment",
        section_id: "equipment",
        show_details: false,
        dependencies: {
            hoist: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "stair_lift",
        title: "Stair lift",
        section: "Equipment",
        section_id: "equipment",
        show_details: false,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "stair_lift_last_service_date",
        title: "Last service date of stair lift",
        section: "Equipment",
        section_id: "equipment",
        show_details: true,
        dependencies: {
            stair_lift: true
        },
        answer_type: {
            type: "date"
        }
    },
    {
        id: "stair_lift_last_service_details",
        title: "Additional details for last service",
        section: "Equipment",
        section_id: "equipment",
        show_details: false,
        dependencies: {
            stair_lift: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "stair_lift_next_service_date",
        title: "Next service date of stair lift",
        section: "Equipment",
        section_id: "equipment",
        show_details: true,
        dependencies: {
            stair_lift: true
        },
        answer_type: {
            type: "date"
        }
    },
    {
        id: "stair_lift_next_service_details",
        title: "Additional details for next service",
        section: "Equipment",
        section_id: "equipment",
        show_details: false,
        dependencies: {
            stair_lift: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "sling",
        title: "Sling(s)",
        section: "Equipment",
        section_id: "equipment",
        show_details: false,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "sling_last_service_date",
        title: "Last service date of sling",
        section: "Equipment",
        section_id: "equipment",
        show_details: true,
        dependencies: {
            sling: true
        },
        answer_type: {
            type: "date"
        }
    },
    {
        id: "sling_last_service_details",
        title: "Additional details for last service",
        section: "Equipment",
        section_id: "equipment",
        show_details: false,
        dependencies: {
            sling: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "sling_next_service_date",
        title: "Next service date of sling",
        section: "Equipment",
        section_id: "equipment",
        show_details: true,
        dependencies: {
            sling: true
        },
        answer_type: {
            type: "date"
        }
    },
    {
        id: "sling_next_service_details",
        title: "Additional details for next service",
        section: "Equipment",
        section_id: "equipment",
        show_details: false,
        dependencies: {
            sling: true
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    },
    {
        id: "rollator_frame",
        title: "Rollator (or Zimmer) frame",
        section: "Equipment",
        section_id: "equipment",
        default_show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "wheeled_trolley",
        title: "Wheeled trolley",
        section: "Equipment",
        section_id: "equipment",
        default_show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "transfer_banana_board",
        title: "Transfer or banana board",
        section: "Equipment",
        section_id: "equipment",
        default_show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "electric_profiling_bed",
        title: "Electric profiling bed",
        section: "Equipment",
        section_id: "equipment",
        default_show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "rails_and_bumpers",
        title: "Rails and bumpers",
        section: "Equipment",
        section_id: "equipment",
        default_show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "personal_alarm_fall_detector",
        title: "Personal alarm or falls detector",
        section: "Equipment",
        section_id: "equipment",
        default_show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "commode",
        title: "Commode",
        section: "Equipment",
        section_id: "equipment",
        default_show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "perching_stool",
        title: "Perching stool",
        section: "Equipment",
        section_id: "equipment",
        default_show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "walking_stick",
        title: "Walking stick or quad stick",
        section: "Equipment",
        section_id: "equipment",
        default_show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "wheel_chair",
        title: "Wheelchair",
        section: "Equipment",
        section_id: "equipment",
        default_show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "riser_recliner_chair",
        title: "Riser-recliner chair",
        section: "Equipment",
        section_id: "equipment",
        default_show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "pressure_relief_cushion",
        title: "Pressure relief cushion",
        section: "Equipment",
        section_id: "equipment",
        default_show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "slide_sheets",
        title: "Slide sheets",
        section: "Equipment",
        section_id: "equipment",
        default_show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "electric_wheelchair",
        title: "Electric wheelchair",
        section: "Equipment",
        section_id: "equipment",
        default_show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "rotunda_stand",
        title: "Rotunda stand",
        section: "Equipment",
        section_id: "equipment",
        default_show_details: true,
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "other_equipment",
        title: "Other",
        subtitle: "Additional details (optional)",
        section: "Equipment",
        section_id: "equipment",
        // show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line"
        }
    }
]; 