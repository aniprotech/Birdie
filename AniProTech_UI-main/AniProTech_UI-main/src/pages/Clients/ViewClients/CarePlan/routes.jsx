import { Route } from "react-router-dom";
import CarePlanIndex from "./CarePlanIndex";

// Initial Assessments
import SocialSupportAssessment from "./InitialAssessments/SocialSupportAssessment";
import EnvironmentalAssessment from "./InitialAssessments/EnvironmentalAssessment";
import NutritionAssessment from "./InitialAssessments/NutritionAssessment";
import MedicalAssessment from "./InitialAssessments/MedicalAssessment";
import AdminAssessment from "./InitialAssessments/AdminAssessment";
import PsychologicalAssessment from "./InitialAssessments/PsychologicalAssessment";
import PersonalCareAssessment from "./InitialAssessments/PersonalCareAssessment";
import EveryDayAssessment from "./InitialAssessments/EveryDayAssessment";

// Additional Assessments
import BehaviorAssessment from "./AdditionalAssessments/BehaviorAssessment";
import CommunicationAssessment from "./AdditionalAssessments/CommunicationAssessment";
import ConditionSpecificAssessment from "./AdditionalAssessments/ConditionSpecificAssessment";
import CovidAssessment from "./AdditionalAssessments/CovidAssessment";
import ControlSubstancesAssessment from "./AdditionalAssessments/ControlSubstancesAssessment";
import DrainageAssessment from "./AdditionalAssessments/DrainageAssessment";
import EndOfLifeAssessment from "./AdditionalAssessments/EndOfLifeAssessment";
import EnvironmentFireAssessment from "./AdditionalAssessments/EnvironmentFireAssessment";
import FinancialAssessment from "./AdditionalAssessments/FinancialAssessment";
import MedicationAssessment from "./AdditionalAssessments/MedicationAssessment";
import MentalCapacityAssessment from "./AdditionalAssessments/MentalCapacityAssessment";
import MovingHandlingAssessment from "./AdditionalAssessments/MovingHandlingAssessment";
import RestrictivePracticeAssessment from "./AdditionalAssessments/RestrictivePracticeAssessment";
import SeizuresAssessment from "./AdditionalAssessments/SeizuresAssessment";
import WaterlowAssessment from "./AdditionalAssessments/WaterlowAssessment";
import ClientFeedback from "./AuditingDocuments/ClientFeedback";
import CounterSign from "./AuditingDocuments/CounterSign";
import ServiceReview from "./AuditingDocuments/ServiceReview";
import SignatureDocument from "./Documents/SignatureDocument";
import UploadDocuments from "./Documents/UploadDocuments";
import DownloadDocument from "./Documents/DownloadDocument";

// // Auditing Documents
// import ClientFeedback from './AuditingDocuments/ClientFeedback';
// import CounterSign from './AuditingDocuments/CounterSign';
// import ServiceReview from './AuditingDocuments/ServiceReview';

// // Documents
// import Documents from './Documents/Documents';
// import DownloadDocuments from './Documents/DownloadDocuments';
// import SignatureDocuments from './Documents/SignatureDocuments';

const CarePlanRoutes = [
    {
        index: true,
        element: <CarePlanIndex />,
    },
    // Initial Assessments
    {
        path: "personal-care",
        element: <PersonalCareAssessment />,
    },
    {
        path: "everyday-activities",
        element: <EveryDayAssessment />,
    },
    {
        path: "social-support",
        element: <SocialSupportAssessment />,
    },
    {
        path: "environmental",
        element: <EnvironmentalAssessment />,
    },
    {
        path: "nutrition-hydration",
        element: <NutritionAssessment />,
    },
    {
        path: "medical",
        element: <MedicalAssessment />,
    },
    {
        path: "administration",
        element: <AdminAssessment />,
    },
    {
        path: "psychological",
        element: <PsychologicalAssessment />,
    },

    // Additional Assessments
    {
        path: "behaviour",
        element: <BehaviorAssessment />,
    },
    {
        path: "communication",
        element: <CommunicationAssessment />,
    },
    {
        path: "condition-specific",
        element: <ConditionSpecificAssessment />,
    },
    {
        path: "covid",
        element: <CovidAssessment />,
    },
    {
        path: "control-substances",
        element: <ControlSubstancesAssessment />,
    },
    {
        path: "dysphagia",
        element: <DrainageAssessment />,
    },
    {
        path: "end-of-life",
        element: <EndOfLifeAssessment />,
    },
    {
        path: "environment-fire",
        element: <EnvironmentFireAssessment />,
    },
    {
        path: "financial",
        element: <FinancialAssessment />,
    },
    {
        path: "medication",
        element: <MedicationAssessment />,
    },
    {
        path: "mental-capacity",
        element: <MentalCapacityAssessment />,
    },
    {
        path: "moving-handling",
        element: <MovingHandlingAssessment />,
    },
    {
        path: "restrictive-practice",
        element: <RestrictivePracticeAssessment />,
    },
    {
        path: "seizures",
        element: <SeizuresAssessment />,
    },
    {
        path: "waterlow",
        element: <WaterlowAssessment />,
    },

    // Auditing Documents
    {
        path: "client-feedback",
        element: <ClientFeedback />,
    },
    {
        path: "courtesy-call",
        element: <CounterSign />,
    },
    {
        path: "service-review",
        element: <ServiceReview />,
    },

    // Documents
    {
        path: "upload-documents",
        element: <UploadDocuments />,
    },
    {
        path: "signature-document",
        element: <SignatureDocument />,
    },

    {
        path: "download-document",
        element: <DownloadDocument />,
    },
].map((route) => (
    <Route
        key={route.path || "index"}
        {...route}
    />
));

export default CarePlanRoutes;
