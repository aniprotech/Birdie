import APIConfig from "../../../../../../utils/ApiConfig";

export const createAdditionalAssessmentRiskAPI = (assessmentType, clientId) => {
    switch(assessmentType) {
        case "behaviour":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.BEHAVIOURAL_ASSESSMENT.CREATE_BEHAVIOURAL_RISK(clientId); 
        case "communication":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.COMMUNICATION_ASSESSMENT.CREATE_COMMUNICATION_RISK(clientId);
        case "condition_specific":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.CONDITION_SPECIFIC_ASSESSMENT.CREATE_CONDITION_SPECIFIC_RISK(clientId);
        case "covid":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.COVID_19_ASSESSMENT.CREATE_COVID_19_RISK(clientId);
        case "control_substances":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.CONTROL_SUBSTANCES_ASSESSMENT.CREATE_CONTROL_SUBSTANCES_RISK(clientId);
        case "dysphagia":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.DYSPHAGIA_ASSESSMENT.CREATE_DYSPHAGIA_RISK(clientId);
        case "end_of_life":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.END_OF_LIFE_ASSESSMENT.CREATE_END_OF_LIFE_RISK(clientId);
        case "environment_fire":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.ENVIRONMENTAL_AND_FIRE_ASSESSMENT.CREATE_ENVIRONMENTAL_AND_FIRE_RISK(clientId);
        case "financial":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.FINANCIAL_ASSESSMENT.CREATE_FINANCIAL_RISK(clientId);
        case "medication":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MEDICATION_ASSESSMENT.CREATE_MEDICATION_RISK(clientId);
        case "mental_capacity":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MENTAL_CAPACITY_ASSESSMENT.CREATE_MENTAL_CAPACITY_RISK(clientId);
        case "moving_handling":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MOVING_HANDLING_ASSESSMENT.CREATE_MOVING_HANDLING_RISK(clientId);
        case "restrictive_practice":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.RESTRICTIVE_PRACTICE_ASSESSMENT.CREATE_RESTRICTIVE_PRACTICE_RISK(clientId);
        case "seizures":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.SEIZURES_ASSESSMENT.CREATE_SEIZURES_RISK(clientId);
        case "waterlow":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.WATERLOW_ASSESSMENT.CREATE_WATERLOW_RISK(clientId);
        default:
            return null;
    }
}

export const getAdditionalAssessmentRiskByIdAPI = (assessmentType, clientId) => {
    switch(assessmentType) {
        case "behaviour":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.BEHAVIOURAL_ASSESSMENT.GET_BEHAVIOURAL_RISK_BY_ID(clientId);
        case "communication":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.COMMUNICATION_ASSESSMENT.GET_COMMUNICATION_RISK_BY_ID(clientId);
        case "condition_specific":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.CONDITION_SPECIFIC_ASSESSMENT.GET_CONDITION_SPECIFIC_RISK_BY_ID(clientId);
        case "covid":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.COVID_19_ASSESSMENT.GET_COVID_19_RISK_BY_ID(clientId);
        case "control_substances":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.CONTROL_SUBSTANCES_ASSESSMENT.GET_CONTROL_SUBSTANCES_RISK_BY_ID(clientId);
        case "dysphagia":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.DYSPHAGIA_ASSESSMENT.GET_DYSPHAGIA_RISK_BY_ID(clientId);
        case "end_of_life":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.END_OF_LIFE_ASSESSMENT.GET_END_OF_LIFE_RISK_BY_ID(clientId);
        case "environment_fire":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.ENVIRONMENTAL_AND_FIRE_ASSESSMENT.GET_ENVIRONMENTAL_AND_FIRE_RISK_BY_ID(clientId);
        case "financial":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.FINANCIAL_ASSESSMENT.GET_FINANCIAL_RISK_BY_ID(clientId);
        case "medication":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MEDICATION_ASSESSMENT.GET_MEDICATION_RISK_BY_ID(clientId);
        case "mental_capacity":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MENTAL_CAPACITY_ASSESSMENT.GET_MENTAL_CAPACITY_RISK_BY_ID(clientId);
        case "moving_handling":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MOVING_HANDLING_ASSESSMENT.GET_MOVING_HANDLING_RISK_BY_ID(clientId);
        case "restrictive_practice":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.RESTRICTIVE_PRACTICE_ASSESSMENT.GET_RESTRICTIVE_PRACTICE_RISK_BY_ID(clientId);
        case "seizures":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.SEIZURES_ASSESSMENT.GET_SEIZURES_RISK_BY_ID(clientId);
        case "waterlow":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.WATERLOW_ASSESSMENT.GET_WATERLOW_RISK_BY_ID(clientId);
        default:
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.BEHAVIOURAL_ASSESSMENT.GET_BEHAVIOURAL_RISK_BY_ID(clientId);
    }
}

export const deleteAdditionalAssessmentRiskAPI = (assessmentType, clientId) => {
    switch(assessmentType) {
        case "behaviour":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.BEHAVIOURAL_ASSESSMENT.DELETE_BEHAVIOURAL_RISK(clientId);
        case "communication":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.COMMUNICATION_ASSESSMENT.DELETE_COMMUNICATION_RISK(clientId);
        case "condition_specific":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.CONDITION_SPECIFIC_ASSESSMENT.DELETE_CONDITION_SPECIFIC_RISK(clientId);
        case "covid":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.COVID_19_ASSESSMENT.DELETE_COVID_19_RISK(clientId);
        case "control_substances":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.CONTROL_SUBSTANCES_ASSESSMENT.DELETE_CONTROL_SUBSTANCES_RISK(clientId);
        case "dysphagia":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.DYSPHAGIA_ASSESSMENT.DELETE_DYSPHAGIA_RISK(clientId);
        case "end_of_life":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.END_OF_LIFE_ASSESSMENT.DELETE_END_OF_LIFE_RISK(clientId);
        case "environment_fire":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.ENVIRONMENTAL_AND_FIRE_ASSESSMENT.DELETE_ENVIRONMENTAL_AND_FIRE_RISK(clientId);
        case "financial":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.FINANCIAL_ASSESSMENT.DELETE_FINANCIAL_RISK(clientId);
        case "medication":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MEDICATION_ASSESSMENT.DELETE_MEDICATION_RISK(clientId);
        case "mental_capacity":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MENTAL_CAPACITY_ASSESSMENT.DELETE_MENTAL_CAPACITY_RISK(clientId);
        case "moving_handling":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MOVING_HANDLING_ASSESSMENT.DELETE_MOVING_HANDLING_RISK(clientId);
        case "restrictive_practice":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.RESTRICTIVE_PRACTICE_ASSESSMENT.DELETE_RESTRICTIVE_PRACTICE_RISK(clientId);
        case "seizures":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.SEIZURES_ASSESSMENT.DELETE_SEIZURES_RISK(clientId);
        case "waterlow":
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.WATERLOW_ASSESSMENT.DELETE_WATERLOW_RISK(clientId);
        default:
            return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.BEHAVIOURAL_ASSESSMENT.DELETE_BEHAVIOURAL_RISK(clientId);
    }
}
