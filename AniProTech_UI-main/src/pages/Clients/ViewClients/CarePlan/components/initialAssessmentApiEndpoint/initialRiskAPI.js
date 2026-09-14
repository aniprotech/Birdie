import APIConfig from "../../../../../../utils/ApiConfig";

export const createRiskAPI = (assessmentType, clientId) => {
    switch(assessmentType) {
        case "personal_care":
            return APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.CREATE_PERSONAL_CARE_RISK(clientId); 
        case "everyday_activities":
            return APIConfig.CLIENT_CARE_PLAN.EVERYDAY_ACTIVITIES_ASSESSMENT.CREATE_EVERYDAY_ACTIVITIES_RISK(clientId);
        case "social_support":
            return APIConfig.CLIENT_CARE_PLAN.SOCIAL_SUPPORT_ASSESSMENT.CREATE_SOCIAL_SUPPORT_RISK(clientId);
        case "environmental":
            return APIConfig.CLIENT_CARE_PLAN.ENVIRONMENTAL_ASSESSMENT.CREATE_ENVIRONMENTAL_RISK(clientId);
        case "nutrition_hydration":
            return APIConfig.CLIENT_CARE_PLAN.NUTRITION_HYDRATION_ASSESSMENT.CREATE_NUTRITION_HYDRATION_RISK(clientId);
        case "medical":
            return APIConfig.CLIENT_CARE_PLAN.MEDICAL_ASSESSMENT.CREATE_MEDICAL_RISK(clientId);
        case "administration":
            return APIConfig.CLIENT_CARE_PLAN.ADMINISTRATION_ASSESSMENT.CREATE_ADMINISTRATION_RISK(clientId);
        case "psychological":
            return APIConfig.CLIENT_CARE_PLAN.PSYCHOLOGICAL_ASSESSMENT.CREATE_PSYCHOLOGICAL_RISK(clientId);
        default:
            return null;
    }
}

export const getRiskByIdAPI = (assessmentType, clientId) => {
    switch(assessmentType) {
        case "personal_care":
            return APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.GET_PERSONAL_CARE_RISK_BY_ID(clientId);
        case "everyday_activities":
            return APIConfig.CLIENT_CARE_PLAN.EVERYDAY_ACTIVITIES_ASSESSMENT.GET_EVERYDAY_ACTIVITIES_RISK_BY_ID(clientId);
        case "social_support":
            return APIConfig.CLIENT_CARE_PLAN.SOCIAL_SUPPORT_ASSESSMENT.GET_SOCIAL_SUPPORT_RISK_BY_ID(clientId);
        case "environmental":
            return APIConfig.CLIENT_CARE_PLAN.ENVIRONMENTAL_ASSESSMENT.GET_ENVIRONMENTAL_RISK_BY_ID(clientId);
        case "nutrition_hydration":
            return APIConfig.CLIENT_CARE_PLAN.NUTRITION_HYDRATION_ASSESSMENT.GET_NUTRITION_HYDRATION_RISK_BY_ID(clientId);
        case "medical":
            return APIConfig.CLIENT_CARE_PLAN.MEDICAL_ASSESSMENT.GET_MEDICAL_RISK_BY_ID(clientId);
        case "administration":
            return APIConfig.CLIENT_CARE_PLAN.ADMINISTRATION_ASSESSMENT.GET_ADMINISTRATION_RISK_BY_ID(clientId);
        case "psychological":
            return APIConfig.CLIENT_CARE_PLAN.PSYCHOLOGICAL_ASSESSMENT.GET_PSYCHOLOGICAL_RISK_BY_ID(clientId);
        default:
            return null;
    }
}

export const deleteRiskAPI = (assessmentType, clientId) => {
    switch(assessmentType) {
        case "personal_care":
            return APIConfig.CLIENT_CARE_PLAN.PERSONAL_CARE_ASSESSMENT.DELETE_PERSONAL_CARE_RISK(clientId);
        case "everyday_activities":
            return APIConfig.CLIENT_CARE_PLAN.EVERYDAY_ACTIVITIES_ASSESSMENT.DELETE_EVERYDAY_ACTIVITIES_RISK(clientId);
        case "social_support":
            return APIConfig.CLIENT_CARE_PLAN.SOCIAL_SUPPORT_ASSESSMENT.DELETE_SOCIAL_SUPPORT_RISK(clientId);
        case "environmental":
            return APIConfig.CLIENT_CARE_PLAN.ENVIRONMENTAL_ASSESSMENT.DELETE_ENVIRONMENTAL_RISK(clientId);
        case "nutrition_hydration":
            return APIConfig.CLIENT_CARE_PLAN.NUTRITION_HYDRATION_ASSESSMENT.DELETE_NUTRITION_HYDRATION_RISK(clientId);
        case "medical":
            return APIConfig.CLIENT_CARE_PLAN.MEDICAL_ASSESSMENT.DELETE_MEDICAL_RISK(clientId);
        case "administration":
            return APIConfig.CLIENT_CARE_PLAN.ADMINISTRATION_ASSESSMENT.DELETE_ADMINISTRATION_RISK(clientId);
        case "psychological":
            return APIConfig.CLIENT_CARE_PLAN.PSYCHOLOGICAL_ASSESSMENT.DELETE_PSYCHOLOGICAL_RISK(clientId);
        default:
            return null;
    }
}
