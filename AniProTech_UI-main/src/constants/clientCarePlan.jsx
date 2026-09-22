import {
    Bath,
    CalendarClock,
    Users,
    Home,
    Utensils,
    Stethoscope,
    FileSpreadsheet,
    Brain,
    MessageSquare,
    FileHeart,
    Microscope,
    Droplets,
    Heart,
    Flame,
    PiggyBank,
    Pill,
    MoveVertical,
    ShieldAlert,
    Zap,
    Activity,
    ClipboardCheck,
    FileCheck,
    FileText,
    Download,
    FileSignature,
    UserCircle,
    Settings,
} from "lucide-react";
import { COVID_19_QUESTIONS } from "./covidQuestions";
import { DYSPHAGIA_QUESTIONS } from "./dysphagiaQuestions";
import { END_OF_LIFE_QUESTIONS } from "./endOfLifeQuestions";
import { ENVIRONMENTAL_AND_FIRE_QUESTIONS } from "./environmentalAndFireQuestions";
import { FINANCIAL_QUESTIONS } from "./assessmentQuestions/financialQuestions";
import { MEDICATION_QUESTIONS } from "./assessmentQuestions/medicationQuestions";
import { MENTAL_CAPACITY_QUESTIONS } from "./assessmentQuestions/mentalCapacityQuestion";
import { MOVING_HANDLING_QUESTIONS } from "./assessmentQuestions/movingHandlingQuestions";
import { RESTRICTIVE_PRACTICE_QUESTIONS } from "./assessmentQuestions/restrictivePracticeQuestions";
import { SEIZURES_QUESTIONS } from "./assessmentQuestions/seizuresQuestions";
import { WATERLOW_QUESTIONS } from "./assessmentQuestions/waterlowQuestions";
import { CLIENT_FEEDBACK_QUESTIONS } from "./assessmentQuestions/clientFeedbackQuestions";
import { COURTESY_CALL_QUESTIONS } from "./assessmentQuestions/courtesyCallQuestions";
import { SERVICE_REVIEW_QUESTIONS } from "./assessmentQuestions/serviceReviewQuestions";
import APIConfig from "../utils/ApiConfig";

export const assessmentIcons = {
    "personal-care": Bath,
    "everyday-activities": CalendarClock,
    "social-support": Users,
    environmental: Home,
    "nutrition-hydration": Utensils,
    medical: Stethoscope,
    administration: FileSpreadsheet,
    psychological: Brain,

    // AdditionalAssessments
    behaviour: MessageSquare,
    communication: MessageSquare,
    "condition-specific": FileHeart,
    covid: Microscope,
    "control-substances": ShieldAlert,
    dysphagia: Droplets,
    "end-of-life": Heart,
    "environment-fire": Flame,
    financial: PiggyBank,
    medication: Pill,
    "mental-capacity": Brain,
    "moving-handling": MoveVertical,
    "restrictive-practice": ShieldAlert,
    seizures: Zap,
    waterlow: Activity,

    // Auditing Documents
    "client-feedback": ClipboardCheck,
    "courtesy-call": FileCheck,
    "service-review": FileText,

    // Documents
    "signature-document": FileSignature,
    "upload-documents": FileText,
    "download-document": Download,
};

export const ASSESSMENT_OPTIONS = [
    // { label: "Select Assessment", value: "" },
    { label: "Administrative", value: "ADMINISTRATIVE" },
    { label: "Behaviour", value: "BEHAVIOUR" },
    { label: "Communication", value: "COMMUNICATION" },
    { label: "Covid-19", value: "COVID_19" },
    { label: "Dysphagia", value: "DYSPHAGIA" },
    { label: "End Of Life", value: "END_OF_LIFE" },
    { label: "Environment And Fire", value: "ENVIRONMENT_AND_FIRE" },
    { label: "Environmental", value: "ENVIRONMENTAL" },
    { label: "Everyday Activities", value: "EVERYDAY_ACTIVITIES" },
    { label: "Financial", value: "FINANCIAL" },
    { label: "Medical", value: "MEDICAL" },
    { label: "Medication", value: "MEDICATION" },
    { label: "Mental Capacity", value: "MENTAL_CAPACITY" },
    { label: "Moving And Handling", value: "MOVING_AND_HANDLING" },
    { label: "Nutrition And Hydration", value: "NUTRITION_AND_HYDRATION" },
    { label: "Personal Care", value: "PERSONAL_CARE" },
    { label: "Psychological", value: "PSYCHOLOGICAL" },
    { label: "Restrictive Practice", value: "RESTRICTIVE_PRACTICE" },
    { label: "Seizures", value: "SEIZURES" },
    { label: "Social Support", value: "SOCIAL_SUPPORT" },
    { label: "Waterlow", value: "WATERLOW" },
];

export const RISK_LEVEL_OPTIONS = [
    { label: "Select Risk Level", value: "" },
    { label: "Low", value: "LOW" },
    { label: "Medium", value: "MEDIUM" },
    { label: "High", value: "HIGH" },
];

export const PERSONAL_CARE_QUESTIONS = [
    {
        id: "bathing_washing_independence",
        title: "Can {{firstname}} wash themself?",
        section: "Bathing",
        section_id: "bathing",
        subtitle: null,
        answer_type: {
            choices: [
                {
                    choice_id: "independently",
                    label: "Yes, independently (with or without equipment)",
                },
                {
                    choice_id: "semi_indepently",
                    label: "Yes, with help",
                },
                {
                    choice_id: "fully_dependent",
                    label: "No, fully dependent",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "oral_hygiene_maintenance",
        title: "Can {{firstname}} maintain oral hygiene?",
        section: "Oral Hygiene",
        section_id: "oral_hygiene",
        subtitle: null,
        answer_type: {
            choices: [
                {
                    choice_id: "independently",
                    label: "Yes, independently",
                },
                {
                    choice_id: "semi_indepently",
                    label: "Yes, with help",
                },
                {
                    choice_id: "fully_dependent",
                    label: "No, fully dependent",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "oral_hygiene_dentures",
        title: "Does {{firstname}} wear dentures?",
        section: "Oral Hygiene",
        show_details: true,
        section_id: "oral_hygiene",
        subtitle: null,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "personal_appearance_maintenance",
        title: "Can {{firstname}} maintain their personal appearance?",
        section: "Personal Appearance",
        section_id: "personal_appearance",
        subtitle: null,
        answer_type: {
            choices: [
                {
                    choice_id: "independently",
                    label: "Yes, independently",
                },
                {
                    choice_id: "semi_indepently",
                    label: "Yes, with help",
                },
                {
                    choice_id: "fully_dependent",
                    label: "No, fully dependent",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "personal_appearance_dressing_independence",
        title: "Can {{firstname}} dress themself?",
        section: "Personal Appearance",
        section_id: "personal_appearance",
        subtitle: null,
        answer_type: {
            choices: [
                {
                    choice_id: "independently",
                    label: "Yes, independently (with or without equipment)",
                },
                {
                    choice_id: "semi_independently",
                    label: "Yes, with help",
                },
                {
                    choice_id: "fully_dependent",
                    label: "No, fully dependent",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "toilet_independence",
        title: "Can {{firstname}} toilet themself?",
        section: "Toilet",
        section_id: "toilet",
        subtitle: null,
        answer_type: {
            choices: [
                {
                    choice_id: "independently",
                    label: "Yes, independently",
                },
                {
                    choice_id: "semi_indepently",
                    label: "Yes, with help",
                },
                {
                    choice_id: "fully_dependent",
                    label: "No, fully dependent",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "toilet_bowel_control",
        title: "Does {{firstname}} have control over their bowels?",
        section: "Toilet",
        section_id: "toilet",
        subtitle: null,
        answer_type: {
            choices: [
                {
                    choice_id: "continent",
                    label: "Continent",
                },
                {
                    choice_id: "semi_continent",
                    label: "Occasional accident",
                },
                {
                    choice_id: "incontinent",
                    label: "Incontinent",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "toilet_bladder_control",
        title: "Does {{firstname}} have control over their bladder?",
        section: "Toilet",
        section_id: "toilet",
        subtitle: null,
        answer_type: {
            choices: [
                {
                    choice_id: "continent",
                    label: "Continent",
                },
                {
                    choice_id: "semi_continent",
                    label: "Occasional accident",
                },
                {
                    choice_id: "incontinent",
                    label: "Incontinent",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "toilet_support_types",
        title: "Does {{firstname}} need support with the following?",
        section: "Toilet",
        section_id: "toilet",
        subtitle: null,
        answer_type: {
            choices: [
                {
                    choice_id: "catheter",
                    label: "Catheter",
                },
                {
                    choice_id: "incontinence_pad",
                    label: "Incontinence pad",
                },
                {
                    choice_id: "stoma_bag",
                    label: "Stoma bag",
                },
                {
                    choice_id: "other",
                    label: "Other (please specify)",
                },
            ],
            type: "multiple_choice",
        },
    },
];

export const EVERYDAY_ACTIVITIES_QUESTIONS = [
    {
        id: "everyday_activities_shopping_dependence",
        title: "Can {{firstname}} do their shopping?",
        section: "Everyday activities",
        section_id: "everyday_activities",
        subtitle: null,
        answer_type: {
            choices: [
                {
                    choice_id: "independent",
                    label: "Yes, independently",
                },
                {
                    choice_id: "semi_independent",
                    label: "Yes, with help",
                },
                {
                    choice_id: "fully_dependent",
                    label: "No, fully dependent",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "everyday_activities_telephone_dependence",
        title: "Can {{firstname}} use the telephone?",
        section: "Everyday activities",
        section_id: "everyday_activities",
        subtitle: null,
        answer_type: {
            choices: [
                {
                    choice_id: "independent",
                    label: "Yes, independently",
                },
                {
                    choice_id: "semi_independent",
                    label: "Yes, with help",
                },
                {
                    choice_id: "fully_dependent",
                    label: "No, fully dependent",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "everyday_activities_laundry_dependence",
        title: "Can {{firstname}} do their laundry?",
        section: "Everyday activities",
        section_id: "everyday_activities",
        subtitle: null,
        answer_type: {
            choices: [
                {
                    choice_id: "independent",
                    label: "Yes, independently",
                },
                {
                    choice_id: "semi_independent",
                    label: "Yes, with help",
                },
                {
                    choice_id: "fully_dependent",
                    label: "No, fully dependent",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "falls_and_mobility_had_fall",
        title: "Has {{firstname}} had a fall before?",
        section: "Falls and mobility",
        section_id: "falls_and_mobility",
        subtitle: null,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "falls_and_mobility_number",
        title: "How many times?",
        section: "Falls and mobility",
        section_id: "falls_and_mobility",
        subtitle: null,
        answer_type: {
            type: "number",
        },
    },
    {
        id: "falls_and_mobility_when",
        title: "When and where did {{firstname}} fall?",
        section: "Falls and mobility",
        section_id: "falls_and_mobility",
        subtitle: null,
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "falls_and_mobility_dependence",
        title: "What is {{firstname}}'s level of mobility?",
        section: "Falls and mobility",
        section_id: "falls_and_mobility",
        subtitle: null,
        answer_type: {
            choices: [
                {
                    choice_id: "independent",
                    label: "Independent",
                },
                {
                    choice_id: "semi_independent_with_aids",
                    label: "Independent with aids / equipment",
                },
                {
                    choice_id: "dependent",
                    label: "Dependent - requires help from one person",
                },
                {
                    choice_id: "fully_dependent",
                    label: "Immobile",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "falls_and_mobility_support_types",
        title: "To support their mobility, {{firstname}} uses:",
        section: "Falls and mobility",
        section_id: "falls_and_mobility",
        subtitle: null,
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "walking_stick",
                    label: "Walking stick or quad stick",
                },
                {
                    choice_id: "rollator",
                    label: "Rollator or zimmer frame",
                },
                {
                    choice_id: "wheelchair",
                    label: "Wheelchair",
                },
                {
                    choice_id: "none",
                    label: "None",
                },
                {
                    choice_id: "other",
                    label: "Other (please specify)",
                },
            ],
            type: "multiple_choice",
        },
    },
    {
        id: "sensory_vision_dependence",
        title: "How is {{firstname}}'s vision?",
        section: "Sensory needs",
        section_id: "sensory",
        subtitle: null,
        answer_type: {
            choices: [
                {
                    choice_id: "unimpaired",
                    label: "Unimpaired",
                },
                {
                    choice_id: "impaired",
                    label: "Impaired - but they can do everything they would like to do (with or without aids)",
                },
                {
                    choice_id: "semi_independent",
                    label: "They require some support",
                },
                {
                    choice_id: "fully_dependent",
                    label: "They are fully dependent",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "sensory_hearing_dependence",
        title: "How is {{firstname}}'s hearing?",
        section: "Sensory needs",
        section_id: "sensory",
        subtitle: null,
        answer_type: {
            choices: [
                {
                    choice_id: "unimpaired",
                    label: "Unimpaired",
                },
                {
                    choice_id: "impaired",
                    label: "Impaired - but they can do everything they would like to do (with or without aids)",
                },
                {
                    choice_id: "semi_independent",
                    label: "They require some support",
                },
                {
                    choice_id: "fully_dependent",
                    label: "They are fully dependent",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "sensory_speech_dependence",
        title: "How is {{firstname}}'s speech?",
        section: "Sensory needs",
        section_id: "sensory",
        subtitle: null,
        answer_type: {
            choices: [
                {
                    choice_id: "unimpaired",
                    label: "Unimpaired",
                },
                {
                    choice_id: "impaired",
                    label: "Impaired - but they can do everything they would like to do (with or without aids)",
                },
                {
                    choice_id: "semi_independent",
                    label: "They require some support",
                },
                {
                    choice_id: "fully_dependent",
                    label: "They are fully dependent",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
];

export const SOCIAL_SUPPORT_QUESTIONS = [
    {
        id: "housemates",
        title: "Who does {{firstname}} live with?",
        subtitle: null,
        section: "Living Arrangement",
        section_id: "living_arrangement",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "spouse",
                    label: "Spouse",
                },
                {
                    choice_id: "social_support.living_arrangements_section.child_answer",
                    label: "Son / daughter",
                },
                {
                    choice_id: "alone",
                    label: "No one",
                },
                {
                    choice_id: "other",
                    label: "Other (please specify)",
                },
            ],
            type: "multiple_choice",
        },
    },
    {
        id: "informal_care",
        title: "Does {{firstname}} receive any informal care?",
        subtitle: null,
        section: "Informal Care",
        section_id: "informal_care",
        show_details: false,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "informal_care_providers",
        title: "Who is this provided by?",
        subtitle: null,
        section: "Informal Care",
        section_id: "informal_care",
        show_details: true,
        dependencies: {
            informal_care: true,
        },
        answer_type: {
            choices: [
                {
                    choice_id: "family_member",
                    label: "Family member",
                },
                {
                    choice_id: "spouse",
                    label: "Spouse",
                },
                {
                    choice_id: "cleaner",
                    label: "Cleaner",
                },
                {
                    choice_id: "neighbour",
                    label: "Neighbour",
                },
                {
                    choice_id: "other",
                    label: "Other (please specify)",
                },
            ],
            type: "multiple_choice",
        },
    },
    {
        id: "informal_care_type",
        title: "How is {{firstname}} supported by their informal carer?",
        subtitle: null,
        section: "Informal Care",
        section_id: "informal_care",
        show_details: false,
        dependencies: {
            informal_care: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "informal_care_concerns",
        title: "Are there any concerns around the wellbeing of {{firstname}}'s informal carer(s)?",
        subtitle: null,
        section: "Informal Care",
        section_id: "informal_care",
        show_details: true,
        dependencies: {
            informal_care: true,
        },
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "formal_care",
        title: "Does {{firstname}} receive any formal care?",
        subtitle: null,
        section: "Formal Care",
        section_id: "formal_care",
        show_details: false,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "formal_care_type",
        title: "What type of formal care does {{firstname}} receive?",
        subtitle: null,
        section: "Formal Care",
        section_id: "formal_care",
        show_details: false,
        dependencies: {
            formal_care: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
];

export const ENVIRONMENTAL_QUESTIONS = [
    {
        id: "home_type",
        title: "Which type of home does {{firstname}} live in?",
        subtitle: null,
        section: "House",
        section_id: "home_environment",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "flat",
                    label: "Flat",
                },
                {
                    choice_id: "bungalow",
                    label: "Bungalow",
                },
                {
                    choice_id: "house",
                    label: "House",
                },
                {
                    choice_id: "sheltered_housing",
                    label: "Sheltered housing / assisted living",
                },
                {
                    choice_id: "other",
                    label: "Other (please specify)",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "home_concerns",
        title: "Does {{firstname}} have any concerns about their home?",
        subtitle: null,
        section: "House",
        section_id: "home_environment",
        show_details: true,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "home_stair_complete",
        title: "Does {{firstname}} have to complete any stairs (up and down) in a day",
        subtitle: null,
        section: "House",
        section_id: "home_environment",
        show_details: false,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "home_stair_flights",
        title: "How many?",
        subtitle: null,
        section: "House",
        section_id: "home_environment",
        show_details: true,
        dependencies: {
            home_stair_complete: true,
        },
        answer_type: {
            type: "number",
        },
    },
    {
        id: "pets",
        title: "Does {{firstname}} have any pets?",
        subtitle: null,
        section: "Home Environment",
        section_id: "pets_lifestyle",
        show_details: false,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "pet_types",
        title: "Which pet(s) does {{firstname}} have?",
        subtitle: null,
        section: "Home Environment",
        section_id: "pets_lifestyle",
        show_details: true,
        dependencies: {
            pets: true,
        },
        answer_type: {
            choices: [
                {
                    choice_id: "dog",
                    label: "Dog",
                },
                {
                    choice_id: "cat",
                    label: "Cat",
                },
                {
                    choice_id: "hamster",
                    label: "Hamster",
                },
                {
                    choice_id: "bird",
                    label: "Bird",
                },
                {
                    choice_id: "other",
                    label: "Other (please specify)",
                },
            ],
            type: "multiple_choice",
        },
    },
    {
        id: "smoking",
        title: "Does {{firstname}} smoke?",
        subtitle: null,
        section: "Home Environment",
        section_id: "pets_lifestyle",
        show_details: true,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "housekeeping_dependence",
        title: "Can {{firstname}} do their housekeeping (cleaning)?",
        subtitle: null,
        section: "Housekeeping",
        section_id: "housekeeping",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "independent",
                    label: "Yes, independently",
                },
                {
                    choice_id: "semi_independent",
                    label: "Yes, with help",
                },
                {
                    choice_id: "fully_dependent",
                    label: "No, fully dependent",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "housekeeping_support",
        title: "Does {{firstname}} have any support for their housekeeping (cleaning)?",
        subtitle: null,
        section: "Housekeeping",
        section_id: "housekeeping",
        show_details: true,
        answer_type: {
            type: "boolean",
        },
    },
];

export const NUTRITION_HYDRATION_QUESTIONS = [
    {
        id: "relative_appetite",
        title: "What is {{firstname}}'s appetite like?",
        subtitle: null,
        section: "Appetite and swallow",
        section_id: "appetite_swallowing",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "normal",
                    label: "Normal for them",
                },
                {
                    choice_id: "less_than_normal",
                    label: "Less than normal",
                },
                {
                    choice_id: "more_than_normal",
                    label: "More than normal",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "ability_to_swallow",
        title: "What is {{firstname}}'s swallow like?",
        subtitle: null,
        section: "Appetite and swallow",
        section_id: "appetite_swallowing",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "normal",
                    label: "Able to swallow safely",
                },
                {
                    choice_id: "impaired_with_fluids",
                    label: "Impaired when swallowing fluids",
                },
                {
                    choice_id: "impaired_with_solids",
                    label: "Impaired when swallowing solids",
                },
            ],
            type: "multiple_choice",
        },
    },
    {
        id: "medical_conditions_affecting_swallow",
        title: "Detail any medical conditions affecting swallow",
        section: "Appetite and swallow",
        section_id: "appetite_swallowing",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "ability_to_self_feed",
        title: "Can {{firstname}} feed themself?",
        subtitle: null,
        section: "Feeding",
        section_id: "eating_meal_prep",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "independently",
                    label: "Yes, independently",
                },
                {
                    choice_id: "semi_independently",
                    label: "Yes, with help",
                },
                {
                    choice_id: "fully_dependent",
                    label: "No, fully dependent",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "ability_to_prepare_light_meals_or_snacks",
        title: "Can {{firstname}} prepare a light meal or snack?",
        subtitle: null,
        section: "Feeding",
        section_id: "eating_meal_prep",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "independently",
                    label: "Yes, independently",
                },
                {
                    choice_id: "semi_independently",
                    label: "Yes, with help",
                },
                {
                    choice_id: "fully_dependent",
                    label: "No, fully dependent",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "ability_to_cook_meals",
        title: "Can {{firstname}} cook their meals?",
        subtitle: null,
        section: "Feeding",
        section_id: "eating_meal_prep",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "independently",
                    label: "Yes, independently",
                },
                {
                    choice_id: "semi_independently",
                    label: "Yes, with help",
                },
                {
                    choice_id: "fully_dependent",
                    label: "No, fully dependent",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "care_recipient_weight",
        title: "How much does {{firstname}} weigh?",
        section: "Weight",
        section_id: "weight_must",
        show_details: false,
        answer_type: {
            type: "weight",
        },
    },
    {
        id: "weight_stability",
        title: "Is {{firstname}}'s weight stable or unstable?",
        section: "Weight",
        section_id: "weight_must",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "stable",
                    label: "Stable",
                },
                {
                    choice_id: "unstable",
                    label: "Unstable",
                },
                {
                    choice_id: "dont_know",
                    label: "Don't know",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "care_recipient_must_score",
        title: "What is {{firstname}}'s MUST score?",
        section: "Weight",
        section_id: "weight_must",
        show_details: false,
        answer_type: {
            type: "number",
        },
    },
    {
        id: "food_alergies",
        title: "Does {{firstname}} have any food and drink allergies and/or intolerances?",
        section: "Dietary Requirements",
        section_id: "dietary_requirements",
        show_details: false,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "present_food_alergies",
        title: "What allergies and/or intolerances does {{firstname}} have?",
        section: "Dietary Requirements",
        section_id: "dietary_requirements",
        show_details: false,
        dependencies: {
            food_alergies: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "allergies_impact",
        title: "How do these allergies and/or intolerances impact {{firstname}}?",
        section: "Dietary Requirements",
        section_id: "dietary_requirements",
        show_details: false,
        dependencies: {
            food_alergies: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "diet_type",
        title: "Describe {{firstname}}'s diet type",
        section: "Dietary Requirements",
        section_id: "dietary_requirements",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "dietary_likes",
        title: "Detail {{firstname}}'s dietary likes and preferences",
        section: "Dietary Requirements",
        section_id: "dietary_requirements",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "dietary_dislikes",
        title: "Detail {{firstname}}'s dietary dislikes",
        section: "Dietary Requirements",
        section_id: "dietary_requirements",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "support_planning_meals",
        title: "Does {{firstname}} require support with planning meals?",
        section: "Dietary Requirements",
        section_id: "dietary_requirements",

        show_details: true,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "support_buying_meals",
        title: "Does {{firstname}} require support with buying meals?",
        section: "Food Preparation",
        section_id: "food_preparation",
        show_details: true,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "support_preparing_meals",
        title: "Does {{firstname}} require support with preparing, cooking, and/or serving meals?",
        section: "Food Preparation",
        section_id: "food_preparation",
        show_details: true,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "support_carrying_food",
        title: "Does {{firstname}} require support with carrying food or drinks?",
        section: "Food Preparation",
        section_id: "food_preparation",
        show_details: true,
        answer_type: {
            type: "boolean",
        },
    },
];

export const MEDICAL_QUESTIONS = [
    {
        id: "medical_conditions",
        title: "Medical conditions",
        subtitle: "Record how {{firstname}}'s medical conditions affect them.",
        section: "Medical Conditions",
        section_id: "medical_conditions",
        show_details: false,
        answer_type: {
            type: "medical_conditions",
            variant: "dialog",
        },
    },
    {
        id: "breathing_difficulty",
        title: "Does {{firstname}} have any difficulties breathing?",
        subtitle: null,
        section: "Breathing",
        section_id: "breathing",
        show_details: true,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "breathing_support",
        title: "What support does {{firstname}} need with breathing?",
        subtitle: null,
        section: "Breathing",
        section_id: "breathing",
        show_details: false,
        dependencies: {
            breathing_difficulty: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "equipment_used_airway_management",
        title: "Is equipment used for airway management?",
        section: "Breathing",
        section_id: "breathing",
        show_details: false,
        answer_type: {
            choices: [
                {
                    choice_id: "yes",
                    label: "Yes",
                },
                {
                    choice_id: "no",
                    label: "No",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "type_airway_management_used",
        title: "Type of airway management used",
        section: "Breathing",
        section_id: "breathing",
        show_details: false,
        dependencies: {
            equipment_used_airway_management: "yes",
        },
        answer_type: {
            choices: [
                {
                    choice_id: "oxygen",
                    label: "Oxygen",
                },
                {
                    choice_id: "airway_suction",
                    label: "Airway Suction",
                },
                {
                    choice_id: "cough_assist",
                    label: "Cough assist",
                },
                {
                    choice_id: "invasive_ventilation",
                    label: "Invasive ventilation",
                },
                {
                    choice_id: "tracheostomy",
                    label: "Tracheostomy",
                },
                {
                    choice_id: "other",
                    label: "Other",
                },
            ],
            type: "multiple_choice",
        },
    },
    {
        id: "type_suction",
        title: "Type of suction",
        section: "Breathing",
        section_id: "breathing",
        show_details: false,
        dependencies: {
            type_airway_management_used: ["airway_suction"],
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "risks_using_equipment",
        title: "What are the risks of using this equipment?",
        section: "Breathing",
        section_id: "breathing",
        show_details: false,
        dependencies: {
            equipment_used_airway_management: "yes",
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "how_will_these_risks_mitigated",
        title: "How will these risks be mitigated?",
        section: "Breathing",
        section_id: "breathing",
        show_details: false,
        dependencies: {
            equipment_used_airway_management: "yes",
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "pressure_sores",
        title: "Does {{firstname}} have any pressure sores at present or have they had any in the past?",
        subtitle: null,
        section: "Skin",
        section_id: "skin",
        show_details: true,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "skin_condition_concerns",
        title: "Is there anything concerning about the condition of {{firstname}}'s skin?",
        subtitle: null,
        section: "Skin",
        section_id: "skin",
        show_details: true,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "safeguarding_issue_raised",
        title: "Have any safeguarding issues ever been raised with regards to {{firstname}}, their care, or wellbeing?",
        subtitle: null,
        section: "Safeguarding Issues",
        section_id: "safeguarding",
        show_details: true,
        answer_type: {
            type: "boolean",
        },
    },
];

export const ADMINISTRATION_QUESTIONS = [
    {
        id: "finances_dependence",
        title: "Can {{firstname}} handle their own finances?",
        subtitle: null,
        section: "Finances",
        section_id: "finances",
        answer_type: {
            choices: [
                {
                    choice_id: "independent",
                    label: "Yes, independently",
                },
                {
                    choice_id: "semi_independent",
                    label: "Yes, with help",
                },
                {
                    choice_id: "fully_dependent",
                    label: "No, fully dependent",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "advanced_directive",
        title: "Does {{firstname}} have an Advanced Directive in place?",
        subtitle: null,
        section: "Advanced Directive",
        section_id: "advanced_directive",
        show_details: true,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "advanced_directive_location",
        title: "Where is it kept?",
        subtitle: null,
        section: "Advanced Directive",
        section_id: "advanced_directive",
        dependencies: {
            advanced_directive: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "will",
        title: "Does {{firstname}} have a will?",
        subtitle: null,
        section: "Will",
        section_id: "will",
        show_details: true,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "will_location",
        title: "Where is it kept?",
        subtitle: null,
        section: "Will",
        section_id: "will",
        dependencies: {
            will: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
];

export const PSYCHOLOGICAL_QUESTIONS = [
    {
        id: "health_satisfaction",
        title: "How satisfied is {{firstname}} with their level of health?",
        subtitle: null,
        section: "Satisfaction and Motivation",
        section_id: "satisfaction_motivation",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "very_satisfied",
                    label: "Very satisfied",
                },
                {
                    choice_id: "fairly_satisfied",
                    label: "Fairly satisfied but could be better",
                },
                {
                    choice_id: "dissatisfied",
                    label: "Dissatisfied but could be worse",
                },
                {
                    choice_id: "very_dissatisfied",
                    label: "Very dissatisfied",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "health_maintenance_motivation",
        title: "How motivated is {{firstname}} to maintain their health and wellbeing?",
        subtitle: null,
        section: "Satisfaction and Motivation",
        section_id: "satisfaction_motivation",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "highly_motivated",
                    label: "Highly motivated",
                },
                {
                    choice_id: "moderately_motivated",
                    label: "Moderately motivated",
                },
                {
                    choice_id: "unmotivated",
                    label: "Lacks motivation",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "mood",
        title: "How is {{firstname}}'s mood?",
        subtitle: null,
        section: "Mood and Sleep",
        section_id: "mood_sleep",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "normal",
                    label: "Normal for them",
                },
                {
                    choice_id: "low",
                    label: "Lower mood than average (inc. depressed)",
                },
                {
                    choice_id: "anxious",
                    label: "More anxious than average",
                },
                {
                    choice_id: "tired",
                    label: "More tired than average",
                },
                {
                    choice_id: "other",
                    label: "Other (please specify)",
                },
            ],
            type: "multiple_choice",
        },
    },
    {
        id: "sleep",
        title: "How is {{firstname}}'s sleep?",
        subtitle: null,
        section: "Mood and Sleep",
        section_id: "mood_sleep",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "acceptable",
                    label: "Acceptable for them",
                },
                {
                    choice_id: "disrupted",
                    label: "Disrupted",
                },
                {
                    choice_id: "insomnia",
                    label: "Insomnia",
                },
                {
                    choice_id: "other",
                    label: "Other (please specify)",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "memory_concerns",
        title: "Is {{firstname}} or anyone close to {{firstname}} worried about their memory?",
        subtitle: null,
        section: "Memory",
        section_id: "memory",
        show_details: true,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "memory_loss",
        title: "How is {{firstname}}'s memory?",
        subtitle: null,
        section: "Memory",
        section_id: "memory",
        show_details: true,
        answer_type: {
            choices: [
                {
                    choice_id: "no_noticeable_memory_loss",
                    label: "No noticeable memory loss",
                },
                {
                    choice_id: "mild_memory_loss",
                    label: "Mild memory loss (short or long-term)",
                },
                {
                    choice_id: "severe_memory_loss",
                    label: "Severe memory loss",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
];

// export const BEHAVIOR_QUESTIONS = [
//     // General Section
//     {
//         id: "behaviours_challenge",
//         title: "Does {{firstname}} have any behaviours that challenge?",
//         section: "General",
//         section_id: "general",
//         show_details: false,
//         answer_type: {
//             type: "boolean",
//         },
//     },
//     {
//         id: "nature_behaviour",
//         title: "What is the nature of the behaviour(s)?",
//         section: "General",
//         section_id: "general",
//         show_details: false,
//         has_note: [{ question_id: "nature_behaviour(s)", hasValue: "other" }],
//         dependencies: {
//             behaviours_challenge: true,
//         },
//         answer_type: {
//             choices: [
//                 { choice_id: "aggressive_behaviour", label: "Aggressive behaviour" },
//                 { choice_id: "impulsive_behaviour", label: "Impulsive behaviour" },
//                 { choice_id: "stereotypic_behaviour", label: "Stereotypic behaviour" },
//                 { choice_id: "disruptive_destructive_behaviour", label: "Disruptive or destructive behaviour" },
//                 { choice_id: "withdrawl", label: "Withdrawal" },
//                 { choice_id: "other", label: "Other" },
//                 { choice_id: "dont_know", label: "Don't know" },
//             ],
//             type: "multiple_choice",
//         },
//     },
//     {
//         id: "describe_behaviour",
//         title: "Describe the behaviour(s) i.e. exactly what happens",
//         section: "General",
//         section_id: "general",
//         show_details: false,
//         dependencies: {
//             behaviours_challenge: true,
//         },
//         answer_type: {
//             type: "free_text",
//             variant: "multi_line",
//         },
//     },
//     {
//         id: "how_frequently_behaviour_occur",
//         title: "How frequently does the behaviour occur?",
//         section: "General",
//         section_id: "general",
//         show_details: false,
//         dependencies: {
//             behaviours_challenge: true,
//         },
//         answer_type: {
//             type: "free_text",
//             variant: "multi_line",
//         },
//     },
//     {
//         id: "how_long_behaviour_last_for",
//         title: "How long does the behaviour last for?",
//         section: "General",
//         section_id: "general",
//         show_details: false,
//         dependencies: {
//             behaviours_challenge: true,
//         },
//         answer_type: {
//             type: "free_text",
//             variant: "multi_line",
//         },
//     },

//     // Background Section
//     {
//         id: "known_reasons_behaviour",
//         title: "Are there known reasons for the behaviour?",
//         section: "Background",
//         section_id: "background",
//         show_details: false,
//         dependencies: {
//             behaviours_challenge: true,
//         },
//         answer_type: {
//             type: "boolean",
//         },
//     },
//     {
//         id: "reasons_behaviour",
//         title: "What are the reasons for the behaviour?",
//         section: "Background",
//         section_id: "background",
//         show_details: false,
//         placeHolder: "e.g. an existing health condition, aspects of culture, or life history; recent changes to routine.",
//         dependencies: {
//             behaviours_challenge: true,
//             known_reasons_behaviour: true,
//         },
//         answer_type: {
//             type: "free_text",
//             variant: "multi_line",
//         },
//     },
//     {
//         id: "purpose_function_behaviour",
//         title: "What is the purpose or function of the behaviour?",
//         section: "Background",
//         section_id: "background",
//         show_details: false,
//         has_note: [{ question_id: "purpose_function_behaviour", hasValue: "other" }],
//         dependencies: {
//             behaviours_challenge: true,
//         },
//         answer_type: {
//             choices: [
//                 { choice_id: "attracting_attention", label: "Attracting attention" },
//                 { choice_id: "avoiding_escaping_demands", label: "Avoiding or escaping demands" },
//                 { choice_id: "producing_sensory_stimulation", label: "Producing sensory stimulation" },
//                 { choice_id: "communicating_with_others", label: "Communicating with others" },
//                 { choice_id: "other", label: "Other" },
//             ],
//             type: "multiple_choice",
//         },
//     },
//     {
//         id: "anything_trigger_behaviour",
//         title: "Does anything trigger the behaviour?",
//         section: "Background",
//         section_id: "background",
//         show_details: false,
//         has_note: [{ question_id: "anything_trigger_behaviour", hasValue: "yes" }],
//         dependencies: {
//             behaviours_challenge: true,
//         },
//         answer_type: {
//             choices: [
//                 { choice_id: "yes", label: "Yes" },
//                 { choice_id: "no", label: "No" },
//                 { choice_id: "dont_know", label: "Don't know" },
//             ],
//             type: "single_choice",
//             variant: "radio",
//         },
//     },
//     {
//         id: "getting_not_getting_from_behaviour(s)_makes_them_do_again",
//         title: "What is {{firstname}} getting or not getting from the behaviour(s) that makes them do it again?",
//         section: "Background",
//         section_id: "background",
//         placeholder: "e.g. attention; sensory stimulation.",
//         dependencies: {
//             behaviours_challenge: true,
//         },
//         answer_type: {
//             type: "free_text",
//             variant: "multi_line",
//         },
//     },
//     {
//         id: "impact_behaviour_on",
//         title: "What is the impact of the behaviour on {{firstname}}?",
//         section: "Background",
//         section_id: "background",
//         placeholder: "i.e. impact on quality of life, independent living skills, and educational or occupational abilities.",
//         dependencies: {
//             behaviours_challenge: true,
//         },
//         answer_type: {
//             type: "free_text",
//             variant: "multi_line",
//         },
//     },
//     {
//         id: "impact_behaviour_on_others",
//         title: "What is the impact of the behaviour on others?",
//         section: "Background",
//         section_id: "background",
//         placeholder: "i.e. impact on quality of life.",
//         dependencies: {
//             behaviours_challenge: true,
//         },
//         answer_type: {
//             type: "free_text",
//             variant: "multi_line",
//         },
//     },

//     // Support Section
//     {
//         id: "already_behaviour_management_plan_place",
//         title: "Is there already a behaviour management plan in place?",
//         section: "Support",
//         section_id: "support",
//         show_details: true,
//         has_note: [{ question_id: "already_behaviour_management_plan_place", hasValue: true }],
//         dependencies: {
//             behaviours_challenge: true,
//         },
//         answer_type: {
//             type: "boolean",
//         },
//     },
//     {
//         id: "mostly_calm_relaxed_how_do_they_present",
//         title: "When {{firstname}} is mostly calm and relaxed, how do they present?",
//         section: "Support",
//         section_id: "support",
//         show_details: false,
//         placeholder: "e.g. presents as friendly and mild-mannered.",
//         dependencies: {
//             behaviours_challenge: true,
//         },
//         answer_type: {
//             type: "free_text",
//             variant: "multi_line",
//         },
//     },
//     {
//         id: "how_should_carers_respond_during_phase-calm",
//         title: "How should carers respond during this phase?",
//         section: "Support",
//         section_id: "support",
//         show_details: false,
//         placeholder: "e.g. maintaining a calm environment.",
//         dependencies: {
//             behaviours_challenge: true,
//         },
//         answer_type: {
//             type: "free_text",
//             variant: "multi_line",
//         },
//     },
//     {
//         id: "behaviour_initially_starts_escalate_how_do_they_present",
//         title: "When {{firstname}}'s behaviour initially starts to escalate, how do they present?",
//         section: "Support",
//         section_id: "support",
//         show_details: false,
//         placeholder: "e.g. can become anxious and tearful.",
//         dependencies: {
//             behaviours_challenge: true,
//         },
//         answer_type: {
//             type: "free_text",
//             variant: "multi_line",
//         },
//     },
//     {
//         id: "how_should_carers_respond_during_phase-escalate",
//         title: "How should carers respond during this phase?",
//         section: "Support",
//         section_id: "support",
//         show_details: false,
//         placeholder: "e.g. carers should provide reassurance and speak calmly.",
//         dependencies: {
//             behaviours_challenge: true,
//         },
//         answer_type: {
//             type: "free_text",
//             variant: "multi_line",
//         },
//     },
//     {
//         id: "where_challenging_behaviour_occurs_how_present",
//         title: "Where challenging behaviour occurs, how does {{firstname}} present?",
//         section: "Support",
//         section_id: "support",
//         show_details: false,
//         placeholder: "e.g. can begin shouting and lash out.",
//         dependencies: {
//             behaviours_challenge: true,
//         },
//         answer_type: {
//             type: "free_text",
//             variant: "multi_line",
//         },
//     },
//     {
//         id: "how_should_carers_respond_during_phase-behaviour-occurs",
//         title: "How should carers respond during this phase?",
//         section: "Support",
//         section_id: "support",
//         show_details: false,
//         placeholder: "e.g. ensure safety and remove objects from reach that can be thrown.",
//         dependencies: {
//             behaviours_challenge: true,
//         },
//         answer_type: {
//             type: "free_text",
//             variant: "multi_line",
//         },
//     },
//     {
//         id: "starts_relax_again_how_do_they_present",
//         title: "When {{firstname}} starts to relax again, how do they present?",
//         section: "Support",
//         section_id: "support",
//         show_details: false,
//         placeholder: "e.g. can remain tearful and become sleepy.",
//         dependencies: {
//             behaviours_challenge: true,
//         },
//         answer_type: {
//             type: "free_text",
//             variant: "multi_line",
//         },
//     },
//     {
//         id: "how_should_carers_respond_during_phase-relax-again",
//         title: "How should carers respond during this phase?",
//         section: "Support",
//         section_id: "support",
//         show_details: false,
//         placeholder: "e.g. sit with client quietly until they are feeling better.",
//         dependencies: {
//             behaviours_challenge: true,
//         },
//         answer_type: {
//             type: "free_text",
//             variant: "multi_line",
//         },
//     },
//     {
//         id: "preventatitve_strategies",
//         title: "Are there any preventative strategies that can be put in place to reduce likelihood of behaviour that challenges?",
//         section: "Support",
//         section_id: "support",
//         show_details: true,
//         has_note: [{ question_id: "preventatitve_strategies", hasValue: true }],
//         dependencies: {
//             behaviours_challenge: true,
//         },
//         answer_type: {
//             type: "boolean",
//         },
//     },

//     // Incident reporting Section
//     {
//         id: "how_should_carers_record_report_incidents_with_behaviour",
//         title: "How should carers record and report any incidents with {{firstname}}'s behaviour?",
//         section: "Incident reporting",
//         section_id: "incident",
//         show_details: false,
//         placeholder: "e.g. use Caremonitor to raise a concern and provide as much detail as possible.",
//         dependencies: {
//             behaviours_challenge: true,
//         },
//         answer_type: {
//             type: "free_text",
//             variant: "multi_line",
//         },
//     },
// ];


export const BEHAVIOR_QUESTIONS = [
    // General Section
    {
        id: "behaviours_challenge",
        title: "Does {{firstname}} have any behaviours that challenge?",
        section: "General",
        section_id: "general",
        show_details: false,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "nature_behaviours",
        title: "What is the nature of the behaviour(s)?",
        section: "General",
        section_id: "general",
        show_details: false,
        has_note: [{ question_id: "nature_behaviour(s)", hasValue: "other" }],
        dependencies: {
            behaviours_challenge: true,
        },
        answer_type: {
            choices: [
                { choice_id: "aggressive_behaviour", label: "Aggressive behaviour" },
                { choice_id: "impulsive_behaviour", label: "Impulsive behaviour" },
                { choice_id: "stereotypic_behaviour", label: "Stereotypic behaviour" },
                { choice_id: "disruptive_destructive_behaviour", label: "Disruptive or destructive behaviour" },
                { choice_id: "withdrawl", label: "Withdrawal" },
                { choice_id: "other", label: "Other" },
                { choice_id: "dont_know", label: "Don't know" },
            ],
            type: "multiple_choice",
        },
    },
    {
        id: "describe_behaviour",
        title: "Describe the behaviour(s) i.e. exactly what happens",
        section: "General",
        section_id: "general",
        show_details: false,
        dependencies: {
            behaviours_challenge: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "how_frequently_behaviour_occur",
        title: "How frequently does the behaviour occur?",
        section: "General",
        section_id: "general",
        show_details: false,
        dependencies: {
            behaviours_challenge: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "how_long_behaviour_last_for",
        title: "How long does the behaviour last for?",
        section: "General",
        section_id: "general",
        show_details: false,
        dependencies: {
            behaviours_challenge: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },

    // Background Section
    {
        id: "known_reasons_behaviour",
        title: "Are there known reasons for the behaviour?",
        section: "Background",
        section_id: "background",
        show_details: false,
        dependencies: {
            behaviours_challenge: true,
        },
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "reasons_behaviour",
        title: "What are the reasons for the behaviour?",
        section: "Background",
        section_id: "background",
        show_details: false,
        placeHolder: "e.g. an existing health condition, aspects of culture, or life history; recent changes to routine.",
        dependencies: {
            behaviours_challenge: true,
            known_reasons_behaviour: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "purpose_function_behaviour",
        title: "What is the purpose or function of the behaviour?",
        section: "Background",
        section_id: "background",
        show_details: false,
        has_note: [{ question_id: "purpose_function_behaviour", hasValue: "other" }],
        dependencies: {
            behaviours_challenge: true,
        },
        answer_type: {
            choices: [
                { choice_id: "attracting_attention", label: "Attracting attention" },
                { choice_id: "avoiding_escaping_demands", label: "Avoiding or escaping demands" },
                { choice_id: "producing_sensory_stimulation", label: "Producing sensory stimulation" },
                { choice_id: "communicating_with_others", label: "Communicating with others" },
                { choice_id: "other", label: "Other" },
            ],
            type: "multiple_choice",
        },
    },
    {
        id: "anything_trigger_behaviour",
        title: "Does anything trigger the behaviour?",
        section: "Background",
        section_id: "background",
        show_details: false,
        has_note: [{ question_id: "anything_trigger_behaviour", hasValue: "yes" }],
        dependencies: {
            behaviours_challenge: true,
        },
        answer_type: {
            choices: [
                { choice_id: "yes", label: "Yes" },
                { choice_id: "no", label: "No" },
                { choice_id: "dont_know", label: "Don't know" },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "getting_not_getting_from_behaviours_makes_them_do_again",
        title: "What is {{firstname}} getting or not getting from the behaviour(s) that makes them do it again?",
        section: "Background",
        section_id: "background",
        placeholder: "e.g. attention; sensory stimulation.",
        dependencies: {
            behaviours_challenge: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "impact_behaviour_on",
        title: "What is the impact of the behaviour on {{firstname}}?",
        section: "Background",
        section_id: "background",
        placeholder: "i.e. impact on quality of life, independent living skills, and educational or occupational abilities.",
        dependencies: {
            behaviours_challenge: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "impact_behaviour_on_others",
        title: "What is the impact of the behaviour on others?",
        section: "Background",
        section_id: "background",
        placeholder: "i.e. impact on quality of life.",
        dependencies: {
            behaviours_challenge: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },

    // Support Section
    {
        id: "already_behaviour_management_plan_place",
        title: "Is there already a behaviour management plan in place?",
        section: "Support",
        section_id: "support",
        show_details: true,
        has_note: [{ question_id: "already_behaviour_management_plan_place", hasValue: true }],
        dependencies: {
            behaviours_challenge: true,
        },
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "mostly_calm_relaxed_how_do_they_present",
        title: "When {{firstname}} is mostly calm and relaxed, how do they present?",
        section: "Support",
        section_id: "support",
        show_details: false,
        placeholder: "e.g. presents as friendly and mild-mannered.",
        dependencies: {
            behaviours_challenge: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "how_should_carers_respond_during_phase_calm",
        title: "How should carers respond during this phase?",
        section: "Support",
        section_id: "support",
        show_details: false,
        placeholder: "e.g. maintaining a calm environment.",
        dependencies: {
            behaviours_challenge: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "behaviour_initially_starts_escalate_how_do_they_present",
        title: "When {{firstname}}'s behaviour initially starts to escalate, how do they present?",
        section: "Support",
        section_id: "support",
        show_details: false,
        placeholder: "e.g. can become anxious and tearful.",
        dependencies: {
            behaviours_challenge: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "how_should_carers_respond_during_phase_escalate",
        title: "How should carers respond during this phase?",
        section: "Support",
        section_id: "support",
        show_details: false,
        placeholder: "e.g. carers should provide reassurance and speak calmly.",
        dependencies: {
            behaviours_challenge: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "where_challenging_behaviour_occurs_how_present",
        title: "Where challenging behaviour occurs, how does {{firstname}} present?",
        section: "Support",
        section_id: "support",
        show_details: false,
        placeholder: "e.g. can begin shouting and lash out.",
        dependencies: {
            behaviours_challenge: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "how_should_carers_respond_during_phase_behaviour_occurs",
        title: "How should carers respond during this phase?",
        section: "Support",
        section_id: "support",
        show_details: false,
        placeholder: "e.g. ensure safety and remove objects from reach that can be thrown.",
        dependencies: {
            behaviours_challenge: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "starts_relax_again_how_do_they_present",
        title: "When {{firstname}} starts to relax again, how do they present?",
        section: "Support",
        section_id: "support",
        show_details: false,
        placeholder: "e.g. can remain tearful and become sleepy.",
        dependencies: {
            behaviours_challenge: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "how_should_carers_respond_during_phase_relax_again",
        title: "How should carers respond during this phase?",
        section: "Support",
        section_id: "support",
        show_details: false,
        placeholder: "e.g. sit with client quietly until they are feeling better.",
        dependencies: {
            behaviours_challenge: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "preventatitve_strategies",
        title: "Are there any preventative strategies that can be put in place to reduce likelihood of behaviour that challenges?",
        section: "Support",
        section_id: "support",
        show_details: true,
        has_note: [{ question_id: "preventatitve_strategies", hasValue: true }],
        dependencies: {
            behaviours_challenge: true,
        },
        answer_type: {
            type: "boolean",
        },
    },

    // Incident reporting Section
    {
        id: "how_should_carers_record_report_incidents_with_behaviour",
        title: "How should carers record and report any incidents with {{firstname}}'s behaviour?",
        section: "Incident reporting",
        section_id: "incident",
        show_details: false,
        placeholder: "e.g. use Caremonitor to raise a concern and provide as much detail as possible.",
        dependencies: {
            behaviours_challenge: true,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
];

export const COMMUNICATION_QUESTIONS = [
    // Speech Section
    {
        id: "speech_condition",
        title: "Does {{firstname}} live with any conditions or impairments that impact their speech?",
        section: "Speech",
        section_id: "speech",
        show_details: true,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "speech_support",
        title: "To support their speech, {{firstname}} uses:",
        section: "Speech",
        section_id: "speech",
        show_details: true,
        dependencies: {
            speech_condition: true,
        },
        answer_type: {
            choices: [
                { choice_id: "technology_based_speech_aid", label: "Technology-based speech aids" },
                { choice_id: "sign_language", label: "Sign language" },
                { choice_id: "no_aids", label: "No aids" },
                { choice_id: "other", label: "Other (please specify)" },
            ],
            type: "multiple_choice",
        },
    },

    // Hearing Section
    {
        id: "hearing_condition",
        title: "Does {{firstname}} live with any conditions or impairments that impact their hearing?",
        section: "Hearing",
        section_id: "hearing",
        show_details: true,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "hearing_support",
        title: "To support their hearing, {{firstname}} uses:",
        section: "Hearing",
        section_id: "hearing",
        show_details: true,
        dependencies: {
            hearing_condition: true,
        },
        answer_type: {
            choices: [
                { choice_id: "hearing_aid", label: "Hearing aids" },
                { choice_id: "no_aids", label: "No aids" },
                { choice_id: "other", label: "Other (please specify)" },
            ],
            type: "multiple_choice",
        },
    },

    // Sight Section
    {
        id: "sight_condition",
        title: "Does {{firstname}} live with any conditions or impairments that impact their sight?",
        section: "Sight",
        section_id: "sight",
        show_details: true,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "sight_support",
        title: "To support their sight, {{firstname}} uses:",
        section: "Sight",
        section_id: "sight",
        show_details: true,
        dependencies: {
            sight_condition: true,
        },
        answer_type: {
            choices: [
                { choice_id: "magnifiers", label: "Magnifiers" },
                { choice_id: "writing_equipment", label: "Writing equipment" },
                { choice_id: "household_equipment", label: "Household equipment" },
                { choice_id: "braille", label: "Braille" },
                { choice_id: "no_aids", label: "No aids" },
                { choice_id: "other", label: "Other (please specify)" },
            ],
            type: "multiple_choice",
        },
    },

    // Comprehension Section
    {
        id: "comprehension_level",
        title: "Do you feel that {{firstname}}'s quality of comprehension is:",
        section: "Comprehension",
        section_id: "comprehension",
        show_details: true,
        answer_type: {
            choices: [
                { choice_id: "high", label: "High level or native" },
                { choice_id: "moderate", label: "Moderate level" },
                { choice_id: "low", label: "Low level" },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },

    // Expression Section
    {
        id: "expression_level",
        title: "Do you feel that {{firstname}}'s quality of spoken language is:",
        section: "Expression",
        section_id: "expression",
        show_details: true,
        answer_type: {
            choices: [
                { choice_id: "high", label: "Easy to understand" },
                { choice_id: "moderate", label: "Difficult to understand" },
                { choice_id: "low", label: "Unable to understand" },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "phone_problems",
        title: "Does {{firstname}} have any problems using the phone?",
        section: "Expression",
        section_id: "expression",
        show_details: true,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "emergency_summoning_problems",
        title: "Would {{firstname}} have any problems if they had to summon someone in an emergency?",
        section: "Expression",
        section_id: "expression",
        show_details: true,
        answer_type: {
            type: "boolean",
        },
    },

    // Language Section
    {
        id: "english_appropriate",
        title: "Is English an appropriate language for communication?",
        section: "Language",
        section_id: "language",
        show_details: false,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "preferred_language",
        title: "Which is {{firstname}}'s preferred language for communication?",
        section: "Language",
        section_id: "language",
        show_details: false,
        dependencies: {
            english_appropriate: false,
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },

    // Personal preferences Section
    {
        id: "communication_method",
        title: "Which method of communication would {{firstname}} prefer?",
        section: "Personal preferences",
        section_id: "communication_method",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "contact_method",
        title: "How would {{firstname}} like to contact and be contacted by us?",
        section: "Personal preferences",
        section_id: "communication_method",
        show_details: true,
        answer_type: {
            choices: [
                { choice_id: "telephone", label: "Telephone" },
                { choice_id: "text_message", label: "Text message" },
                { choice_id: "email", label: "Email" },
                { choice_id: "regular_print", label: "Regular print" },
                { choice_id: "easy_read_print", label: "Easy read print" },
                { choice_id: "other", label: "Other (please specify)" },
            ],
            type: "multiple_choice",
        },
    },
];

export const CONDITION_SPECIFIC_QUESTIONS = [
    {
        id: "confirmed_diagnosis",
        title: "Does {{firstname}} have a confirmed diagnosis of this condition?",
        section: "General",
        section_id: "general",
        show_details: false,
        answer_type: {
            choices: [
                { choice_id: "yes", label: "Yes" },
                { choice_id: "no", label: "No" },
                { choice_id: "dont_know", label: "Don't know" },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "condition_diagnosed",
        title: "When was {{firstname}}'s condition diagnosed?",
        section: "General",
        section_id: "general",
        show_details: false,
        dependencies: {
            confirmed_diagnosis: "yes",
        },
        answer_type: {
            type: "date",
        },
    },
    {
        id: "concerns_about_capacity_make_decisions_about_management_their_condition",
        title: "Are there any concerns about {{firstname}}'s capacity to make decisions about the management of their condition?",
        section: "Capacity and decisions",
        section_id: "capacity",
        show_details: false,
        answer_type: {
            type: "boolean",
        },
    },
    {
        id: "impact_condition_on",
        title: "What is the impact of this condition on {{firstname}}?",
        section: "Impact",
        section_id: "impact",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "how_condition_affect_on_good_day",
        title: "How does this condition affect {{firstname}} on a good day?",
        section: "Impact",
        section_id: "impact",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "how_condition_affect_on_bad_day",
        title: "How does this condition affect {{firstname}} on a bad day?",
        section: "Impact",
        section_id: "impact",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "what_if_anything_most_difficult_relation_their_medical_condition_right_now",
        title: "What, if anything, is most difficult for {{firstname}} in relation to their condition right now?",
        section: "Impact",
        section_id: "impact",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "manage_condition_themselves",
        title: "Does {{firstname}} manage this condition themselves?",
        section: "Support",
        section_id: "support",
        show_details: true,
        answer_type: {
            choices: [
                { choice_id: "yes_independently", label: "Yes, independently" },
                { choice_id: "yes_with_support", label: "Yes, with support" },
                { choice_id: "no_fully_dependent", label: "No, fully dependent" },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "how_manage_condition",
        title: "How does {{firstname}} manage this condition?",
        section: "Support",
        section_id: "support",
        show_details: false,
        // dependencies: {
        //     manage_condition_themselves: ["yes_independently", "yes_with_support"]
        // },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "take_regular_medication_help_manage_their_condition",
        title: "Does {{firstname}} take regular medication to help manage their condition?",
        section: "Support",
        section_id: "support",
        show_details: true,
        answer_type: {
            choices: [
                { choice_id: "yes", label: "Yes" },
                { choice_id: "no", label: "No" },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    // {
    //     id: "medication_details",
    //     title: "Please provide details about the medication",
    //     section: "Support",
    //     section_id: "support",
    //     show_details: false,
    //     dependencies: {
    //         take_regular_medication_help_manage_their_condition: "yes"
    //     },
    //     answer_type: {
    //         type: "free_text",
    //         variant: "multi_line"
    //     }
    // },
    {
        id: "how_can_care_team_support_manage_their_condition",
        title: "How can the care team support {{firstname}} to manage their condition?",
        section: "Support",
        section_id: "support",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "services_not_currently_touch_with_could_help_with_managing_their_condition",
        title: "Are there any services that {{firstname}} is not currently in touch with that could help with managing their condition?",
        section: "Support",
        section_id: "support",
        show_details: false,
        answer_type: {
            choices: [
                { choice_id: "yes", label: "Yes" },
                { choice_id: "no", label: "No" },
                { choice_id: "dont_know", label: "Don't know" },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    {
        id: "services_details",
        title: "Additional Details",
        section: "Support",
        section_id: "support",
        show_details: false,
        dependencies: {
            services_not_currently_touch_with_could_help_with_managing_their_condition: "yes",
        },
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
    {
        id: "concerns_about_managing_their_condition_future",
        title: "Does {{firstname}} have any concerns about managing their condition in the future?",
        section: "Support",
        section_id: "support",
        show_details: true,
        answer_type: {
            choices: [
                { choice_id: "yes", label: "Yes" },
                { choice_id: "no", label: "No" },
            ],
            type: "single_choice",
            variant: "radio",
        },
    },
    // {
    //     id: "future_concerns_details",
    //     title: "Please describe the concerns about managing the condition in the future",
    //     section: "Support",
    //     section_id: "support",
    //     show_details: false,
    //     dependencies: {
    //         concerns_about_managing_their_condition_future: "yes"
    //     },
    //     answer_type: {
    //         type: "free_text",
    //         variant: "multi_line"
    //     }
    // },
    {
        id: "add_further_guidance_on_meeting_condition_specific_needs",
        title: "Add any further guidance on meeting condition-specific needs",
        section: "Support",
        section_id: "support",
        show_details: false,
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
    },
];

export const CONTROL_SUBSTANCES_QUESTIONS = [
    {
        id: "activity_substance_used_for",
        title: "What activity is this substance used for?",
        section: "Usage",
        section_id: "usage",
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
        placeholder: "e.g. cleaning the toilet",
    },
    {
        id: "how_often_activity_carried_out",
        title: "How often is this activity carried out?",
        section: "Usage",
        section_id: "usage",
        answer_type: {
            choices: [
                {
                    choice_id: "daily",
                    label: "Daily",
                },
                {
                    choice_id: "weekly",
                    label: "Weekly",
                },
                {
                    choice_id: "monthly",
                    label: "Monthly",
                },
                {
                    choice_id: "other",
                    label: "Other",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
        has_note: [{ question_id: "how_often_activity_carried_out", hasValue: "other" }],
        show_details: true,
    },
    {
        id: "how_much_substance_used_at_time",
        title: "How much of the substance is used at a time?",
        section: "Usage",
        section_id: "usage",
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
        placeholder: "e.g. 150ml, or as much as is needed",
    },
    {
        id: "where_substance_being_used",
        title: "Where is this substance being used?",
        section: "Usage",
        section_id: "usage",
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
        placeholder: "e.g. in the toilet in both bathrooms",
    },
    {
        id: "where_substance_stored_not_use",
        title: "Where is this substance stored when not in use?",
        section: "Usage",
        section_id: "usage",
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
        placeholder: "e.g. in the cupboard under the sink",
    },
    {
        id: "category_substance_fit_into",
        title: "What category does the substance fit into?",
        section: "Type of hazard",
        section_id: "type",
        answer_type: {
            choices: [
                {
                    choice_id: "explosive",
                    label: "Explosive",
                },
                {
                    choice_id: "flammable",
                    label: "Flammable",
                },
                {
                    choice_id: "oxidising",
                    label: "Oxidising",
                },
                {
                    choice_id: "corrosive",
                    label: "Corrosive",
                },
                {
                    choice_id: "acute_toxicity",
                    label: "Acute toxicity",
                },
                {
                    choice_id: "hazardous_environment",
                    label: "Hazardous to the environment",
                },
                {
                    choice_id: "health_hazard",
                    label: "Health hazard",
                },
                {
                    choice_id: "serious_health_hazard",
                    label: "Serious health hazard",
                },
                {
                    choice_id: "gas_under_pressure",
                    label: "Gas under pressure",
                },
                {
                    choice_id: "other",
                    label: "Other",
                },
                {
                    choice_id: "dont_know",
                    label: "Don't know",
                },
            ],
            type: "multiple_choice",
        },
        has_note: [{ question_id: "category_substance_fit_into", hasValue: "other" }],
        show_details: true,
    },
    {
        id: "type_substance_it",
        title: "What type of substance is it?",
        section: "Type of hazard",
        section_id: "type",
        answer_type: {
            choices: [
                {
                    choice_id: "solid",
                    label: "Solid",
                },
                {
                    choice_id: "liquid",
                    label: "Liquid",
                },
                {
                    choice_id: "vapour",
                    label: "Vapour",
                },
                {
                    choice_id: "gas",
                    label: "Gas",
                },
                {
                    choice_id: "other",
                    label: "Other",
                },
                {
                    choice_id: "dont_know",
                    label: "Don't know",
                },
            ],
            type: "single_choice",
            variant: "radio",
        },
        has_note: [{ question_id: "type_substance_it", hasValue: "other" }],
        show_details: true,
    },
    {
        id: "route_exposure",
        title: "What is the route of exposure?",
        section: "Type of hazard",
        section_id: "type",
        answer_type: {
            choices: [
                {
                    choice_id: "inhalation",
                    label: "Inhalation",
                },
                {
                    choice_id: "skin",
                    label: "Skin",
                },
                {
                    choice_id: "eyes",
                    label: "Eyes",
                },
                {
                    choice_id: "ingestion",
                    label: "Ingestion",
                },
                {
                    choice_id: "other",
                    label: "Other",
                },
            ],
            type: "multiple_choice",
        },
        has_note: [{ question_id: "route_exposure", hasValue: "other" }],
        show_details: true,
    },
    {
        id: "who_at_risk_exposure",
        title: "Who is at risk of exposure?",
        section: "Risk management",
        section_id: "risk_management",
        answer_type: {
            choices: [
                {
                    choice_id: "carer",
                    label: "Carer",
                },
                {
                    choice_id: "client",
                    label: "Client",
                },
                {
                    choice_id: "third_party",
                    label: "Third party",
                },
            ],
            type: "multiple_choice",
        },
    },
    {
        id: "risks_health",
        title: "What are the risks to health?",
        section: "Risk management",
        section_id: "risk_management",
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
        placeholder: "e.g. the product could burn skin if in direct contact",
    },
    {
        id: "how_will_exposure_substance_controlled",
        title: "How will exposure to the substance be controlled?",
        section: "Risk management",
        section_id: "risk_management",
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
        placeholder: "e.g. windows should be kept open when in use.",
    },
    {
        id: "ppe_needed_using_substance",
        title: "What Personal Protective Equipment (PPE) is needed when using the substance?",
        section: "Risk management",
        section_id: "risk_management",
        answer_type: {
            choices: [
                {
                    choice_id: "dust_mask",
                    label: "Dust mask",
                },
                {
                    choice_id: "visor",
                    label: "Visor",
                },
                {
                    choice_id: "gloves",
                    label: "Gloves",
                },
                {
                    choice_id: "overalls",
                    label: "Overalls",
                },
                {
                    choice_id: "respirator",
                    label: "Respirator",
                },
                {
                    choice_id: "goggles",
                    label: "Goggles",
                },
                {
                    choice_id: "footwear",
                    label: "Footwear",
                },
                {
                    choice_id: "other",
                    label: "Other",
                },
                {
                    choice_id: "none",
                    label: "None",
                },
            ],
            type: "multiple_choice",
        },
        has_note: [{ question_id: "ppe_needed_using_substance", hasValue: "other" }],
        show_details: true,
    },
    {
        id: "how_should_substance_and_or_contaminated_containers_disposed_of",
        title: "How should the substance and/or contaminated containers be disposed of?",
        section: "Risk management",
        section_id: "risk_management",
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
        placeholder: "e.g. general bin with lid screwed on to avoid spillage",
    },
    {
        id: "first_aid_measures_needed_if_exposed_substance",
        title: "What first aid measures are needed if exposed to substance?",
        section: "Risk management",
        section_id: "risk_management",
        answer_type: {
            type: "free_text",
            variant: "multi_line",
        },
        placeholder: "e.g if in contact with eyes, rinse immediately with cold water.",
    },
    {
        id: "risk_rating_product_following_control_measures",
        title: "What is the risk rating of this product following control measures?",
        section: "Risk rating",
        section_id: "risk_rating",
        answer_type: {
            choices: [
                {
                    choice_id: "high",
                    label: "High",
                },
                {
                    choice_id: "medium",
                    label: "Mif they begin choking?",
                    answer_type: {
                        type: "free_text",
                        variant: "multi_line",
                    },
                },
            ],
        },
    },
];

// const clientName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : "the client";
const clientName = "the client";

export const getAssessmentQuestions = (assessmentType) => {
    const normalizedType = assessmentType?.replace(/-/g, "_").toLowerCase();
    switch (normalizedType) {
        case "personal_care":
            return PERSONAL_CARE_QUESTIONS;
        case "everyday_activities":
            return EVERYDAY_ACTIVITIES_QUESTIONS;
        case "social_support":
            return SOCIAL_SUPPORT_QUESTIONS;
        case "environmental":
            return ENVIRONMENTAL_QUESTIONS;
        case "nutrition_hydration":
            return NUTRITION_HYDRATION_QUESTIONS;
        case "medical":
            return MEDICAL_QUESTIONS;
        case "administration":
            return ADMINISTRATION_QUESTIONS;
        case "psychological":
            return PSYCHOLOGICAL_QUESTIONS;
        default:
            console.warn(`No questions found for assessment type: ${assessmentType}, defaulting to personal care questions`);
            return PERSONAL_CARE_QUESTIONS;
    }
};

export const getInitialAssessmentAPIEndpoint = (assessmentType) => {
    const normalizedType = assessmentType?.replace(/-/g, "_").toLowerCase();
    switch (normalizedType) {
        case "personal_care":
            return APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT;
        case "everyday_activities":
            return APIConfig.CLIENT_CARE_PLAN.EVERYDAY_ACTIVITIES_ASSESSMENT.CREATE_EVERYDAY_ACTIVITIES_ASSESSMENT;
        case "social_support":
            return APIConfig.CLIENT_CARE_PLAN.SOCIAL_SUPPORT_ASSESSMENT.CREATE_SOCIAL_SUPPORT_ASSESSMENT;
        case "environmental":
            return APIConfig.CLIENT_CARE_PLAN.ENVIRONMENTAL_ASSESSMENT.CREATE_ENVIRONMENTAL_ASSESSMENT;
    }
};

export const getAdditionalAssessmentQuestions = (assessmentType) => {
    const normalizedType = assessmentType?.replace(/-/g, "_").toLowerCase();
    switch (normalizedType) {

        case "behaviour":
            return BEHAVIOR_QUESTIONS;
        case "communication":
            return COMMUNICATION_QUESTIONS;
        case "condition_specific":
            return CONDITION_SPECIFIC_QUESTIONS;
        case "covid":
            return COVID_19_QUESTIONS;
        case "control_substances":
            return CONTROL_SUBSTANCES_QUESTIONS;
        case "dysphagia":
            return DYSPHAGIA_QUESTIONS;
        case "end_of_life":
            return END_OF_LIFE_QUESTIONS;
        case "environment_fire":
            return ENVIRONMENTAL_AND_FIRE_QUESTIONS;
        case "financial":
            return FINANCIAL_QUESTIONS;
        case "medication":
            return MEDICATION_QUESTIONS;
        case "mental_capacity":
            return MENTAL_CAPACITY_QUESTIONS;
        case "moving_handling":
            return MOVING_HANDLING_QUESTIONS;
        case "restrictive_practice":
            return RESTRICTIVE_PRACTICE_QUESTIONS;
        case "seizures":
            return SEIZURES_QUESTIONS;
        case "waterlow":
            return WATERLOW_QUESTIONS;
        default:
            return BEHAVIOR_QUESTIONS;
    }
};

export const getAuditQuestions = (auditType) => {
    const normalizedType = auditType?.replace(/-/g, "_").toLowerCase();
    switch (normalizedType) {
        case "client_feedback":
            return CLIENT_FEEDBACK_QUESTIONS;
        case "courtesy_call":
            return COURTESY_CALL_QUESTIONS;
        case "service_review":
            return SERVICE_REVIEW_QUESTIONS;
        default:
            return BEHAVIOR_QUESTIONS;
    }
};

export const getAdditionalAssessmentDescription = (assessmentType) => {
    switch (assessmentType) {
        case "behaviour":
            return "Use this assessment to record behaviours that challenge, the functioUse this assessment to record COVID-19 related information and any specific precautions neededcommunication";
        case "condition-specific":
            return "This assessment is to be used to plan how to manage a specific health condition.";
        case "covid":
            return "Use this assessment to document the risk and impact of COVID-19 for Dummy.";
        case "control-substances":
            return "Use this Control of Substances Hazardous to Health (COSHH) assessment to document hazards and risks associated to substances being used. View hazard pictograms here.";
        case "dysphagia":
            return "Use this assessment to record information about drainage needs and management.";
        case "end-of-life":
            return "Use this assessment to document end of life wishes and preferences.";
        case "environment-fire":
            return "Use this assessment to document risks and mitigations associated with environment and fire.";
        case "financial":
            return "Use this assessment to help identify financial needs.";
        case "medication":
            return `Use this assessment to record ${clientName}'s risks and needs associated with their medication.`;
        case "mental-capacity":
            return "This assessment is to be used to determine someone's capacity to make a specific decision.";
        case "moving-handling":
            return "Use this assessment to record someone's level of independence and identify any risks or needs during movement.";
        case "restrictive-practice":
            return "Use this assessment to record any restrictive practices that have been put in place.";
        case "seizures":
            return "Use this assessment for clients who experience epileptic or non-epileptic seizures to provide guidance on how to manage them appropriately.";
        case "waterlow":
            return "Use this form to assess the risk of pressure ulcers. View official Waterlow score card here.";
        default:
            return "Use this assessment to record relevant information about the client's care needs.";
    }
};

export const getAssessmentDescription = (assessmentType) => {
    switch (assessmentType) {
        case "behaviour":
            return "Use this assessment to record behaviours that challenge.";
        case "communication":
            return "Use this assessment to record communication needs and preferences.";
        case "condition-specific":
            return "This assessment is to be used to plan how to manage a specific health condition.";
        case "covid":
            return "Use this assessment to record COVID-19 related information and any specific precautions needed.";
        case "control-substances":
            return "Use this Control of Substances Hazardous to Health (COSHH) assessment to document hazards and risks.";
        case "dysphagia":
            return "Use this assessment to assess risk of dysphagia and plan how these risks can be managed. The IDDSI Framework can be found here.";
        case "everyday-activities":
            return "Use this assessment to record daily activity needs and support requirements.";
        case "social-support":
            return "Use this assessment to record social support needs and networks.";
        case "environmental":
            return "Use this assessment to record environmental risks and adaptations.";
        case "nutrition-hydration":
            return "Use this assessment to record nutrition and hydration needs.";
        case "medical":
            return "Use this assessment to record medical conditions and requirements.";
        case "administration":
            return "Use this assessment to record administrative needs and support.";
        case "psychological":
            return "Use this assessment to record psychological needs and support.";
        default:
            return "Use this assessment to record relevant information about the client's care needs.";
    }
};

export const getAuditingAssessmentDescription = (assessmentType) => {
    switch (assessmentType) {
        case "client-feedback":
            return "This form is used to capture client feedback at regular intervals.";
        case "courtesy-call":
            return "This form is used to check in with the client to review their last visit";
        case "service-review":
            return "This form is used to review the suitability of the client's package of care at regular intervals";
    }
};

export const downloadDocumentSections = [
    {
        id: "client-information",
        title: "Client information",
        items: [
            { id: "personal-details", label: "Personal details", icon: UserCircle, downloadable: true },
            { id: "personal-identity", label: "Personal identity", icon: FileText, downloadable: true },
            { id: "clinical-details", label: "Clinical details", icon: Stethoscope, downloadable: true },
            { id: "key-contacts", label: "Key contacts", icon: Users, downloadable: true },
            { id: "agency-admin", label: "Agency admin", icon: Settings, downloadable: true },
        ],
    },
    {
        id: "needs-assessments",
        title: "Needs assessments",
        noInfo: true,
        linkTo: "needs-assessments",
    },
    {
        id: "additional-assessments",
        title: "Additional assessments",
        noInfo: true,
        linkTo: "additional-assessments",
    },
    {
        id: "auditing-documents",
        title: "Auditing documents",
        noInfo: true,
        linkTo: "auditing-documents",
    },
    {
        id: "care-plan",
        title: "Care plan",
        items: [
            { id: "personal-care", label: "Personal care", icon: Activity, downloadable: true, date: "4 June 2025" },
            { id: "psychological", label: "Psychological", icon: Brain, downloadable: true, date: "3 June 2025" },
            { id: "behaviour", label: "Behaviour", icon: Activity, downloadable: true, date: "4 June 2025" },
        ],
    },
    {
        id: "task-planner",
        title: "Task planner",
        items: [{ id: "task-planner", label: "Task planner", icon: FileText, downloadable: true, date: "4 June 2025" }],
    },
];
