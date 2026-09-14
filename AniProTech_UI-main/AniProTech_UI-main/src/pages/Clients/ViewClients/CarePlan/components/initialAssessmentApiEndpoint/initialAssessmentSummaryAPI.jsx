import APIConfig from "../../../../../../utils/ApiConfig";

export const getInitialAssessmentSummaryAPI = (assessmentType, clientId) => {
    switch(assessmentType) {
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
            return APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.GET_PERSONAL_CARE_ASSESSMENT_BY_CLIENT_ID(clientId);
    }
}