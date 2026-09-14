import APIConfig from "../../../../../../utils/ApiConfig";

export const getAdditionalAssessmentAPIEndpoint = (assessmentType, clientId) => {
  if (!clientId) throw new Error("Client ID is required");

  const type = assessmentType?.replace(/-/g, "_").toLowerCase();

  switch (type) {
    case "behaviour":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.BEHAVIOURAL_ASSESSMENT
        .GET_BEHAVIOURAL_ASSESSMENT_BY_CLIENT_ID(clientId);
    case "communication":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.COMMUNICATION_ASSESSMENT
        .GET_COMMUNICATION_ASSESSMENT_BY_CLIENT_ID(clientId);
    case "condition_specific":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.CONDITION_SPECIFIC_ASSESSMENT
        .GET_CONDITION_SPECIFIC_ASSESSMENT_BY_CLIENT_ID(clientId);
    case "covid":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.COVID_19_ASSESSMENT
        .GET_COVID_19_ASSESSMENT_BY_CLIENT_ID(clientId);
    case "control_substances":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.CONTROL_SUBSTANCES_ASSESSMENT
        .GET_CONTROL_SUBSTANCES_ASSESSMENT_BY_CLIENT_ID(clientId);
    case "dysphagia":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.DYSPHAGIA_ASSESSMENT
        .GET_DYSPHAGIA_ASSESSMENT_BY_CLIENT_ID(clientId);
    case "end_of_life":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.END_OF_LIFE_ASSESSMENT
        .GET_END_OF_LIFE_ASSESSMENT_BY_CLIENT_ID(clientId);
    case "environment_fire":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.ENVIRONMENTAL_AND_FIRE_ASSESSMENT
        .GET_ENVIRONMENTAL_AND_FIRE_ASSESSMENT_BY_CLIENT_ID(clientId);
    case "financial":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.FINANCIAL_ASSESSMENT
        .GET_FINANCIAL_ASSESSMENT_BY_CLIENT_ID(clientId);
    case "medication":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MEDICATION_ASSESSMENT
        .GET_MEDICATION_ASSESSMENT_BY_CLIENT_ID(clientId);
    case "mental_capacity":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MENTAL_CAPACITY_ASSESSMENT
        .GET_MENTAL_CAPACITY_ASSESSMENT_BY_CLIENT_ID(clientId);
    case "moving_handling":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MOVING_HANDLING_ASSESSMENT
        .GET_MOVING_HANDLING_ASSESSMENT_BY_CLIENT_ID(clientId);
    case "restrictive_practice":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.RESTRICTIVE_PRACTICE_ASSESSMENT
        .GET_RESTRICTIVE_PRACTICE_ASSESSMENT_BY_CLIENT_ID(clientId);
    case "seizures":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.SEIZURES_ASSESSMENT
        .GET_SEIZURES_ASSESSMENT_BY_CLIENT_ID(clientId);
    case "waterlow":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.WATERLOW_ASSESSMENT
        .GET_WATERLOW_ASSESSMENT_BY_CLIENT_ID(clientId);
    default:
      // Fallback to behaviour assessment so callers never get undefined
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.BEHAVIOURAL_ASSESSMENT
        .GET_BEHAVIOURAL_ASSESSMENT_BY_CLIENT_ID(clientId);
  }
};

export const createOrUpdateAdditionalAssessmentAPI = (
  assessmentType,
  operation,       
  assessmentId = null,
  clientId
) => {
  if (!clientId) throw new Error("Client ID is required");
  if (!["create", "update"].includes(operation))
    throw new Error("Operation must be 'create' or 'update'");
  if (operation === "update" && !assessmentId)
    throw new Error("Assessment ID is required for update");

  const type = assessmentType?.replace(/-/g, "_").toLowerCase();

  const choose = (createFn, updateFn) =>
    operation === "create" ? createFn(clientId) : updateFn(clientId);

  switch (type) {
    case "behaviour":
      return choose(
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.BEHAVIOURAL_ASSESSMENT.CREATE_BEHAVIOURAL_ASSESSMENT,
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.BEHAVIOURAL_ASSESSMENT.UPDATE_BEHAVIOURAL_ASSESSMENT
      );
    case "communication":
      return choose(
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.COMMUNICATION_ASSESSMENT.CREATE_COMMUNICATION_ASSESSMENT,
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.COMMUNICATION_ASSESSMENT.UPDATE_COMMUNICATION_ASSESSMENT
      );
    case "condition_specific":
      return choose(
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.CONDITION_SPECIFIC_ASSESSMENT.CREATE_CONDITION_SPECIFIC_ASSESSMENT,
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.CONDITION_SPECIFIC_ASSESSMENT.UPDATE_CONDITION_SPECIFIC_ASSESSMENT
      );
    case "covid":
      return choose(
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.COVID_19_ASSESSMENT.CREATE_COVID_19_ASSESSMENT,
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.COVID_19_ASSESSMENT.UPDATE_COVID_19_ASSESSMENT
      );
    case "control_substances":
      return choose(
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.CONTROL_SUBSTANCES_ASSESSMENT.CREATE_CONTROL_SUBSTANCES_ASSESSMENT,
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.CONTROL_SUBSTANCES_ASSESSMENT.UPDATE_CONTROL_SUBSTANCES_ASSESSMENT
      );
    case "dysphagia":
      return choose(
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.DYSPHAGIA_ASSESSMENT.CREATE_DYSPHAGIA_ASSESSMENT,
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.DYSPHAGIA_ASSESSMENT.UPDATE_DYSPHAGIA_ASSESSMENT
      );
    case "end_of_life":
      return choose(
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.END_OF_LIFE_ASSESSMENT.CREATE_END_OF_LIFE_ASSESSMENT,
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.END_OF_LIFE_ASSESSMENT.UPDATE_END_OF_LIFE_ASSESSMENT
      );
    case "environment_fire":
      return choose(
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.ENVIRONMENTAL_AND_FIRE_ASSESSMENT.CREATE_ENVIRONMENTAL_AND_FIRE_ASSESSMENT,
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.ENVIRONMENTAL_AND_FIRE_ASSESSMENT.UPDATE_ENVIRONMENTAL_AND_FIRE_ASSESSMENT
      );
    case "financial":
      return choose(
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.FINANCIAL_ASSESSMENT.CREATE_FINANCIAL_ASSESSMENT,
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.FINANCIAL_ASSESSMENT.UPDATE_FINANCIAL_ASSESSMENT
      );
    case "medication":
      return choose(
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MEDICATION_ASSESSMENT.CREATE_MEDICATION_ASSESSMENT,
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MEDICATION_ASSESSMENT.UPDATE_MEDICATION_ASSESSMENT
      );
    case "mental_capacity":
      return choose(
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MENTAL_CAPACITY_ASSESSMENT.CREATE_MENTAL_CAPACITY_ASSESSMENT,
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MENTAL_CAPACITY_ASSESSMENT.UPDATE_MENTAL_CAPACITY_ASSESSMENT
      );
    case "moving_handling":
      return choose(
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MOVING_HANDLING_ASSESSMENT.CREATE_MOVING_HANDLING_ASSESSMENT,
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MOVING_HANDLING_ASSESSMENT.UPDATE_MOVING_HANDLING_ASSESSMENT
      );
    case "restrictive_practice":
      return choose(
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.RESTRICTIVE_PRACTICE_ASSESSMENT.CREATE_RESTRICTIVE_PRACTICE_ASSESSMENT,
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.RESTRICTIVE_PRACTICE_ASSESSMENT.UPDATE_RESTRICTIVE_PRACTICE_ASSESSMENT
      );
    case "seizures":
      return choose(
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.SEIZURES_ASSESSMENT.CREATE_SEIZURES_ASSESSMENT,
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.SEIZURES_ASSESSMENT.UPDATE_SEIZURES_ASSESSMENT
      );
    case "waterlow":
      return choose(
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.WATERLOW_ASSESSMENT.CREATE_WATERLOW_ASSESSMENT,
        APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.WATERLOW_ASSESSMENT.UPDATE_WATERLOW_ASSESSMENT
      );
    default:
      throw new Error(`Unsupported additional assessment type: ${assessmentType}`);
  }
};


export const getAdditionalAssessmentByIdAPI = (assessmentType, assessmentId) => {
  if (!assessmentId) throw new Error("Assessment ID is required");

  const type = assessmentType?.replace(/-/g, "_").toLowerCase();

  switch (type) {
    case "behaviour":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.BEHAVIOURAL_ASSESSMENT
        .GET_BEHAVIOURAL_ASSESSMENT_BY_ID(assessmentId);
    case "communication":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.COMMUNICATION_ASSESSMENT
        .GET_COMMUNICATION_ASSESSMENT_BY_ID(assessmentId);
    case "condition_specific":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.CONDITION_SPECIFIC_ASSESSMENT
        .GET_CONDITION_SPECIFIC_ASSESSMENT_BY_ID(assessmentId);
    case "covid":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.COVID_19_ASSESSMENT
        .GET_COVID_19_ASSESSMENT_BY_ID(assessmentId);
    case "control_substances":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.CONTROL_SUBSTANCES_ASSESSMENT
        .GET_CONTROL_SUBSTANCES_ASSESSMENT_BY_ID(assessmentId);
    case "dysphagia":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.DYSPHAGIA_ASSESSMENT
        .GET_DYSPHAGIA_ASSESSMENT_BY_ID(assessmentId);
    case "end_of_life":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.END_OF_LIFE_ASSESSMENT
        .GET_END_OF_LIFE_ASSESSMENT_BY_ID(assessmentId);
    case "environment_fire":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.ENVIRONMENTAL_AND_FIRE_ASSESSMENT
        .GET_ENVIRONMENTAL_AND_FIRE_ASSESSMENT_BY_ID(assessmentId);
    case "financial":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.FINANCIAL_ASSESSMENT
        .GET_FINANCIAL_ASSESSMENT_BY_ID(assessmentId);
    case "medication":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MEDICATION_ASSESSMENT
        .GET_MEDICATION_ASSESSMENT_BY_ID(assessmentId);
    case "mental_capacity":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MENTAL_CAPACITY_ASSESSMENT
        .GET_MENTAL_CAPACITY_ASSESSMENT_BY_ID(assessmentId);
    case "moving_handling":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MOVING_HANDLING_ASSESSMENT
        .GET_MOVING_HANDLING_ASSESSMENT_BY_ID(assessmentId);
    case "restrictive_practice":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.RESTRICTIVE_PRACTICE_ASSESSMENT
        .GET_RESTRICTIVE_PRACTICE_ASSESSMENT_BY_ID(assessmentId);
    case "seizures":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.SEIZURES_ASSESSMENT
        .GET_SEIZURES_ASSESSMENT_BY_ID(assessmentId);
    case "waterlow":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.WATERLOW_ASSESSMENT
        .GET_WATERLOW_ASSESSMENT_BY_ID(assessmentId);
    default:
      throw new Error(`Unsupported additional assessment type: ${assessmentType}`);
  }
};


export const deleteAdditionalAssessmentAPI = (assessmentType, assessmentId) => {
  if (!assessmentId) throw new Error("Assessment ID is required");

  const type = assessmentType?.replace(/-/g, "_").toLowerCase();

  switch (type) {
    case "behaviour":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.BEHAVIOURAL_ASSESSMENT
        .DELETE_BEHAVIOURAL_ASSESSMENT(assessmentId);
    case "communication":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.COMMUNICATION_ASSESSMENT
        .DELETE_COMMUNICATION_ASSESSMENT(assessmentId);
    case "condition_specific":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.CONDITION_SPECIFIC_ASSESSMENT
        .DELETE_CONDITION_SPECIFIC_ASSESSMENT(assessmentId);
    case "covid":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.COVID_19_ASSESSMENT
        .DELETE_COVID_19_ASSESSMENT(assessmentId);
    case "control_substances":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.CONTROL_SUBSTANCES_ASSESSMENT
        .DELETE_CONTROL_SUBSTANCES_ASSESSMENT(assessmentId);
    case "dysphagia":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.DYSPHAGIA_ASSESSMENT
        .DELETE_DYSPHAGIA_ASSESSMENT(assessmentId);
    case "end_of_life":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.END_OF_LIFE_ASSESSMENT
        .DELETE_END_OF_LIFE_ASSESSMENT(assessmentId);
    case "environment_fire":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.ENVIRONMENTAL_AND_FIRE_ASSESSMENT
        .DELETE_ENVIRONMENTAL_AND_FIRE_ASSESSMENT(assessmentId);
    case "financial":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.FINANCIAL_ASSESSMENT
        .DELETE_FINANCIAL_ASSESSMENT(assessmentId);
    case "medication":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MEDICATION_ASSESSMENT
        .DELETE_MEDICATION_ASSESSMENT(assessmentId);
    case "mental_capacity":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MENTAL_CAPACITY_ASSESSMENT
        .DELETE_MENTAL_CAPACITY_ASSESSMENT(assessmentId);
    case "moving_handling":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.MOVING_HANDLING_ASSESSMENT
        .DELETE_MOVING_HANDLING_ASSESSMENT(assessmentId);
    case "restrictive_practice":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.RESTRICTIVE_PRACTICE_ASSESSMENT
        .DELETE_RESTRICTIVE_PRACTICE_ASSESSMENT(assessmentId);
    case "seizures":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.SEIZURES_ASSESSMENT
        .DELETE_SEIZURES_ASSESSMENT(assessmentId);
    case "waterlow":
      return APIConfig.CLIENT_CARE_PLAN.ADDITIONAL_ASSESSMENT.WATERLOW_ASSESSMENT
        .DELETE_WATERLOW_ASSESSMENT(assessmentId);
    default:
      throw new Error(`Unsupported additional assessment type: ${assessmentType}`);
  }
};


export const getAdditionalAssessmentNameFromRoute = (route) => {
    switch (route) {
        case "behaviour":
            return "behaviourId";
        case "communication":
            return "communicationId";
        case "condition_specific":
            return "conditionSpecificId";
        case "covid":
            return "covidId";
        case "control_substances":
            return "controlSubstancesId";
        case "dysphagia":
            return "dysphagiaId";
        case "end_of_life":
            return "endOfLifeId";
        case "environment_fire":
            return "environmentFireId";
        case "financial":
            return "financialId";
        case "medication":
            return "medicationId";
        case "mental_capacity":
            return "mentalCapacityId";
        case "moving_handling":
            return "movingHandlingId";
        case "restrictive_practice":
            return "restrictivePracticeId";
        case "seizures":
            return "seizuresId";
        case "waterlow":
            return "waterlowId";
        default:
            return "behaviourId";
    }
};


