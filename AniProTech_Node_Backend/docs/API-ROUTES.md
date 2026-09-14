# API route inventory

## AuthController

- POST /api/auth/request-link
- POST /api/auth/get-token
- POST /api/auth/validate-token

## CarePlanMedicationController

- GET /api/client-care-plan/medication/{clientId}
- POST /api/client-care-plan/medication/assessment/{clientId}
- GET /api/client-care-plan/medication/assessment/{id}
- DELETE /api/client-care-plan/medication/assessment/{id}
- POST /api/client-care-plan/medication/risk/{clientId}
- GET /api/client-care-plan/medication/risk/{id}
- DELETE /api/client-care-plan/medication/risk/{id}

## ClientAdministrativeController

- GET /api/client-care-plan/administrative/{clientId}
- PUT /api/client-care-plan/administrative/{clientId}
- POST /api/client-care-plan/administrative/assessment/{clientId}
- GET /api/client-care-plan/administrative/assessment/{id}
- DELETE /api/client-care-plan/administrative/assessment/{id}
- POST /api/client-care-plan/administrative/risk/{clientId}
- GET /api/client-care-plan/administrative/risk/{id}
- DELETE /api/client-care-plan/administrative/risk/{id}

## ClientBehaviourController

- GET /api/client-care-plan/behaviour/{clientId}
- POST /api/client-care-plan/behaviour/assessment/{clientId}
- GET /api/client-care-plan/behaviour/assessment/{id}
- DELETE /api/client-care-plan/behaviour/assessment/{id}
- POST /api/client-care-plan/behaviour/risk/{clientId}
- GET /api/client-care-plan/behaviour/risk/{id}
- DELETE /api/client-care-plan/behaviour/risk/{id}

## ClientCareCircleController

- POST /api/client-care-circle/create
- PUT /api/client-care-circle/update/{id}
- PUT /api/client-care-circle/invitation/{id}
- DELETE /api/client-care-circle/delete/{id}
- GET /api/client-care-circle/client/{clientId}
- GET /api/client-care-circle/{id}

## ClientCarePlanController

- GET /api/care-plan/risk/{id}
- DELETE /api/care-plan/risk/{id}

## ClientCareTeamController

- POST /api/client-care-team/getByClient/{clientId}
- PUT /api/client-care-team/update/{clientId}
- PUT /api/client-care-team/bulk-update/{clientId}

## ClientCommunicationController

- GET /api/client-care-plan/communication/{clientId}
- POST /api/client-care-plan/communication/assessment/{clientId}
- GET /api/client-care-plan/communication/assessment/{id}
- DELETE /api/client-care-plan/communication/assessment/{id}
- POST /api/client-care-plan/communication/risk/{clientId}
- GET /api/client-care-plan/communication/risk/{id}
- DELETE /api/client-care-plan/communication/risk/{id}

## ClientConditionSpecificController

- GET /api/client-care-plan/condition-specific/{clientId}
- POST /api/client-care-plan/condition-specific/assessment/{clientId}
- GET /api/client-care-plan/condition-specific/assessment/{id}
- DELETE /api/client-care-plan/condition-specific/assessment/{id}
- POST /api/client-care-plan/condition-specific/risk/{clientId}
- GET /api/client-care-plan/condition-specific/risk/{id}
- DELETE /api/client-care-plan/condition-specific/risk/{id}

## ClientController

- POST /api/client/get-all-clients
- GET /api/client/get-client/{id}
- POST /api/client/create

## ClientControlSubstancesController

- GET /api/client-care-plan/control-substances/{clientId}
- POST /api/client-care-plan/control-substances/assessment/{clientId}
- GET /api/client-care-plan/control-substances/assessment/{id}
- DELETE /api/client-care-plan/control-substances/assessment/{id}
- POST /api/client-care-plan/control-substances/risk/{clientId}
- GET /api/client-care-plan/control-substances/risk/{id}
- DELETE /api/client-care-plan/control-substances/risk/{id}

## ClientCovidController

- GET /api/client-care-plan/covid/{clientId}
- POST /api/client-care-plan/covid/assessment/{clientId}
- GET /api/client-care-plan/covid/assessment/{id}
- DELETE /api/client-care-plan/covid/assessment/{id}
- POST /api/client-care-plan/covid/risk/{clientId}
- GET /api/client-care-plan/covid/risk/{id}
- DELETE /api/client-care-plan/covid/risk/{id}

## ClientDysphagiaController

- GET /api/client-care-plan/dysphagia/{clientId}
- POST /api/client-care-plan/dysphagia/assessment/{clientId}
- GET /api/client-care-plan/dysphagia/assessment/{id}
- DELETE /api/client-care-plan/dysphagia/assessment/{id}
- POST /api/client-care-plan/dysphagia/risk/{clientId}
- GET /api/client-care-plan/dysphagia/risk/{id}
- DELETE /api/client-care-plan/dysphagia/risk/{id}

## ClientEndOfLifeController

- GET /api/client-care-plan/end-of-life/{clientId}
- POST /api/client-care-plan/end-of-life/assessment/{clientId}
- GET /api/client-care-plan/end-of-life/assessment/{id}
- DELETE /api/client-care-plan/end-of-life/assessment/{id}
- POST /api/client-care-plan/end-of-life/risk/{clientId}
- GET /api/client-care-plan/end-of-life/risk/{id}
- DELETE /api/client-care-plan/end-of-life/risk/{id}

## ClientEnvironmentalController

- GET /api/client-care-plan/environmental/{clientId}
- PUT /api/client-care-plan/environmental/{clientId}
- POST /api/client-care-plan/environmental/assessment/{clientId}
- GET /api/client-care-plan/environmental/assessment/{id}
- DELETE /api/client-care-plan/environmental/assessment/{id}
- POST /api/client-care-plan/environmental/risk/{clientId}
- GET /api/client-care-plan/environmental/risk/{id}
- DELETE /api/client-care-plan/environmental/risk/{id}

## ClientEnvironmentFireController

- GET /api/client-care-plan/environment-fire/{clientId}
- POST /api/client-care-plan/environment-fire/assessment/{clientId}
- GET /api/client-care-plan/environment-fire/assessment/{id}
- DELETE /api/client-care-plan/environment-fire/assessment/{id}
- POST /api/client-care-plan/environment-fire/risk/{clientId}
- GET /api/client-care-plan/environment-fire/risk/{id}
- DELETE /api/client-care-plan/environment-fire/risk/{id}

## ClientEveryDayActivityController

- GET /api/client-care-plan/every-day-activity/{clientId}
- PUT /api/client-care-plan/every-day-activity/{clientId}
- POST /api/client-care-plan/every-day-activity/assessment/{clientId}
- GET /api/client-care-plan/every-day-activity/assessment/{id}
- DELETE /api/client-care-plan/every-day-activity/assessment/{id}
- POST /api/client-care-plan/every-day-activity/risk/{clientId}
- GET /api/client-care-plan/every-day-activity/risk/{clientId}
- DELETE /api/client-care-plan/every-day-activity/risk/{clientId}

## ClientFinancialController

- GET /api/client-care-plan/financial/{clientId}
- POST /api/client-care-plan/financial/assessment/{clientId}
- GET /api/client-care-plan/financial/assessment/{id}
- DELETE /api/client-care-plan/financial/assessment/{id}
- POST /api/client-care-plan/financial/risk/{clientId}
- GET /api/client-care-plan/financial/risk/{id}
- DELETE /api/client-care-plan/financial/risk/{id}

## ClientInformationController

- GET /api/client-information/{userId}
- POST /api/client-information/update/{userId}

## ClientMedicationController

- POST /api/client-medication/create/{userId}
- PUT /api/client-medication/update/{id}
- GET /api/client-medication/get-by-id/{userId}

## ClientMedicationSchedulingController

- POST /api/client-medication-scheduling/create/{userId}
- GET /api/client-medication-scheduling/get-all-by-client-id/{userId}
- GET /api/client-medication-scheduling/get-by-id/{id}
- PUT /api/client-medication-scheduling/update/{id}
- DELETE /api/client-medication-scheduling/delete/{id}
- PUT /api/client-medication-scheduling/stop-scheduling/{id}
- PUT /api/client-medication-scheduling/update/past-administration

## ClientMentalCapacityController

- GET /api/client-care-plan/mental-capacity/{clientId}
- POST /api/client-care-plan/mental-capacity/assessment/{clientId}
- GET /api/client-care-plan/mental-capacity/assessment/{id}
- DELETE /api/client-care-plan/mental-capacity/assessment/{id}
- POST /api/client-care-plan/mental-capacity/risk/{clientId}
- GET /api/client-care-plan/mental-capacity/risk/{id}
- DELETE /api/client-care-plan/mental-capacity/risk/{id}

## ClientNutritionHydrationController

- GET /api/client-care-plan/nutrition-hydration/{clientId}
- PUT /api/client-care-plan/nutrition-hydration/{clientId}
- POST /api/client-care-plan/nutrition-hydration/assessment/{clientId}
- GET /api/client-care-plan/nutrition-hydration/assessment/{id}
- DELETE /api/client-care-plan/nutrition-hydration/assessment/{id}
- POST /api/client-care-plan/nutrition-hydration/risk/{clientId}
- GET /api/client-care-plan/nutrition-hydration/risk/{id}
- DELETE /api/client-care-plan/nutrition-hydration/risk/{id}

## ClientPersonalCareController

- GET /api/client-care-plan/personal-care/{clientId}
- PUT /api/client-care-plan/personal-care/{clientId}
- GET /api/client-care-plan/personal-care/assessment/{id}
- POST /api/client-care-plan/personal-care/assessment/{clientId}
- DELETE /api/client-care-plan/personal-care/assessment/{id}
- POST /api/client-care-plan/personal-care/risk/{clientId}
- GET /api/client-care-plan/personal-care/risk/{clientId}
- DELETE /api/client-care-plan/personal-care/risk/{clientId}

## ClientPsychologicalController

- GET /api/client-care-plan/psychological/{clientId}
- PUT /api/client-care-plan/psychological/{clientId}
- POST /api/client-care-plan/psychological/assessment/{clientId}
- GET /api/client-care-plan/psychological/assessment/{id}
- DELETE /api/client-care-plan/psychological/assessment/{id}
- POST /api/client-care-plan/psychological/risk/{clientId}
- GET /api/client-care-plan/psychological/risk/{id}
- DELETE /api/client-care-plan/psychological/risk/{id}

## ClientSettingsController

- GET /api/client-settings/getByClient/{userId}
- PUT /api/client-settings/update/{userId}
- POST /api/client-settings/regenerate-qrcode/{userId}

## ClientShareAccessController

- POST /api/client-share-access/generate
- GET /api/client-share-access/{clientId}
- POST /api/client-share-access/send-magic-link

## ClientSignatureDocumentController

- POST /api/client-care-plan/signature/upload
- GET /api/client-care-plan/signature/uploaded-documents/{clientId}
- GET /api/client-care-plan/signature/signed-documents/{clientId}
- POST /api/client-care-plan/signature/save-signed-documents
- GET /api/client-care-plan/signature/document-pack/{clientId}
- POST /api/client-care-plan/signature/document-pack/create
- DELETE /api/client-care-plan/signature/document-pack/delete/{packId}

## ClientSocialSupportController

- GET /api/client-care-plan/social-support/{clientId}
- PUT /api/client-care-plan/social-support/{clientId}
- POST /api/client-care-plan/social-support/assessment/{clientId}
- GET /api/client-care-plan/social-support/assessment/{id}
- DELETE /api/client-care-plan/social-support/assessment/{id}
- POST /api/client-care-plan/social-support/risk/{clientId}
- GET /api/client-care-plan/social-support/risk/{id}
- DELETE /api/client-care-plan/social-support/risk/{id}

## ClientTaskPlanController

- GET /api/client-task-plan/categories
- POST /api/client-task-plan/categories/tasks
- POST /api/client-task-plan/tasks
- POST /api/client-task-plan/create
- PUT /api/client-task-plan/update/{taskPlanId}
- DELETE /api/client-task-plan/delete/{taskPlanId}
- POST /api/client-task-plan/getByClient/{userId}
- GET /api/client-task-plan/getByClient/{userId}
- GET /api/client-task-plan/getById/{taskPlanId}

## ClientUploadDocumentController

- POST /api/client-care-plan/files/upload-document
- GET /api/client-care-plan/files/{clientId}
- PUT /api/client-care-plan/files/update/{fileId}
- DELETE /api/client-care-plan/files/delete-document/{fileId}

## TeamAbsenceController

- POST /api/team-absence/create/{userId}
- POST /api/team-absence/getAll/{userId}
- DELETE /api/team-absence/delete/{id}

## TeamAvailabilityController

- POST /api/team-availability/create/{userId}
- POST /api/team-availability/getAll/{userId}
- DELETE /api/team-availability/delete/{id}

## TeamClientsController

- POST /api/team-clients/getByTeamMember/{teamMemberId}
- PUT /api/team-clients/update/{teamMemberId}
- PUT /api/team-clients/bulk-update/{teamMemberId}

## TeamController

- POST /api/team/create-user
- PUT /api/team/update-user/{userId}
- POST /api/team/get-all-users
- GET /api/team/get-user/{id}

## TeamOnboardingController

- GET /api/team-onboarding/{userId}
- POST /api/team-onboarding/update/{userId}

## TeamOperationsController

- GET /api/team-operations/get/{userId}
- PUT /api/team-operations/update/{userId}

## TeamSettingController

- POST /api/team/reset/{userId}
- POST /api/team/invite/{userId}

## TeamSkillsController

- GET /api/team/skills/get/{userId}
- POST /api/team/skills/update/{userId}
- DELETE /api/team/skills/delete/{id}