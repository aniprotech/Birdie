export const ENVIRONMENTAL_AND_FIRE_QUESTIONS = [
    // Outside Section
    {
        id: "parking_available",
        title: "Is parking available?",
        section: "Outside",
        section_id: "outside",
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "where_parking_available",
        title: "Where is parking available?",
        section: "Outside",
        section_id: "outside",
        dependencies: {
            parking_available: true
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. directly outside the property, on the road."
    },
    {
        id: "risks_with_parking",
        title: "Are there any risks with parking?",
        section: "Outside",
        section_id: "outside",
        show_details: true,
        dependencies: {
            parking_available: true
        },
        has_note: [{ question_id: "risks_with_parking", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_parking",
        title: "How will these risks be mitigated?",
        section: "Outside",
        section_id: "outside",
        dependencies: {
            parking_available: true,
            risks_with_parking: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "steps_railings_outside_property",
        title: "Are there steps and railings outside the property?",
        section: "Outside",
        section_id: "outside",
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "risks_with_steps_railings",
        title: "Are there any risks with steps and railings?",
        section: "Outside",
        section_id: "outside",
        show_details: true,
        dependencies: {
            steps_railings_outside_property: true
        },
        has_note: [{ question_id: "risks_with_steps_railings", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_steps_railings",
        title: "How will these risks be mitigated?",
        section: "Outside",
        section_id: "outside",
        dependencies: {
            steps_railings_outside_property: true,
            risks_with_steps_railings: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "risks_with_outside_entrance",
        title: "Are there any risks with the outside entrance?",
        section: "Outside",
        section_id: "outside",
        show_details: true,
        has_note: [{ question_id: "risks_with_outside_entrance", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_outside_entrance",
        title: "How will these risks be mitigated?",
        section: "Outside",
        section_id: "outside",
        dependencies: {
            risks_with_outside_entrance: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "risks_with_doorbell",
        title: "Are there any risks with the doorbell?",
        section: "Outside",
        section_id: "outside",
        show_details: true,
        has_note: [{ question_id: "risks_with_doorbell", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_doorbell",
        title: "How will these risks be mitigated?",
        section: "Outside",
        section_id: "outside",
        dependencies: {
            risks_with_doorbell: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },

    // Security Section
    {
        id: "concerns_with_locks_on_doors",
        title: "Are there any concerns with locks on doors?",
        section: "Security",
        section_id: "security",
        show_details: true,
        has_note: [{ question_id: "concerns_with_locks_on_doors", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_locks_doors",
        title: "How will these risks be mitigated?",
        section: "Security",
        section_id: "security",
        dependencies: {
            concerns_with_locks_on_doors: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "risks_with_keys_windows_doors",
        title: "Are there any risks with keys to windows and doors?",
        section: "Security",
        section_id: "security",
        show_details: true,
        has_note: [{ question_id: "risks_with_keys_windows_doors", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_windows_doors",
        title: "How will these risks be mitigated?",
        section: "Security",
        section_id: "security",
        dependencies: {
            risks_with_keys_windows_doors: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "cctv_installed",
        title: "Does {{firstname}} have CCTV installed?",
        section: "Security",
        section_id: "security",
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "where_cctv_located",
        title: "Where is CCTV located?",
        section: "Security",
        section_id: "security",
        dependencies: {
            cctv_installed: true
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. in the living room."
    },
    {
        id: "risks_with_cctv",
        title: "Are there any risks with the CCTV?",
        section: "Security",
        section_id: "security",
        show_details: true,
        dependencies: {
            cctv_installed: true
        },
        has_note: [{ question_id: "risks_with_cctv", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_cctv",
        title: "How will these risks be mitigated?",
        section: "Security",
        section_id: "security",
        dependencies: {
            cctv_installed: true,
            risks_with_cctv: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "other_risks_related_entrance",
        title: "Are there any other risks related to the entrance?",
        section: "Security",
        section_id: "security",
        show_details: true,
        has_note: [{ question_id: "other_risks_related_entrance", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_related_entrance",
        title: "How will these risks be mitigated?",
        section: "Security",
        section_id: "security",
        dependencies: {
            other_risks_related_entrance: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },

    // Utilities Section
    {
        id: "where_gas_cut_off_point_located",
        title: "Where is the gas cut off point located?",
        section: "Utilities",
        section_id: "utilities",
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. in the outside cupboard."
    },
    {
        id: "risks_with_gas_cut_off_point",
        title: "Are there any risks with the gas cut off point?",
        section: "Utilities",
        section_id: "utilities",
        show_details: true,
        has_note: [{ question_id: "risks_with_gas_cut_off_point", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_gas_cut_off",
        title: "How will these risks be mitigated?",
        section: "Utilities",
        section_id: "utilities",
        dependencies: {
            risks_with_gas_cut_off_point: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "where_electricity_point_located",
        title: "Where is the electricity point located?",
        section: "Utilities",
        section_id: "utilities",
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. in the outside cupboard."
    },
    {
        id: "risks_with_electricity_cut_off_point",
        title: "Are there any risks with the electricity cut off point?",
        section: "Utilities",
        section_id: "utilities",
        show_details: true,
        has_note: [{ question_id: "risks_with_electricity_cut_off_point", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_electricity_cut_off",
        title: "How will these risks be mitigated?",
        section: "Utilities",
        section_id: "utilities",
        dependencies: {
            risks_with_electricity_cut_off_point: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "where_water_cut_off_point_located",
        title: "Where is the water cut off point located?",
        section: "Utilities",
        section_id: "utilities",
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. in the outside cupboard."
    },
    {
        id: "risks_with_water_cut_off_point",
        title: "Are there any risks with the water cut off point?",
        section: "Utilities",
        section_id: "utilities",
        show_details: true,
        has_note: [{ question_id: "risks_with_water_cut_off_point", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_water_cut_off",
        title: "How will these risks be mitigated?",
        section: "Utilities",
        section_id: "utilities",
        dependencies: {
            risks_with_water_cut_off_point: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },

    // Storage Section
    {
        id: "where_rubbish_storage_located",
        title: "Where is the rubbish storage located?",
        section: "Storage",
        section_id: "storage",
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. in the front garden."
    },
    {
        id: "risks_with_rubbish_storage",
        title: "Are there any risks with rubbish storage?",
        section: "Storage",
        section_id: "storage",
        show_details: true,
        has_note: [{ question_id: "risks_with_rubbish_storage", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_rubbish_storage",
        title: "How will these risks be mitigated?",
        section: "Storage",
        section_id: "storage",
        dependencies: {
            risks_with_rubbish_storage: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "where_medication_stored",
        title: "Where is medication stored?",
        section: "Storage",
        section_id: "storage",
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. in the kitchen drawer next to the sink."
    },
    {
        id: "risks_with_medication_storage",
        title: "Are there any risks with medication storage?",
        section: "Storage",
        section_id: "storage",
        show_details: true,
        has_note: [{ question_id: "risks_with_medication_storage", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_medication_storage",
        title: "How will these risks be mitigated?",
        section: "Storage",
        section_id: "storage",
        dependencies: {
            risks_with_medication_storage: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },

    // Visitors and Pets Section
    {
        id: "risks_with_other_residents_visitors",
        title: "Are there any risks with other residents and visitors?",
        section: "Visitors and pets",
        section_id: "visitors",
        show_details: true,
        has_note: [{ question_id: "risks_with_other_residents_visitors", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_residents_visitors",
        title: "How will these risks be mitigated?",
        section: "Visitors and pets",
        section_id: "visitors",
        dependencies: {
            risks_with_other_residents_visitors: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "pets_property",
        title: "Are there any pets in the property?",
        section: "Visitors and pets",
        section_id: "visitors",
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "pets_have",
        title: "What pets does {{firstname}} have?",
        section: "Visitors and pets",
        section_id: "visitors",
        dependencies: {
            pets_property: true
        },
        answer_type: {
            choices: [
                { choice_id: "dog", label: "Dog" },
                { choice_id: "cat", label: "Cat" },
                { choice_id: "hamster", label: "Hamster" },
                { choice_id: "bird", label: "Bird" },
                { choice_id: "other", label: "Other" }
            ],
            type: "multiple_choice"
        }
    },
    {
        id: "risks_with_pets",
        title: "Are there any risks with pets?",
        section: "Visitors and pets",
        section_id: "visitors",
        show_details: true,
        dependencies: {
            pets_property: true
        },
        has_note: [{ question_id: "risks_with_pets", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_risks_pets",
        title: "How will these risks be mitigated?",
        section: "Visitors and pets",
        section_id: "visitors",
        dependencies: {
            pets_property: true,
            risks_with_pets: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },

    // Living Area Section
    {
        id: "risks_with_doorway",
        title: "Are there any risks with the doorway?",
        section: "Living area",
        section_id: "living",
        show_details: true,
        has_note: [{ question_id: "risks_with_doorway", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_doorway",
        title: "How will these risks be mitigated?",
        section: "Living area",
        section_id: "living",
        dependencies: {
            risks_with_doorway: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "risks_with_walkway",
        title: "Are there any risks with the hallway?",
        section: "Living area",
        section_id: "living",
        show_details: true,
        has_note: [{ question_id: "risks_with_walkway", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_walkway",
        title: "How will these risks be mitigated?",
        section: "Living area",
        section_id: "living",
        dependencies: {
            risks_with_walkway: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "risks_with_rugs_carpets",
        title: "Are there any risks with rugs and carpets?",
        section: "Living area",
        section_id: "living",
        show_details: true,
        has_note: [{ question_id: "risks_with_rugs_carpets", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_rugs_carpets",
        title: "How will these risks be mitigated?",
        section: "Living area",
        section_id: "living",
        dependencies: {
            risks_with_rugs_carpets: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "risks_with_living_area_lighting",
        title: "Are there any risks with living area lighting?",
        section: "Living area",
        section_id: "living",
        show_details: true,
        has_note: [{ question_id: "risks_with_living_area_lighting", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_living_area",
        title: "How will these risks be mitigated?",
        section: "Living area",
        section_id: "living",
        dependencies: {
            risks_with_living_area_lighting: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "risks_with_electrical_cords_living_area",
        title: "Are there any risks with electrical cords in the living area?",
        section: "Living area",
        section_id: "living",
        show_details: true,
        has_note: [{ question_id: "risks_with_electrical_cords_living_area", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_cords_living_area",
        title: "How will these risks be mitigated?",
        section: "Living area",
        section_id: "living",
        dependencies: {
            risks_with_electrical_cords_living_area: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "other_risks_living_area",
        title: "Are there any other risks in the living area?",
        section: "Living area",
        section_id: "living",
        show_details: true,
        has_note: [{ question_id: "other_risks_living_area", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_other_risks_living_area",
        title: "How will these risks be mitigated?",
        section: "Living area",
        section_id: "living",
        dependencies: {
            other_risks_living_area: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },

    // Kitchen Section
    {
        id: "risks_with_taps",
        title: "Are there any risks with taps?",
        section: "Kitchen",
        section_id: "kitchen",
        show_details: true,
        has_note: [{ question_id: "risks_with_taps", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_taps",
        title: "How will these risks be mitigated?",
        section: "Kitchen",
        section_id: "kitchen",
        dependencies: {
            risks_with_taps: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "risks_with_electrical_cords_kitchen",
        title: "Are there any risks with electrical cords in the kitchen?",
        section: "Kitchen",
        section_id: "kitchen",
        show_details: true,
        has_note: [{ question_id: "risks_with_electrical_cords_kitchen", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_cords_kitchen",
        title: "How will these risks be mitigated?",
        section: "Kitchen",
        section_id: "kitchen",
        dependencies: {
            risks_with_electrical_cords_kitchen: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "risks_with_kitchen_flooring",
        title: "Are there any risks with the kitchen flooring?",
        section: "Kitchen",
        section_id: "kitchen",
        show_details: true,
        has_note: [{ question_id: "risks_with_kitchen_flooring", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_kitchen_flooring",
        title: "How will these risks be mitigated?",
        section: "Kitchen",
        section_id: "kitchen",
        dependencies: {
            risks_with_kitchen_flooring: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "risks_with_dishes_pots_pans_cutlery",
        title: "Are there any risks with dishes, pots, pans and cutlery?",
        section: "Kitchen",
        section_id: "kitchen",
        show_details: true,
        has_note: [{ question_id: "risks_with_dishes_pots_pans_cutlery", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_pans_cutlery",
        title: "How will these risks be mitigated?",
        section: "Kitchen",
        section_id: "kitchen",
        dependencies: {
            risks_with_dishes_pots_pans_cutlery: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "risks_with_fridge_freezer",
        title: "Are there any risks with the fridge and freezer?",
        section: "Kitchen",
        section_id: "kitchen",
        show_details: true,
        has_note: [{ question_id: "risks_with_fridge_freezer", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_fridge_freezer",
        title: "How will these risks be mitigated?",
        section: "Kitchen",
        section_id: "kitchen",
        dependencies: {
            risks_with_fridge_freezer: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "risks_with_cooker_oven_hob",
        title: "Are there any risks with the cooker, oven and hob?",
        section: "Kitchen",
        section_id: "kitchen",
        show_details: true,
        has_note: [{ question_id: "risks_with_cooker_oven_hob", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_oven_hob",
        title: "How will these risks be mitigated?",
        section: "Kitchen",
        section_id: "kitchen",
        dependencies: {
            risks_with_cooker_oven_hob: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "other_risks_kitchen",
        title: "Are there any other risks in the kitchen?",
        section: "Kitchen",
        section_id: "kitchen",
        show_details: true,
        has_note: [{ question_id: "other_risks_kitchen", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_other_risks_kitchen",
        title: "How will these risks be mitigated?",
        section: "Kitchen",
        section_id: "kitchen",
        dependencies: {
            other_risks_kitchen: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },

    // Bathroom Section
    {
        id: "risks_with_shower_bath",
        title: "Are there any risks with the shower and bath?",
        section: "Bathroom",
        section_id: "bathroom",
        show_details: true,
        has_note: [{ question_id: "risks_with_shower_bath", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_shower_bath",
        title: "How will these risks be mitigated?",
        section: "Bathroom",
        section_id: "bathroom",
        dependencies: {
            risks_with_shower_bath: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "risks_with_toilet",
        title: "Are there any risks with the toilet?",
        section: "Bathroom",
        section_id: "bathroom",
        show_details: true,
        has_note: [{ question_id: "risks_with_toilet", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_toilet",
        title: "How will these risks be mitigated?",
        section: "Bathroom",
        section_id: "bathroom",
        dependencies: {
            risks_with_toilet: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "risks_with_bathroom_flooring",
        title: "Are there any risks with the bathroom flooring?",
        section: "Bathroom",
        section_id: "bathroom",
        show_details: true,
        has_note: [{ question_id: "risks_with_bathroom_flooring", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_bathroom_flooring",
        title: "How will these risks be mitigated?",
        section: "Bathroom",
        section_id: "bathroom",
        dependencies: {
            risks_with_bathroom_flooring: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "other_risks_bathroom",
        title: "Are there any other risks in the bathroom?",
        section: "Bathroom",
        section_id: "bathroom",
        show_details: true,
        has_note: [{ question_id: "other_risks_bathroom", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_other_risks_bathroom",
        title: "How will these risks be mitigated?",
        section: "Bathroom",
        section_id: "bathroom",
        dependencies: {
            other_risks_bathroom: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },

    // Bedroom Section
    {
        id: "risks_with_bed",
        title: "Are there any risks with the bed?",
        section: "Bedroom",
        section_id: "bedroom",
        show_details: true,
        has_note: [{ question_id: "risks_with_bed", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_bed",
        title: "How will these risks be mitigated?",
        section: "Bedroom",
        section_id: "bedroom",
        dependencies: {
            risks_with_bed: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "risks_with_bedroom_flooring",
        title: "Are there any risks with the bedroom flooring?",
        section: "Bedroom",
        section_id: "bedroom",
        show_details: true,
        has_note: [{ question_id: "risks_with_bedroom_flooring", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_bedroom_flooring",
        title: "How will these risks be mitigated?",
        section: "Bedroom",
        section_id: "bedroom",
        dependencies: {
            risks_with_bedroom_flooring: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "concerns_with_electrical_cords_bedroom",
        title: "Are there any concerns with electrical cords in the bedroom?",
        section: "Bedroom",
        section_id: "bedroom",
        show_details: true,
        has_note: [{ question_id: "concerns_with_electrical_cords_bedroom", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_electrical_cords_bedroom",
        title: "How will these risks be mitigated?",
        section: "Bedroom",
        section_id: "bedroom",
        dependencies: {
            concerns_with_electrical_cords_bedroom: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "other_risks_bedroom",
        title: "Are there any other risks in the bedroom?",
        section: "Bedroom",
        section_id: "bedroom",
        show_details: true,
        has_note: [{ question_id: "other_risks_bedroom", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_other_risks_bedroom",
        title: "How will these risks be mitigated?",
        section: "Bedroom",
        section_id: "bedroom",
        dependencies: {
            other_risks_bedroom: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },

    // Fire Prevention Section
    {
        id: "where_smoke_detector(s)_located",
        title: "Where are the smoke detector(s) located?",
        section: "Fire prevention",
        section_id: "fire",
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. in the kitchen and in the hall."
    },
    {
        id: "risks_with_smoke_detectors",
        title: "Are there any risks with the smoke detector(s)?",
        section: "Fire prevention",
        section_id: "fire",
        show_details: true,
        has_note: [{ question_id: "risks_with_smoke_detectors", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_smoke_detector",
        title: "How will these risks be mitigated?",
        section: "Fire prevention",
        section_id: "fire",
        dependencies: {
            risks_with_smoke_detectors: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "risks_with_smokers_property",
        title: "Are there any risks with smokers in the property?",
        section: "Fire prevention",
        section_id: "fire",
        show_details: true,
        has_note: [{ question_id: "risks_with_smokers_property", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_smokers_property",
        title: "How will these risks be mitigated?",
        section: "Fire prevention",
        section_id: "fire",
        dependencies: {
            risks_with_smokers_property: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "where_fire_fighting_equipment_located",
        title: "Where is the fire fighting equipment located?",
        section: "Fire prevention",
        section_id: "fire",
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. the fire blanket is in the kitchen."
    },
    {
        id: "risks_with_fire_fighting_equipment",
        title: "Are there any risks with the fire fighting equipment?",
        section: "Fire prevention",
        section_id: "fire",
        show_details: true,
        has_note: [{ question_id: "risks_with_fire_fighting_equipment", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_fighting_equipment",
        title: "How will these risks be mitigated?",
        section: "Fire prevention",
        section_id: "fire",
        dependencies: {
            risks_with_fire_fighting_equipment: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "where_escape_routes_located",
        title: "Where are the escape routes located?",
        section: "Fire prevention",
        section_id: "fire",
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. via the front door and back door."
    },
    {
        id: "risks_with_escape_routes",
        title: "Are there any risks with the escape routes?",
        section: "Fire prevention",
        section_id: "fire",
        show_details: true,
        has_note: [{ question_id: "risks_with_escape_routes", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_escape_routes",
        title: "How will these risks be mitigated?",
        section: "Fire prevention",
        section_id: "fire",
        dependencies: {
            risks_with_escape_routes: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "escape_plan",
        title: "What is the escape plan?",
        section: "Fire prevention",
        section_id: "fire",
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. exit along the hall and out the front or back door."
    },
    {
        id: "risks_with_escape_plan",
        title: "Are there any risks with the escape plan?",
        section: "Fire prevention",
        section_id: "fire",
        show_details: true,
        has_note: [{ question_id: "risks_with_escape_plan", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_escape_plan",
        title: "How will these risks be mitigated?",
        section: "Fire prevention",
        section_id: "fire",
        dependencies: {
            risks_with_escape_plan: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "other_risks_related_fire_prevention",
        title: "Are there any other risks related to fire prevention?",
        section: "Fire prevention",
        section_id: "fire",
        show_details: true,
        has_note: [{ question_id: "other_risks_related_fire_prevention", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_fire_prevention",
        title: "How will these risks be mitigated?",
        section: "Fire prevention",
        section_id: "fire",
        dependencies: {
            other_risks_related_fire_prevention: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },

    // Carbon Monoxide Section
    {
        id: "where_carbon_monoxide_detector_located",
        title: "Where is the carbon monoxide detector located?",
        section: "Carbon monoxide",
        section_id: "carbon",
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. in the living room."
    },
    {
        id: "risks_with_carbon_monoxide_detector",
        title: "Are there any risks with the carbon monoxide detector?",
        section: "Carbon monoxide",
        section_id: "carbon",
        show_details: true,
        has_note: [{ question_id: "risks_with_carbon_monoxide_detector", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_carbon_monoxide_detector",
        title: "How will these risks be mitigated?",
        section: "Carbon monoxide",
        section_id: "carbon",
        dependencies: {
            risks_with_carbon_monoxide_detector: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    {
        id: "lone_worker_risks_related_environment_fire_aware_of",
        title: "Are there any lone worker risks related to environment and fire to be aware of?",
        section: "Carbon monoxide",
        section_id: "carbon",
        show_details: true,
        // has_note: [{ question_id: "lone_worker_risks_related_environment_fire_aware_of", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_lone_worker",
        title: "How will these risks be mitigated?",
        section: "Carbon monoxide",
        section_id: "carbon",
        dependencies: {
            lone_worker_risks_related_environment_fire_aware_of: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    }
    ,
        // Carbon Monoxide Section
    {
        id: "where_carbon_monoxide_detector_located",
        title: "Where is the carbon monoxide detector located?",
        section: "Carbon monoxide",
        section_id: "carbon",
        answer_type: {
            type: "text",
            variant: "multi_line"
        },
        placeholder: "e.g. in the living room."
    },
    {
        id: "risks_with_carbon_monoxide_detector",
        title: "Are there any risks with the carbon monoxide detector?",
        section: "Carbon monoxide",
        section_id: "carbon",
        show_details: true,
        has_note: [{ question_id: "risks_with_carbon_monoxide_detector", hasValue: true }],
        answer_type: {
            type: "boolean"
        }
    },
    {
        id: "how_will_these_risks_mitigated_carbon_monoxide_detector",
        title: "How will these risks be mitigated?",
        section: "Carbon monoxide",
        section_id: "carbon",
        dependencies: {
            risks_with_carbon_monoxide_detector: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },
    // {
    //     id: "lone_worker_risks_related_environment_fire_aware_of",
    //     title: "Are there any lone worker risks related to environment and fire to be aware of?",
    //     section: "Carbon monoxide",
    //     section_id: "carbon",
    //     show_details: true,
    //     has_note: [{ question_id: "lone_worker_risks_related_environment_fire_aware_of", hasValue: true }],
    //     answer_type: {
    //         type: "boolean"
    //     }
    // },
    {
        id: "how_will_these_risks_mitigated_lone_worker",
        title: "How will these risks be mitigated?",
        section: "Carbon monoxide",
        section_id: "carbon",
        dependencies: {
            lone_worker_risks_related_environment_fire_aware_of: ["true", "false"]
        },
        answer_type: {
            type: "text",
            variant: "multi_line"
        }
    },

]; 