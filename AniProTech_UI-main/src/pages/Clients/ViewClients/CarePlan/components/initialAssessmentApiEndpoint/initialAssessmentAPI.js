import APIConfig from "../../../../../../utils/ApiConfig";

export const getInitialAssessmentAPIEndpoint = (assessmentType, clientId) => {
    if (!clientId) {
        throw new Error("Client ID is required");
    }

    const normalizedType = assessmentType?.replace(/-/g, "_").toLowerCase();
    
    switch (normalizedType) {
        case "personal_care":
            return APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.GET_PERSONAL_CARE_ASSESSMENT_BY_CLIENT_ID(clientId);
        case "everyday_activities":
            return APIConfig.CLIENT_CARE_PLAN.EVERYDAY_ACTIVITIES_ASSESSMENT.GET_EVERYDAY_ACTIVITIES_ASSESSMENT_BY_CLIENT_ID(clientId);
        case "social_support":
            return APIConfig.CLIENT_CARE_PLAN.SOCIAL_SUPPORT_ASSESSMENT.GET_SOCIAL_SUPPORT_ASSESSMENT_BY_CLIENT_ID(clientId);
        case "environmental":
            return APIConfig.CLIENT_CARE_PLAN.ENVIRONMENTAL_ASSESSMENT.GET_ENVIRONMENTAL_ASSESSMENT_BY_CLIENT_ID(clientId);
        case "nutrition_hydration":
            return APIConfig.CLIENT_CARE_PLAN.NUTRITION_HYDRATION_ASSESSMENT.GET_NUTRITION_HYDRATION_ASSESSMENT_BY_CLIENT_ID(clientId);
        case "medical":
            return APIConfig.CLIENT_CARE_PLAN.MEDICAL_ASSESSMENT.GET_MEDICAL_ASSESSMENT_BY_CLIENT_ID(clientId);
        case "administration":
            return APIConfig.CLIENT_CARE_PLAN.ADMINISTRATION_ASSESSMENT.GET_ADMINISTRATION_ASSESSMENT_BY_CLIENT_ID(clientId);
        case "psychological":
            return APIConfig.CLIENT_CARE_PLAN.PSYCHOLOGICAL_ASSESSMENT.GET_PSYCHOLOGICAL_ASSESSMENT_BY_CLIENT_ID(clientId);
        default:
            console.warn(`No endpoint found for assessment type: ${assessmentType}, defaulting to personal care`);
            return APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.GET_PERSONAL_CARE_ASSESSMENT_BY_CLIENT_ID(clientId);
    }
};

export const getAssessmentNameFromRoute = (route) => {
    switch (route) {
        case "personal_care":
            return "personalCareId";
        case "everyday_activities":
            return "everydayActivityId";
        case "social_support":
            return "socialSupportId";
        case "environmental":
            return "environmentalId";
        case "nutrition_hydration":
            return "nutritionHydrationId";
        case "medical":
            return "medicalId";
        case "administration":
            return "administrativeId";
        case "psychological":
            return "psychologicalId";
        default:
            return "personalCareId";
    }
};

export const createOrUpdateInitialAssessmentAPI = (assessmentType, operation, assessmentId = null, clientId) => {
    if (!clientId) {
        throw new Error("Client ID is required");
    }

    if (!operation || (operation !== "create" && operation !== "update")) {
        throw new Error("Operation must be 'create' or 'update'");
    }

    if (operation === "update" && !assessmentId) {
        throw new Error("Assessment ID is required for update operation");
    }

    const normalizedType = assessmentType?.replace(/-/g, "_").toLowerCase();

    switch (normalizedType) {
        case "personal_care":
            return operation === "create"
                ? APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.CREATE_PERSONAL_CARE_ASSESSMENT(clientId)
                : APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.UPDATE_PERSONAL_CARE_ASSESSMENT(clientId);

        case "everyday_activities":
            return operation === "create"
                ? APIConfig.CLIENT_CARE_PLAN.EVERYDAY_ACTIVITIES_ASSESSMENT.CREATE_EVERYDAY_ACTIVITIES_ASSESSMENT(clientId)
                : APIConfig.CLIENT_CARE_PLAN.EVERYDAY_ACTIVITIES_ASSESSMENT.UPDATE_EVERYDAY_ACTIVITIES_ASSESSMENT(clientId);

        case "social_support":
            return operation === "create"
                ? APIConfig.CLIENT_CARE_PLAN.SOCIAL_SUPPORT_ASSESSMENT.CREATE_SOCIAL_SUPPORT_ASSESSMENT(clientId)
                : APIConfig.CLIENT_CARE_PLAN.SOCIAL_SUPPORT_ASSESSMENT.UPDATE_SOCIAL_SUPPORT_ASSESSMENT(clientId);

        case "environmental":
            return operation === "create"
                ? APIConfig.CLIENT_CARE_PLAN.ENVIRONMENTAL_ASSESSMENT.CREATE_ENVIRONMENTAL_ASSESSMENT(clientId)
                : APIConfig.CLIENT_CARE_PLAN.ENVIRONMENTAL_ASSESSMENT.UPDATE_ENVIRONMENTAL_ASSESSMENT(clientId);

        case "nutrition_hydration":
            return operation === "create"
                ? APIConfig.CLIENT_CARE_PLAN.NUTRITION_HYDRATION_ASSESSMENT.CREATE_NUTRITION_HYDRATION_ASSESSMENT(clientId)
                : APIConfig.CLIENT_CARE_PLAN.NUTRITION_HYDRATION_ASSESSMENT.UPDATE_NUTRITION_HYDRATION_ASSESSMENT(clientId);

        case "medical":
            return operation === "create"
                ? APIConfig.CLIENT_CARE_PLAN.MEDICAL_ASSESSMENT.CREATE_MEDICAL_ASSESSMENT(clientId)
                : APIConfig.CLIENT_CARE_PLAN.MEDICAL_ASSESSMENT.UPDATE_MEDICAL_ASSESSMENT(clientId);

        case "administration":
            return operation === "create"
                ? APIConfig.CLIENT_CARE_PLAN.ADMINISTRATION_ASSESSMENT.CREATE_ADMINISTRATION_ASSESSMENT(clientId)
                : APIConfig.CLIENT_CARE_PLAN.ADMINISTRATION_ASSESSMENT.UPDATE_ADMINISTRATION_ASSESSMENT(clientId);

        case "psychological":
            return operation === "create"
                ? APIConfig.CLIENT_CARE_PLAN.PSYCHOLOGICAL_ASSESSMENT.CREATE_PSYCHOLOGICAL_ASSESSMENT(clientId)
                : APIConfig.CLIENT_CARE_PLAN.PSYCHOLOGICAL_ASSESSMENT.UPDATE_PSYCHOLOGICAL_ASSESSMENT(clientId);

        default:
            throw new Error(`Unsupported initial assessment type: ${assessmentType}`);
    }
};

export const getAssessmentByIdAPI = (assessmentType, assessmentId) => {
    if (!assessmentId) {
        throw new Error("Assessment ID is required");
    }

    const normalizedType = assessmentType?.replace(/-/g, "_").toLowerCase();

    switch (normalizedType) {
        case "personal_care":
            return APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.GET_PERSONAL_CARE_ASSESSMENT_BY_ID(assessmentId);
        case "everyday_activities":
            return APIConfig.CLIENT_CARE_PLAN.EVERYDAY_ACTIVITIES_ASSESSMENT.GET_EVERYDAY_ACTIVITIES_ASSESSMENT_BY_ID(assessmentId);
        case "social_support":
            return APIConfig.CLIENT_CARE_PLAN.SOCIAL_SUPPORT_ASSESSMENT.GET_SOCIAL_SUPPORT_ASSESSMENT_BY_ID(assessmentId);
        case "environmental":
            return APIConfig.CLIENT_CARE_PLAN.ENVIRONMENTAL_ASSESSMENT.GET_ENVIRONMENTAL_ASSESSMENT_BY_ID(assessmentId);
        case "nutrition_hydration":
            return APIConfig.CLIENT_CARE_PLAN.NUTRITION_HYDRATION_ASSESSMENT.GET_NUTRITION_HYDRATION_ASSESSMENT_BY_ID(assessmentId);
        case "medical":
            return APIConfig.CLIENT_CARE_PLAN.MEDICAL_ASSESSMENT.GET_MEDICAL_ASSESSMENT_BY_ID(assessmentId);
        case "administration":
            return APIConfig.CLIENT_CARE_PLAN.ADMINISTRATION_ASSESSMENT.GET_ADMINISTRATION_ASSESSMENT_BY_ID(assessmentId);
        case "psychological":
            return APIConfig.CLIENT_CARE_PLAN.PSYCHOLOGICAL_ASSESSMENT.GET_PSYCHOLOGICAL_ASSESSMENT_BY_ID(assessmentId);
        default:
            throw new Error(`Unsupported initial assessment type: ${assessmentType}`);
    }
};

export const deleteAssessmentAPI = (assessmentType, assessmentId) => {
    if (!assessmentId) {
        throw new Error("Assessment ID is required");
    }

    const normalizedType = assessmentType?.replace(/-/g, "_").toLowerCase();

    switch (normalizedType) {
        case "personal_care":
            return APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.DELETE_PERSONAL_CARE_ASSESSMENT(assessmentId);
        case "everyday_activities":
            return APIConfig.CLIENT_CARE_PLAN.EVERYDAY_ACTIVITIES_ASSESSMENT.DELETE_EVERYDAY_ACTIVITIES_ASSESSMENT(assessmentId);
        case "social_support":
            return APIConfig.CLIENT_CARE_PLAN.SOCIAL_SUPPORT_ASSESSMENT.DELETE_SOCIAL_SUPPORT_ASSESSMENT(assessmentId);
        case "environmental":
            return APIConfig.CLIENT_CARE_PLAN.ENVIRONMENTAL_ASSESSMENT.DELETE_ENVIRONMENTAL_ASSESSMENT(assessmentId);
        case "nutrition_hydration":
            return APIConfig.CLIENT_CARE_PLAN.NUTRITION_HYDRATION_ASSESSMENT.DELETE_NUTRITION_HYDRATION_ASSESSMENT(assessmentId);
        case "medical":
            return APIConfig.CLIENT_CARE_PLAN.MEDICAL_ASSESSMENT.DELETE_MEDICAL_ASSESSMENT(assessmentId);
        case "administration":
            return APIConfig.CLIENT_CARE_PLAN.ADMINISTRATION_ASSESSMENT.DELETE_ADMINISTRATION_ASSESSMENT(assessmentId);
        case "psychological":
            return APIConfig.CLIENT_CARE_PLAN.PSYCHOLOGICAL_ASSESSMENT.DELETE_PSYCHOLOGICAL_ASSESSMENT(assessmentId);
        default:
            throw new Error(`Unsupported initial assessment type: ${assessmentType}`);
    }
};
