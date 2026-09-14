const BASE_URL = `${(
    import.meta.env.VITE_APP_BASE_LIVE_URL || "https://backend.aniprotech.com"
).replace(/\/$/, "")}/api`;

const APIConfig = {
    USERS: {
        GET_ALL: `${BASE_URL}/team/get-all-users`,
        GET_BY_ID: (id) => `${BASE_URL}/team/get-user/${id}`,
        CREATE: `${BASE_URL}/team/create-user`,
        UPDATE: (id) => `${BASE_URL}/team/update-user/${id}`,
    },
    TEAMS: {
        TEAM_OPERATION_UPDATE: (id) => `${BASE_URL}/team-operations/update/${id}`,
        TEAM_OPERATION_GET_BY_ID: (id) => `${BASE_URL}/team-operations/get/${id}`,
        TEAM_ONBOARDING_UPDATE: (id) => `${BASE_URL}/team-onboarding/update/${id}`,
        TEAM_ONBOARDING_GET_BY_ID: (id) => `${BASE_URL}/team-onboarding/${id}`,
        TEAM_SKILLS_UPDATE: (id) => `${BASE_URL}/team/skills/update/${id}`,
        TEAM_SKILLS_GET_BY_ID: (id) => `${BASE_URL}/team/skills/get/${id}`,
        TEAM_AVAILABILITY_CREATE: (id) => `${BASE_URL}/team-availability/create/${id}`,
        TEAM_AVAILABILITY_GET_ALL: (id) => `${BASE_URL}/team-availability/getAll/${id}`,
        TEAM_AVAILABILITY_DELETE: (id) => `${BASE_URL}/team-availability/delete/${id}`,
        TEAM_AVAILABILITY_BOOKING_CREATE: (id) => `${BASE_URL}/team-absence/create/${id}`,
        TEAM_AVAILABILITY_BOOKING_GET_ALL: (id) => `${BASE_URL}/team-absence/getAll/${id}`,
        TEAM_AVAILABILITY_BOOKING_DELETE: (id) => `${BASE_URL}/team-absence/delete/${id}`,
        TEAM_INVITE: (id) => `${BASE_URL}/team/invite/${id}`,
        TEAM_RESET: (id) => `${BASE_URL}/team/reset/${id}`,
        TEAM_CLIENTS_GET_BY_CLIENT: (clientId) => `${BASE_URL}/team-clients/getByTeamMember/${clientId}`,
        TEAM_CLIENTS_UPDATE: (clientId) => `${BASE_URL}/team-clients/update/${clientId}`,
        TEAM_CLIENTS_BULK_UPDATE: (clientId) => `${BASE_URL}/team-clients/bulk-update/${clientId}`,
    },
    CLIENTS: {
        CREATE: `${BASE_URL}/client/create`,
        GET_ALL: `${BASE_URL}/client/get-all-clients`,
        GET_BY_ID: (id) => `${BASE_URL}/client/get-client/${id}`,
        UPDATE: (id) => `${BASE_URL}/client/update/${id}`,
        DELETE: (id) => `${BASE_URL}/client/delete/${id}`,
        CLIENT_INFO_UPDATE: (id) => `${BASE_URL}/client-information/update/${id}`,
        CLIENT_INFO_GET_BY_ID: (id) => `${BASE_URL}/client-information/${id}`,
        MEDICATION_CREATE: (id) => `${BASE_URL}/client-medication/create/${id}`,
        MEDICATION_GET_BY_ID: (id) => `${BASE_URL}/client-medication/get-by-id/${id}`,
        MEDICATION_UPDATE: (id) => `${BASE_URL}/client-medication/update/${id}`,
        MEDICATION_DELETE: (id) => `${BASE_URL}/client-medication/delete/${id}`,
    },
    CLIENT_TASK_PLAN: {
        GET_CATEGORIES: `${BASE_URL}/client-task-plan/categories`,
        GET_TASKS_BY_CATEGORIES: `${BASE_URL}/client-task-plan/categories/tasks`,
        CREATE: `${BASE_URL}/client-task-plan/create`,
        UPDATE: (id) => `${BASE_URL}/client-task-plan/update/${id}`,
        GET_BY_CLIENT: (userId) => `${BASE_URL}/client-task-plan/getByClient/${userId}`,
        GET_BY_ID: (id) => `${BASE_URL}/client-task-plan/getById/${id}`,
        DELETE: (id) => `${BASE_URL}/client-task-plan/delete/${id}`,
        GET_ALL_TASKS: `${BASE_URL}/client-task-plan/tasks`,
    },
    CLIENT_CARE_CIRCLE: {
        CREATE: `${BASE_URL}/client-care-circle/create`,
        GET_ALL_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-circle/client/${id}`,
        GET_BY_ID: (id) => `${BASE_URL}/client-care-circle/${id}`,
        UPDATE: (id) => `${BASE_URL}/client-care-circle/update/${id}`,
        DELETE: (id) => `${BASE_URL}/client-care-circle/delete/${id}`,
        INVITATION: (id) => `${BASE_URL}/client-care-circle/invitation/${id}`,
    },
    CLIENT_CARE_TEAM: {
        GET_BY_CLIENT: (clientId) => `${BASE_URL}/client-care-team/getByClient/${clientId}`,
        UPDATE: (clientId) => `${BASE_URL}/client-care-team/update/${clientId}`,
        BULK_UPDATE: (clientId) => `${BASE_URL}/client-care-team/bulk-update/${clientId}`,
    },
    CLIENT_SETTINGS: {
        UPDATE: (id) => `${BASE_URL}/client-settings/update/${id}`,
        GET_BY_ID: (id) => `${BASE_URL}/client-settings/getByClient/${id}`,
        REGENERATE_QR_CODE: (id) => `/api/client-settings/regenerate-qrcode/${id}`,
    },
    CLIENT_SHARE_ACCESS: {
        GENERATE: () => `${BASE_URL}/client-share-access/generate`,
        GET_BY_ID: (id) => `${BASE_URL}/client-share-access/${id}`,
        SEND_MAGIC_LINK: () => `${BASE_URL}/client-share-access/send-magic-link`,
    },
    CLIENT_MEDICATION_SCHEDULING: {
        GET_ALL_BY_CLIENT_ID: (id, dateFilter) => `${BASE_URL}/client-medication-scheduling/get-all-by-client-id/${id}?dateFilter=${dateFilter}`,
        GET_ALL_BY_CLIENT_ID_WITHOUT_FILTER: (id) => `${BASE_URL}/client-medication-scheduling/get-all-by-client-id/${id}`,
        GET_BY_ID: (id) => `${BASE_URL}/client-medication-scheduling/get-by-id/${id}`,
        CREATE: (id) => `${BASE_URL}/client-medication-scheduling/create/${id}`,
        UPDATE: (id) => `${BASE_URL}/client-medication-scheduling/update/${id}`,
        DELETE: (id) => `${BASE_URL}/client-medication-scheduling/delete/${id}`,
        STOP_SCHEDULING: (id) => `${BASE_URL}/client-medication-scheduling/stop-scheduling/${id}`,
        UPDATE_PAST_ADMINISTRATION: () => `${BASE_URL}/client-medication-scheduling/update/past-administration`,
    },
    CLIENT_CARE_PLAN_FILES: {
        UPLOAD_DOCUMENT: () => `${BASE_URL}/client-care-plan/files/upload-document`,
        UPDATE: (id) => `${BASE_URL}/client-care-plan/files/update/${id}`,
        GET_ALL: (id) => `${BASE_URL}/client-care-plan/files/${id}`,
        DELETE: (id) => `${BASE_URL}/client-care-plan/files/delete-document/${id}`,
    },

    CLIENT_SIGNATURE_DOCUMENTS: {
        UPLOAD: () => `${BASE_URL}/client-care-plan/signature/upload`,
        GET_ALL_UPLOADED_DOCUMENTS: (clientId) => `${BASE_URL}/client-care-plan/signature/uploaded-documents/${clientId}`,
        GET_ALL_SIGNED_DOCUMENTS: (clientId) => `${BASE_URL}/client-care-plan/signature/signed-documents/${clientId}`,
        CREATE_PACK: () => `${BASE_URL}/client-care-plan/signature/document-pack/create`,
        GET_PACK_DETAILS: (clientId) => `${BASE_URL}/client-care-plan/signature/document-pack/${clientId}`,
        DELETE_PACK: (packId) => `${BASE_URL}/client-care-plan/signature/document-pack/delete/${packId}`,
        SAVE_SIGNED_DOCUMENT: () => `${BASE_URL}/client-care-plan/signature/save-signed-documents`,
    },
    CLIENT_CARE_PLAN: {
        PERSONAL_CARE_ASSESSMENT: {
            // Personal Care Assessment
            CREATE_PERSONAL_CARE_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/personal-care/assessment/${id}`,
            GET_PERSONAL_CARE_ASSESSMENT_BY_ID: (id) => `${BASE_URL}/client-care-plan/personal-care/assessment/${id}`,
            GET_PERSONAL_CARE_ASSESSMENT_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-plan/personal-care/${id}`,
            UPDATE_PERSONAL_CARE_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/personal-care/assessment/${id}`,
            DELETE_PERSONAL_CARE_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/personal-care/assessment/${id}`,

            // Personal Care Risks
            CREATE_PERSONAL_CARE_RISK: (id) => `${BASE_URL}/client-care-plan/personal-care/risk/${id}`,
            GET_PERSONAL_CARE_RISK_BY_ID: (id) => `${BASE_URL}/client-care-plan/personal-care/risk/${id}`,
            UPDATE_PERSONAL_CARE_RISK: (id) => `${BASE_URL}/client-care-plan/personal-care/risk/${id}`,
            DELETE_PERSONAL_CARE_RISK: (id) => `${BASE_URL}/client-care-plan/personal-care/risk/${id}`,
        },

        // Everyday Activities Assessment
        EVERYDAY_ACTIVITIES_ASSESSMENT: {
            CREATE_EVERYDAY_ACTIVITIES_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/every-day-activity/assessment/${id}`,
            GET_EVERYDAY_ACTIVITIES_ASSESSMENT_BY_ID: (id) => `${BASE_URL}/client-care-plan/every-day-activity/assessment/${id}`,
            GET_EVERYDAY_ACTIVITIES_ASSESSMENT_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-plan/every-day-activity/${id}`,
            UPDATE_EVERYDAY_ACTIVITIES_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/every-day-activity/assessment/${id}`,
            DELETE_EVERYDAY_ACTIVITIES_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/every-day-activity/assessment/${id}`,

            // Everyday Activities Risks
            CREATE_EVERYDAY_ACTIVITIES_RISK: (id) => `${BASE_URL}/client-care-plan/every-day-activity/risk/${id}`,
            GET_EVERYDAY_ACTIVITIES_RISK_BY_ID: (id) => `${BASE_URL}/client-care-plan/every-day-activity/risk/${id}`,
            UPDATE_EVERYDAY_ACTIVITIES_RISK: (id) => `${BASE_URL}/client-care-plan/every-day-activity/risk/${id}`,
            DELETE_EVERYDAY_ACTIVITIES_RISK: (id) => `${BASE_URL}/client-care-plan/every-day-activity/risk/${id}`,
        },
        SOCIAL_SUPPORT_ASSESSMENT: {
            // Social Support Assessment
            CREATE_SOCIAL_SUPPORT_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/social-support/assessment/${id}`,
            GET_SOCIAL_SUPPORT_ASSESSMENT_BY_ID: (id) => `${BASE_URL}/client-care-plan/social-support/assessment/${id}`,
            GET_SOCIAL_SUPPORT_ASSESSMENT_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-plan/social-support/${id}`,
            UPDATE_SOCIAL_SUPPORT_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/social-support/assessment/${id}`,
            DELETE_SOCIAL_SUPPORT_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/social-support/assessment/${id}`,

            // Social Support Risks
            CREATE_SOCIAL_SUPPORT_RISK: (id) => `${BASE_URL}/client-care-plan/social-support/risk/${id}`,
            GET_SOCIAL_SUPPORT_RISK_BY_ID: (id) => `${BASE_URL}/client-care-plan/social-support/risk/${id}`,
            UPDATE_SOCIAL_SUPPORT_RISK: (id) => `${BASE_URL}/client-care-plan/social-support/risk/${id}`,
            DELETE_SOCIAL_SUPPORT_RISK: (id) => `${BASE_URL}/client-care-plan/social-support/risk/${id}`,
        },

        ENVIRONMENTAL_ASSESSMENT: {
            // Environmental Assessment
            CREATE_ENVIRONMENTAL_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/environmental/assessment/${id}`,
            GET_ENVIRONMENTAL_ASSESSMENT_BY_ID: (id) => `${BASE_URL}/client-care-plan/environmental/assessment/${id}`,
            GET_ENVIRONMENTAL_ASSESSMENT_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-plan/environmental/${id}`,
            UPDATE_ENVIRONMENTAL_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/environmental/assessment/${id}`,
            DELETE_ENVIRONMENTAL_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/environmental/assessment/${id}`,

            // Environmental Risks
            CREATE_ENVIRONMENTAL_RISK: (id) => `${BASE_URL}/client-care-plan/environmental/risk/${id}`,
            GET_ENVIRONMENTAL_RISK_BY_ID: (id) => `${BASE_URL}/client-care-plan/environmental/risk/${id}`,
            UPDATE_ENVIRONMENTAL_RISK: (id) => `${BASE_URL}/client-care-plan/environmental/risk/${id}`,
            DELETE_ENVIRONMENTAL_RISK: (id) => `${BASE_URL}/client-care-plan/environmental/risk/${id}`,
        },

        NUTRITION_HYDRATION_ASSESSMENT: {
            // Nutrition and Hydration Assessment
            CREATE_NUTRITION_HYDRATION_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/nutrition-hydration/assessment/${id}`,
            GET_NUTRITION_HYDRATION_ASSESSMENT_BY_ID: (id) => `${BASE_URL}/client-care-plan/nutrition-hydration/assessment/${id}`,
            GET_NUTRITION_HYDRATION_ASSESSMENT_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-plan/nutrition-hydration/${id}`,
            UPDATE_NUTRITION_HYDRATION_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/nutrition-hydration/assessment/${id}`,
            DELETE_NUTRITION_HYDRATION_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/nutrition-hydration/assessment/${id}`,

            // Nutrition and Hydration Risks
            CREATE_NUTRITION_HYDRATION_RISK: (id) => `${BASE_URL}/client-care-plan/nutrition-hydration/risk/${id}`,
            GET_NUTRITION_HYDRATION_RISK_BY_ID: (id) => `${BASE_URL}/client-care-plan/nutrition-hydration/risk/${id}`,
            UPDATE_NUTRITION_HYDRATION_RISK: (id) => `${BASE_URL}/client-care-plan/nutrition-hydration/risk/${id}`,
            DELETE_NUTRITION_HYDRATION_RISK: (id) => `${BASE_URL}/client-care-plan/nutrition-hydration/risk/${id}`,
        },

        MEDICAL_ASSESSMENT: {
            // Medical Assessment
            CREATE_MEDICAL_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/medical/assessment/${id}`,
            GET_MEDICAL_ASSESSMENT_BY_ID: (id) => `${BASE_URL}/client-care-plan/medical/assessment/${id}`,
            GET_MEDICAL_ASSESSMENT_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-plan/medical/${id}`,
            UPDATE_MEDICAL_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/medical/assessment/${id}`,
            DELETE_MEDICAL_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/medical/assessment/${id}`,

            // Medical Risks
            CREATE_MEDICAL_RISK: (id) => `${BASE_URL}/client-care-plan/medical/risk/${id}`,
            GET_MEDICAL_RISK_BY_ID: (id) => `${BASE_URL}/client-care-plan/medical/risk/${id}`,
            UPDATE_MEDICAL_RISK: (id) => `${BASE_URL}/client-care-plan/medical/risk/${id}`,
            DELETE_MEDICAL_RISK: (id) => `${BASE_URL}/client-care-plan/medical/risk/${id}`,
        },

        ADMINISTRATION_ASSESSMENT: {
            // Administration Assessment
            CREATE_ADMINISTRATION_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/administrative/assessment/${id}`,
            GET_ADMINISTRATION_ASSESSMENT_BY_ID: (id) => `${BASE_URL}/client-care-plan/administrative/assessment/${id}`,
            GET_ADMINISTRATION_ASSESSMENT_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-plan/administrative/${id}`,
            UPDATE_ADMINISTRATION_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/administrative/assessment/${id}`,
            DELETE_ADMINISTRATION_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/administrative/assessment/${id}`,

            // Administration Risks
            CREATE_ADMINISTRATION_RISK: (id) => `${BASE_URL}/client-care-plan/administrative/risk/${id}`,
            GET_ADMINISTRATION_RISK_BY_ID: (id) => `${BASE_URL}/client-care-plan/administrative/risk/${id}`,
            UPDATE_ADMINISTRATION_RISK: (id) => `${BASE_URL}/client-care-plan/administrative/risk/${id}`,
            DELETE_ADMINISTRATION_RISK: (id) => `${BASE_URL}/client-care-plan/administrative/risk/${id}`,
        },

        // Psychological Assessment
        PSYCHOLOGICAL_ASSESSMENT: {
            CREATE_PSYCHOLOGICAL_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/psychological/assessment/${id}`,
            GET_PSYCHOLOGICAL_ASSESSMENT_BY_ID: (id) => `${BASE_URL}/client-care-plan/psychological/assessment/${id}`,
            GET_PSYCHOLOGICAL_ASSESSMENT_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-plan/psychological/${id}`,
            UPDATE_PSYCHOLOGICAL_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/psychological/assessment/${id}`,
            DELETE_PSYCHOLOGICAL_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/psychological/assessment/${id}`,

            // Psychological Risks
            CREATE_PSYCHOLOGICAL_RISK: (id) => `${BASE_URL}/client-care-plan/psychological/risk/${id}`,
            GET_PSYCHOLOGICAL_RISK_BY_ID: (id) => `${BASE_URL}/client-care-plan/psychological/risk/${id}`,
            UPDATE_PSYCHOLOGICAL_RISK: (id) => `${BASE_URL}/client-care-plan/psychological/risk/${id}`,
            DELETE_PSYCHOLOGICAL_RISK: (id) => `${BASE_URL}/client-care-plan/psychological/risk/${id}`,
        },

        ADDITIONAL_ASSESSMENT: {
            BEHAVIOURAL_ASSESSMENT: {
                CREATE_BEHAVIOURAL_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/behaviour/assessment/${id}`,
                GET_BEHAVIOURAL_ASSESSMENT_BY_ID: (id) => `${BASE_URL}/client-care-plan/behaviour/assessment/${id}`,
                GET_BEHAVIOURAL_ASSESSMENT_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-plan/behaviour/${id}`,
                UPDATE_BEHAVIOURAL_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/behaviour/assessment/${id}`,
                DELETE_BEHAVIOURAL_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/behaviour/assessment/${id}`,

                CREATE_BEHAVIOURAL_RISK: (id) => `${BASE_URL}/client-care-plan/behaviour/risk/${id}`,
                GET_BEHAVIOURAL_RISK_BY_ID: (id) => `${BASE_URL}/client-care-plan/behaviour/risk/${id}`,
                UPDATE_BEHAVIOURAL_RISK: (id) => `${BASE_URL}/client-care-plan/behaviour/risk/${id}`,
                DELETE_BEHAVIOURAL_RISK: (id) => `${BASE_URL}/client-care-plan/behaviour/risk/${id}`,
            },

            COMMUNICATION_ASSESSMENT: {
                CREATE_COMMUNICATION_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/communication/assessment/${id}`,
                GET_COMMUNICATION_ASSESSMENT_BY_ID: (id) => `${BASE_URL}/client-care-plan/communication/assessment/${id}`,
                GET_COMMUNICATION_ASSESSMENT_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-plan/communication/${id}`,
                UPDATE_COMMUNICATION_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/communication/assessment/${id}`,
                DELETE_COMMUNICATION_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/communication/assessment/${id}`,

                CREATE_COMMUNICATION_RISK: (id) => `${BASE_URL}/client-care-plan/communication/risk/${id}`,
                GET_COMMUNICATION_RISK_BY_ID: (id) => `${BASE_URL}/client-care-plan/communication/risk/${id}`,
                UPDATE_COMMUNICATION_RISK: (id) => `${BASE_URL}/client-care-plan/communication/risk/${id}`,
                DELETE_COMMUNICATION_RISK: (id) => `${BASE_URL}/client-care-plan/communication/risk/${id}`,
            },

            CONDITION_SPECIFIC_ASSESSMENT: {
                CREATE_CONDITION_SPECIFIC_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/condition-specific/assessment/${id}`,
                GET_CONDITION_SPECIFIC_ASSESSMENT_BY_ID: (id) => `${BASE_URL}/client-care-plan/condition-specific/assessment/${id}`,
                GET_CONDITION_SPECIFIC_ASSESSMENT_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-plan/condition-specific/${id}`,
                UPDATE_CONDITION_SPECIFIC_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/condition-specific/assessment/${id}`,
                DELETE_CONDITION_SPECIFIC_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/condition-specific/assessment/${id}`,

                CREATE_CONDITION_SPECIFIC_RISK: (id) => `${BASE_URL}/client-care-plan/condition-specific/risk/${id}`,
                GET_CONDITION_SPECIFIC_RISK_BY_ID: (id) => `${BASE_URL}/client-care-plan/condition-specific/risk/${id}`,
                UPDATE_CONDITION_SPECIFIC_RISK: (id) => `${BASE_URL}/client-care-plan/condition-specific/risk/${id}`,
                DELETE_CONDITION_SPECIFIC_RISK: (id) => `${BASE_URL}/client-care-plan/condition-specific/risk/${id}`,
            },

            COVID_19_ASSESSMENT: {
                CREATE_COVID_19_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/covid/assessment/${id}`,
                GET_COVID_19_ASSESSMENT_BY_ID: (id) => `${BASE_URL}/client-care-plan/covid/assessment/${id}`,
                GET_COVID_19_ASSESSMENT_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-plan/covid/${id}`,
                UPDATE_COVID_19_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/covid/assessment/${id}`,
                DELETE_COVID_19_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/covid/assessment/${id}`,

                CREATE_COVID_19_RISK: (id) => `${BASE_URL}/client-care-plan/covid/risk/${id}`,
                GET_COVID_19_RISK_BY_ID: (id) => `${BASE_URL}/client-care-plan/covid/risk/${id}`,
                UPDATE_COVID_19_RISK: (id) => `${BASE_URL}/client-care-plan/covid/risk/${id}`,
                DELETE_COVID_19_RISK: (id) => `${BASE_URL}/client-care-plan/covid/risk/${id}`,
            },

            CONTROL_SUBSTANCES_ASSESSMENT: {
                CREATE_CONTROL_SUBSTANCES_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/control-substances/assessment/${id}`,
                GET_CONTROL_SUBSTANCES_ASSESSMENT_BY_ID: (id) => `${BASE_URL}/client-care-plan/control-substances/assessment/${id}`,
                GET_CONTROL_SUBSTANCES_ASSESSMENT_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-plan/control-substances/${id}`,
                UPDATE_CONTROL_SUBSTANCES_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/control-substances/assessment/${id}`,
                DELETE_CONTROL_SUBSTANCES_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/control-substances/assessment/${id}`,

                CREATE_CONTROL_SUBSTANCES_RISK: (id) => `${BASE_URL}/client-care-plan/control-substances/risk/${id}`,
                GET_CONTROL_SUBSTANCES_RISK_BY_ID: (id) => `${BASE_URL}/client-care-plan/control-substances/risk/${id}`,
                UPDATE_CONTROL_SUBSTANCES_RISK: (id) => `${BASE_URL}/client-care-plan/control-substances/risk/${id}`,
                DELETE_CONTROL_SUBSTANCES_RISK: (id) => `${BASE_URL}/client-care-plan/control-substances/risk/${id}`,
            },

            DYSPHAGIA_ASSESSMENT: {
                CREATE_DYSPHAGIA_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/dysphagia/assessment/${id}`,
                GET_DYSPHAGIA_ASSESSMENT_BY_ID: (id) => `${BASE_URL}/client-care-plan/dysphagia/assessment/${id}`,
                GET_DYSPHAGIA_ASSESSMENT_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-plan/dysphagia/${id}`,
                UPDATE_DYSPHAGIA_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/dysphagia/assessment/${id}`,
                DELETE_DYSPHAGIA_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/dysphagia/assessment/${id}`,

                CREATE_DYSPHAGIA_RISK: (id) => `${BASE_URL}/client-care-plan/dysphagia/risk/${id}`,
                GET_DYSPHAGIA_RISK_BY_ID: (id) => `${BASE_URL}/client-care-plan/dysphagia/risk/${id}`,
                UPDATE_DYSPHAGIA_RISK: (id) => `${BASE_URL}/client-care-plan/dysphagia/risk/${id}`,
                DELETE_DYSPHAGIA_RISK: (id) => `${BASE_URL}/client-care-plan/dysphagia/risk/${id}`,
            },

            END_OF_LIFE_ASSESSMENT: {
                CREATE_END_OF_LIFE_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/end-of-life/assessment/${id}`,
                GET_END_OF_LIFE_ASSESSMENT_BY_ID: (id) => `${BASE_URL}/client-care-plan/end-of-life/assessment/${id}`,
                GET_END_OF_LIFE_ASSESSMENT_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-plan/end-of-life/${id}`,
                UPDATE_END_OF_LIFE_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/end-of-life/assessment/${id}`,
                DELETE_END_OF_LIFE_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/end-of-life/assessment/${id}`,

                CREATE_END_OF_LIFE_RISK: (id) => `${BASE_URL}/client-care-plan/end-of-life/risk/${id}`,
                GET_END_OF_LIFE_RISK_BY_ID: (id) => `${BASE_URL}/client-care-plan/end-of-life/risk/${id}`,
                UPDATE_END_OF_LIFE_RISK: (id) => `${BASE_URL}/client-care-plan/end-of-life/risk/${id}`,
                DELETE_END_OF_LIFE_RISK: (id) => `${BASE_URL}/client-care-plan/end-of-life/risk/${id}`,
            },

            ENVIRONMENTAL_AND_FIRE_ASSESSMENT: {
                CREATE_ENVIRONMENTAL_AND_FIRE_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/environment-fire/assessment/${id}`,
                GET_ENVIRONMENTAL_AND_FIRE_ASSESSMENT_BY_ID: (id) => `${BASE_URL}/client-care-plan/environment-fire/assessment/${id}`,
                GET_ENVIRONMENTAL_AND_FIRE_ASSESSMENT_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-plan/environment-fire/${id}`,
                UPDATE_ENVIRONMENTAL_AND_FIRE_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/environment-fire/assessment/${id}`,
                DELETE_ENVIRONMENTAL_AND_FIRE_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/environment-fire/assessment/${id}`,

                CREATE_ENVIRONMENTAL_AND_FIRE_RISK: (id) => `${BASE_URL}/client-care-plan/environment-fire/risk/${id}`,
                GET_ENVIRONMENTAL_AND_FIRE_RISK_BY_ID: (id) => `${BASE_URL}/client-care-plan/environment-fire/risk/${id}`,
                UPDATE_ENVIRONMENTAL_AND_FIRE_RISK: (id) => `${BASE_URL}/client-care-plan/environment-fire/risk/${id}`,
                DELETE_ENVIRONMENTAL_AND_FIRE_RISK: (id) => `${BASE_URL}/client-care-plan/environment-fire/risk/${id}`,
            },

            FINANCIAL_ASSESSMENT: {
                CREATE_FINANCIAL_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/financial/assessment/${id}`,
                GET_FINANCIAL_ASSESSMENT_BY_ID: (id) => `${BASE_URL}/client-care-plan/financial/assessment/${id}`,
                GET_FINANCIAL_ASSESSMENT_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-plan/financial/${id}`,
                UPDATE_FINANCIAL_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/financial/assessment/${id}`,
                DELETE_FINANCIAL_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/financial/assessment/${id}`,

                CREATE_FINANCIAL_RISK: (id) => `${BASE_URL}/client-care-plan/financial/risk/${id}`,
                GET_FINANCIAL_RISK_BY_ID: (id) => `${BASE_URL}/client-care-plan/financial/risk/${id}`,
                UPDATE_FINANCIAL_RISK: (id) => `${BASE_URL}/client-care-plan/financial/risk/${id}`,
                DELETE_FINANCIAL_RISK: (id) => `${BASE_URL}/client-care-plan/financial/risk/${id}`,
            },

            MEDICATION_ASSESSMENT: {
                CREATE_MEDICATION_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/medication/assessment/${id}`,
                GET_MEDICATION_ASSESSMENT_BY_ID: (id) => `${BASE_URL}/client-care-plan/medication/assessment/${id}`,
                GET_MEDICATION_ASSESSMENT_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-plan/medication/${id}`,
                UPDATE_MEDICATION_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/medication/assessment/${id}`,
                DELETE_MEDICATION_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/medication/assessment/${id}`,

                CREATE_MEDICATION_RISK: (id) => `${BASE_URL}/client-care-plan/medication/risk/${id}`,
                GET_MEDICATION_RISK_BY_ID: (id) => `${BASE_URL}/client-care-plan/medication/risk/${id}`,
                UPDATE_MEDICATION_RISK: (id) => `${BASE_URL}/client-care-plan/medication/risk/${id}`,
                DELETE_MEDICATION_RISK: (id) => `${BASE_URL}/client-care-plan/medication/risk/${id}`,
            },

            MENTAL_CAPACITY_ASSESSMENT: {
                CREATE_MENTAL_CAPACITY_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/mental-capacity/assessment/${id}`,
                GET_MENTAL_CAPACITY_ASSESSMENT_BY_ID: (id) => `${BASE_URL}/client-care-plan/mental-capacity/assessment/${id}`,
                GET_MENTAL_CAPACITY_ASSESSMENT_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-plan/mental-capacity/${id}`,
                UPDATE_MENTAL_CAPACITY_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/mental-capacity/assessment/${id}`,
                DELETE_MENTAL_CAPACITY_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/mental-capacity/assessment/${id}`,

                CREATE_MENTAL_CAPACITY_RISK: (id) => `${BASE_URL}/client-care-plan/mental-capacity/risk/${id}`,
                GET_MENTAL_CAPACITY_RISK_BY_ID: (id) => `${BASE_URL}/client-care-plan/mental-capacity/risk/${id}`,
                UPDATE_MENTAL_CAPACITY_RISK: (id) => `${BASE_URL}/client-care-plan/mental-capacity/risk/${id}`,
                DELETE_MENTAL_CAPACITY_RISK: (id) => `${BASE_URL}/client-care-plan/mental-capacity/risk/${id}`,
            },

            MOVING_HANDLING_ASSESSMENT: {
                CREATE_MOVING_HANDLING_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/moving-handling/assessment/${id}`,
                GET_MOVING_HANDLING_ASSESSMENT_BY_ID: (id) => `${BASE_URL}/client-care-plan/moving-handling/assessment/${id}`,
                GET_MOVING_HANDLING_ASSESSMENT_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-plan/moving-handling/${id}`,
                UPDATE_MOVING_HANDLING_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/moving-handling/assessment/${id}`,
                DELETE_MOVING_HANDLING_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/moving-handling/assessment/${id}`,

                CREATE_MOVING_HANDLING_RISK: (id) => `${BASE_URL}/client-care-plan/moving-handling/risk/${id}`,
                GET_MOVING_HANDLING_RISK_BY_ID: (id) => `${BASE_URL}/client-care-plan/moving-handling/risk/${id}`,
                UPDATE_MOVING_HANDLING_RISK: (id) => `${BASE_URL}/client-care-plan/moving-handling/risk/${id}`,
                DELETE_MOVING_HANDLING_RISK: (id) => `${BASE_URL}/client-care-plan/moving-handling/risk/${id}`,
            },

            RESTRICTIVE_PRACTICE_ASSESSMENT: {
                CREATE_RESTRICTIVE_PRACTICE_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/restrictive-practice/assessment/${id}`,
                GET_RESTRICTIVE_PRACTICE_ASSESSMENT_BY_ID: (id) => `${BASE_URL}/client-care-plan/restrictive-practice/assessment/${id}`,
                GET_RESTRICTIVE_PRACTICE_ASSESSMENT_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-plan/restrictive-practice/${id}`,
                UPDATE_RESTRICTIVE_PRACTICE_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/restrictive-practice/assessment/${id}`,
                DELETE_RESTRICTIVE_PRACTICE_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/restrictive-practice/assessment/${id}`,

                CREATE_RESTRICTIVE_PRACTICE_RISK: (id) => `${BASE_URL}/client-care-plan/restrictive-practice/risk/${id}`,
                GET_RESTRICTIVE_PRACTICE_RISK_BY_ID: (id) => `${BASE_URL}/client-care-plan/restrictive-practice/risk/${id}`,
                UPDATE_RESTRICTIVE_PRACTICE_RISK: (id) => `${BASE_URL}/client-care-plan/restrictive-practice/risk/${id}`,
                DELETE_RESTRICTIVE_PRACTICE_RISK: (id) => `${BASE_URL}/client-care-plan/restrictive-practice/risk/${id}`,
            },

            SEIZURES_ASSESSMENT: {
                CREATE_SEIZURES_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/seizures/assessment/${id}`,
                GET_SEIZURES_ASSESSMENT_BY_ID: (id) => `${BASE_URL}/client-care-plan/seizures/assessment/${id}`,
                GET_SEIZURES_ASSESSMENT_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-plan/seizures/${id}`,
                UPDATE_SEIZURES_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/seizures/assessment/${id}`,
                DELETE_SEIZURES_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/seizures/assessment/${id}`,

                CREATE_SEIZURES_RISK: (id) => `${BASE_URL}/client-care-plan/seizures/risk/${id}`,
                GET_SEIZURES_RISK_BY_ID: (id) => `${BASE_URL}/client-care-plan/seizures/risk/${id}`,
                UPDATE_SEIZURES_RISK: (id) => `${BASE_URL}/client-care-plan/seizures/risk/${id}`,
                DELETE_SEIZURES_RISK: (id) => `${BASE_URL}/client-care-plan/seizures/risk/${id}`,
            },

            WATERLOW_ASSESSMENT: {
                CREATE_WATERLOW_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/waterlow/assessment/${id}`,
                GET_WATERLOW_ASSESSMENT_BY_ID: (id) => `${BASE_URL}/client-care-plan/waterlow/assessment/${id}`,
                GET_WATERLOW_ASSESSMENT_BY_CLIENT_ID: (id) => `${BASE_URL}/client-care-plan/waterlow/${id}`,
                UPDATE_WATERLOW_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/waterlow/assessment/${id}`,
                DELETE_WATERLOW_ASSESSMENT: (id) => `${BASE_URL}/client-care-plan/waterlow/assessment/${id}`,

                CREATE_WATERLOW_RISK: (id) => `${BASE_URL}/client-care-plan/waterlow/risk/${id}`,
                GET_WATERLOW_RISK_BY_ID: (id) => `${BASE_URL}/client-care-plan/waterlow/risk/${id}`,
                UPDATE_WATERLOW_RISK: (id) => `${BASE_URL}/client-care-plan/waterlow/risk/${id}`,
                DELETE_WATERLOW_RISK: (id) => `${BASE_URL}/client-care-plan/waterlow/risk/${id}`,
            },
        },
    },
};

export default APIConfig;
