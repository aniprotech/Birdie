import * as Yup from "yup";
import APIConfig from "../../../../../utils/ApiConfig";

export const generateInitialValues = (questions) => {
        const values = {};
        questions.forEach((question) => {
            if (question.answer_type.type === "multiple_choice") {
                values[question.id] = [];
            } else if (question.answer_type.type === "boolean") {
                values[question.id] = false;
            } else if (question.answer_type.type === "single_choice") {
                values[question.id] = "";
            } else {
                values[question.id] = "";
            }
            if (question.has_note || question.show_details) {
                values[`${question.id}_details`] = "";
            }
        });
        return values;
    };

export const validationSchema = (questions) => Yup.object().shape(
        questions.reduce((acc, question) => {
            if (question.answer_type.type === "multiple_choice") {
                acc[question.id] = question.required ? Yup.array().min(1, "At least one option must be selected") : Yup.array();
            } else if (question.answer_type.type === "boolean") {
                acc[question.id] = Yup.boolean();
            } else if (question.answer_type.type === "single_choice") {
                acc[question.id] = question.required ? Yup.string().required("This field is required") : Yup.string();
            } else if (question.answer_type.type === "date") {
                acc[question.id] = question.required ? Yup.date().required("This field is required") : Yup.date().nullable();
            } else {
                acc[question.id] = question.required ? Yup.string().required("This field is required") : Yup.string();
            }

            if (question.show_details || question.has_note) {
                acc[`${question.id}_details`] = Yup.string().when(question.id, {
                    is: (val) => {
                        if (question.answer_type.type === "boolean") {
                            return val === true;
                        } else if (question.answer_type.type === "single_choice") {
                            if (Array.isArray(question.has_note)) {
                                const hasNoteConfig = question.has_note.find((note) => note.question_id === question.id);
                                if (hasNoteConfig) {
                                    return val === hasNoteConfig.hasValue;
                                }
                            }
                            return val === "yes" || val === "other";
                        } else if (question.answer_type.type === "multiple_choice" && Array.isArray(val)) {
                            if (Array.isArray(question.has_note)) {
                                const hasNoteConfig = question.has_note.find((note) => note.question_id === question.id);
                                if (hasNoteConfig) {
                                    return val.includes(hasNoteConfig.hasValue);
                                }
                            }
                            return val.includes("other");
                        }
                        return false;
                    },
                    then: Yup.string().required("Please provide additional details"),
                    otherwise: Yup.string(),
                });
            }
            return acc;
        }, {}),
    );

export const shouldShowQuestion = (question, values) => {
        if (!question.dependencies) return true;

        return Object.entries(question.dependencies).every(([key, value]) => {
            if (Array.isArray(value)) {
                return value.includes(values[key]);
            }
            return values[key] === value;
        });
    };

export const shouldShowDetails = (question, values) => {
        if (question.show_details) {
            if (question.answer_type.type === "boolean") {
                return values[question.id] === true;
            } else if (question.answer_type.type === "multiple_choice") {
                return Array.isArray(values[question.id]) && values[question.id].includes("other");
            } else if (question.answer_type.type === "single_choice") {
                return (
                    values[question.id] === "yes" ||
                    values[question.id] === "yes_confirmed" ||
                    values[question.id] === "yes_suspected" ||
                    values[question.id] === "other"
                );
            }
        }

        if (question.has_note) {
            const hasNoteConfig = Array.isArray(question.has_note) ? question.has_note.find((note) => note.question_id === question.id) : null;

            if (hasNoteConfig) {
                if (question.answer_type.type === "multiple_choice") {
                    return Array.isArray(values[question.id]) && values[question.id].includes(hasNoteConfig.hasValue);
                } else if (question.answer_type.type === "single_choice") {
                    return values[question.id] === hasNoteConfig.hasValue;
                }
            } else {
                if (question.answer_type.type === "multiple_choice") {
                    return Array.isArray(values[question.id]) && values[question.id].includes("other");
                } else if (question.answer_type.type === "single_choice") {
                    return values[question.id] === "other";
                }
            }
        }

        return false;
    };


    // Get API endpoint based on assessment type and mode
    export const getAPIEndpoint = (assessmentType, mode, assessmentId = null, clientId = null, isInitialAssessment = false, isAdditionalAssessment = false, isAuditingAssessment = false) => {
        const normalizedType = assessmentType?.replace(/-/g, "_").toLowerCase();
        
        if (isInitialAssessment) {
            switch (normalizedType) {
                case "personal_care":
                    if (mode === "create") return APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.CREATE_PERSONAL_CARE_ASSESSMENT(clientId);
                    if (mode === "update" && assessmentId) return APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.UPDATE_PERSONAL_CARE_ASSESSMENT(assessmentId);
                    return APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.GET_PERSONAL_CARE_ASSESSMENT_BY_ID(assessmentId);
                    
                case "everyday_activities":
                    if (mode === "create") return APIConfig.CLIENT_CARE_PLAN.EVERYDAY_ACTIVITIES_ASSESSMENT.CREATE_EVERYDAY_ACTIVITIES_ASSESSMENT(clientId);
                    if (mode === "update" && assessmentId) return APIConfig.CLIENT_CARE_PLAN.EVERYDAY_ACTIVITIES_ASSESSMENT.UPDATE_EVERYDAY_ACTIVITIES_ASSESSMENT(assessmentId);
                    return APIConfig.CLIENT_CARE_PLAN.EVERYDAY_ACTIVITIES_ASSESSMENT.GET_EVERYDAY_ACTIVITIES_ASSESSMENT_BY_ID(assessmentId);
                    
                case "social_support":
                    if (mode === "create") return APIConfig.CLIENT_CARE_PLAN.SOCIAL_SUPPORT_ASSESSMENT.CREATE_SOCIAL_SUPPORT_ASSESSMENT(clientId);
                    if (mode === "update" && assessmentId) return APIConfig.CLIENT_CARE_PLAN.SOCIAL_SUPPORT_ASSESSMENT.UPDATE_SOCIAL_SUPPORT_ASSESSMENT(assessmentId);
                    return APIConfig.CLIENT_CARE_PLAN.SOCIAL_SUPPORT_ASSESSMENT.GET_SOCIAL_SUPPORT_ASSESSMENT_BY_ID(assessmentId);
                    
                case "environmental":
                    if (mode === "create") return APIConfig.CLIENT_CARE_PLAN.ENVIRONMENTAL_ASSESSMENT.CREATE_ENVIRONMENTAL_ASSESSMENT(clientId);
                    if (mode === "update" && assessmentId) return APIConfig.CLIENT_CARE_PLAN.ENVIRONMENTAL_ASSESSMENT.UPDATE_ENVIRONMENTAL_ASSESSMENT(assessmentId);
                    return APIConfig.CLIENT_CARE_PLAN.ENVIRONMENTAL_ASSESSMENT.GET_ENVIRONMENTAL_ASSESSMENT_BY_ID(assessmentId);
                    
                case "nutrition_hydration":
                    if (mode === "create") return APIConfig.CLIENT_CARE_PLAN.NUTRITION_HYDRATION_ASSESSMENT.CREATE_NUTRITION_HYDRATION_ASSESSMENT(clientId);
                    if (mode === "update" && assessmentId) return APIConfig.CLIENT_CARE_PLAN.NUTRITION_HYDRATION_ASSESSMENT.UPDATE_NUTRITION_HYDRATION_ASSESSMENT(assessmentId);
                    return APIConfig.CLIENT_CARE_PLAN.NUTRITION_HYDRATION_ASSESSMENT.GET_NUTRITION_HYDRATION_ASSESSMENT_BY_ID(assessmentId);
                    
                case "medical":
                    if (mode === "create") return APIConfig.CLIENT_CARE_PLAN.MEDICAL_ASSESSMENT.CREATE_MEDICAL_ASSESSMENT(clientId);
                    if (mode === "update" && assessmentId) return APIConfig.CLIENT_CARE_PLAN.MEDICAL_ASSESSMENT.UPDATE_MEDICAL_ASSESSMENT(assessmentId);
                    return APIConfig.CLIENT_CARE_PLAN.MEDICAL_ASSESSMENT.GET_MEDICAL_ASSESSMENT_BY_ID(assessmentId);
                    
                case "administration":
                    if (mode === "create") return APIConfig.CLIENT_CARE_PLAN.ADMINISTRATION_ASSESSMENT.CREATE_ADMINISTRATION_ASSESSMENT(clientId);
                    if (mode === "update" && assessmentId) return APIConfig.CLIENT_CARE_PLAN.ADMINISTRATION_ASSESSMENT.UPDATE_ADMINISTRATION_ASSESSMENT(assessmentId);
                    return APIConfig.CLIENT_CARE_PLAN.ADMINISTRATION_ASSESSMENT.GET_ADMINISTRATION_ASSESSMENT_BY_ID(assessmentId);
                    
                case "psychological":
                    if (mode === "create") return APIConfig.CLIENT_CARE_PLAN.PSYCHOLOGICAL_ASSESSMENT.CREATE_PSYCHOLOGICAL_ASSESSMENT(clientId);
                    if (mode === "update" && assessmentId) return APIConfig.CLIENT_CARE_PLAN.PSYCHOLOGICAL_ASSESSMENT.UPDATE_PSYCHOLOGICAL_ASSESSMENT(assessmentId);
                    return APIConfig.CLIENT_CARE_PLAN.PSYCHOLOGICAL_ASSESSMENT.GET_PSYCHOLOGICAL_ASSESSMENT_BY_ID(assessmentId);
                    
                default:
                    return null;
            }
        } else if (isAdditionalAssessment) {
            // Additional assessment endpoints
            switch (normalizedType) {
                case "behavior":
                    if (mode === "create") return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.CREATE_PERSONAL_CARE_ASSESSMENT(clientId).replace('/personal-care/', '/behavior/')}`;
                    if (mode === "update" && assessmentId) return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.UPDATE_PERSONAL_CARE_ASSESSMENT(assessmentId).replace('/personal-care/', '/behavior/')}`;
                    return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.GET_PERSONAL_CARE_ASSESSMENT_BY_ID(assessmentId).replace('/personal-care/', '/behavior/')}`;
                    
                case "communication":
                    if (mode === "create") return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.CREATE_PERSONAL_CARE_ASSESSMENT(clientId).replace('/personal-care/', '/communication/')}`;
                    if (mode === "update" && assessmentId) return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.UPDATE_PERSONAL_CARE_ASSESSMENT(assessmentId).replace('/personal-care/', '/communication/')}`;
                    return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.GET_PERSONAL_CARE_ASSESSMENT_BY_ID(assessmentId).replace('/personal-care/', '/communication/')}`;
                    
                case "condition_specific":
                    if (mode === "create") return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.CREATE_PERSONAL_CARE_ASSESSMENT(clientId).replace('/personal-care/', '/condition-specific/')}`;
                    if (mode === "update" && assessmentId) return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.UPDATE_PERSONAL_CARE_ASSESSMENT(assessmentId).replace('/personal-care/', '/condition-specific/')}`;
                    return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.GET_PERSONAL_CARE_ASSESSMENT_BY_ID(assessmentId).replace('/personal-care/', '/condition-specific/')}`;
                    
                case "covid":
                    if (mode === "create") return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.CREATE_PERSONAL_CARE_ASSESSMENT(clientId).replace('/personal-care/', '/covid/')}`;
                    if (mode === "update" && assessmentId) return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.UPDATE_PERSONAL_CARE_ASSESSMENT(assessmentId).replace('/personal-care/', '/covid/')}`;
                    return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.GET_PERSONAL_CARE_ASSESSMENT_BY_ID(assessmentId).replace('/personal-care/', '/covid/')}`;
                    
                case "dysphagia":
                    if (mode === "create") return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.CREATE_PERSONAL_CARE_ASSESSMENT(clientId).replace('/personal-care/', '/dysphagia/')}`;
                    if (mode === "update" && assessmentId) return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.UPDATE_PERSONAL_CARE_ASSESSMENT(assessmentId).replace('/personal-care/', '/dysphagia/')}`;
                    return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.GET_PERSONAL_CARE_ASSESSMENT_BY_ID(assessmentId).replace('/personal-care/', '/dysphagia/')}`;
                    
                case "financial":
                    if (mode === "create") return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.CREATE_PERSONAL_CARE_ASSESSMENT(clientId).replace('/personal-care/', '/financial/')}`;
                    if (mode === "update" && assessmentId) return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.UPDATE_PERSONAL_CARE_ASSESSMENT(assessmentId).replace('/personal-care/', '/financial/')}`;
                    return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.GET_PERSONAL_CARE_ASSESSMENT_BY_ID(assessmentId).replace('/personal-care/', '/financial/')}`;
                    
                case "medication":
                    if (mode === "create") return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.CREATE_PERSONAL_CARE_ASSESSMENT(clientId).replace('/personal-care/', '/medication/')}`;
                    if (mode === "update" && assessmentId) return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.UPDATE_PERSONAL_CARE_ASSESSMENT(assessmentId).replace('/personal-care/', '/medication/')}`;
                    return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.GET_PERSONAL_CARE_ASSESSMENT_BY_ID(assessmentId).replace('/personal-care/', '/medication/')}`;
                    
                default:
                    console.warn(`Additional assessment endpoint needed for: ${normalizedType}`);
                    return null;
            }
        } else if (isAuditingAssessment) {
            // Auditing assessment endpoints
            switch (normalizedType) {
                case "client_feedback":
                    if (mode === "create") return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.CREATE_PERSONAL_CARE_ASSESSMENT(clientId).replace('/personal-care/', '/client-feedback/')}`;
                    if (mode === "update" && assessmentId) return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.UPDATE_PERSONAL_CARE_ASSESSMENT(assessmentId).replace('/personal-care/', '/client-feedback/')}`;
                    return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.GET_PERSONAL_CARE_ASSESSMENT_BY_ID(assessmentId).replace('/personal-care/', '/client-feedback/')}`;
                    
                case "courtesy_call":
                    if (mode === "create") return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.CREATE_PERSONAL_CARE_ASSESSMENT(clientId).replace('/personal-care/', '/courtesy-call/')}`;
                    if (mode === "update" && assessmentId) return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.UPDATE_PERSONAL_CARE_ASSESSMENT(assessmentId).replace('/personal-care/', '/courtesy-call/')}`;
                    return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.GET_PERSONAL_CARE_ASSESSMENT_BY_ID(assessmentId).replace('/personal-care/', '/courtesy-call/')}`;
                    
                case "service_review":
                    if (mode === "create") return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.CREATE_PERSONAL_CARE_ASSESSMENT(clientId).replace('/personal-care/', '/service-review/')}`;
                    if (mode === "update" && assessmentId) return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.UPDATE_PERSONAL_CARE_ASSESSMENT(assessmentId).replace('/personal-care/', '/service-review/')}`;
                    return `${APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.GET_PERSONAL_CARE_ASSESSMENT_BY_ID(assessmentId).replace('/personal-care/', '/service-review/')}`;
                    
                default:
                    console.log(`Auditing assessment endpoint needed for: ${normalizedType}`);
                    return null;
            }
        }
        
        return null;
    };