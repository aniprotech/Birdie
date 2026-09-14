import * as Yup from "yup";

export const operationTravelInfoValidationSchema = Yup.object({
    address: Yup.string().required("This is a required field"),
    transportMethod: Yup.string().required("This is a required field"),
});

export const operationRateInfoValidationSchema = Yup.object({
    rateCard: Yup.string().required("This is a required field"),
    travelRateCard: Yup.string().required("This is a required field"),
});

export const onBoardingValidationSchema = Yup.object().shape({
    started: Yup.date().required("This is a required field"),

    additionalDocumentDescription: Yup.string(),
    additionalDocumentFiles: Yup.mixed().when("additionalDocumentDescription", {
        is: (desc) => desc && desc.trim() !== "",
        then: () => Yup.mixed().required("File is required"),
        otherwise: () => Yup.mixed().notRequired(),
    }),
});

export const skillValidationSchema = Yup.object().shape({
    name: Yup.string().required("This is a required field"),
    skillsFile: Yup.string().required("Document is required"),
    // endsOn : Yup.date().required("Date is required"),
});

export const bookingAbsenceValidationSchema = Yup.object({
    startDate: Yup.date().required("This is a required field"),
    startTime: Yup.string().required("This is a required field"),
    endDate: Yup.date().required("This is a required field"),
    endTime: Yup.string().required("This is a required field"),
    type: Yup.string().required("This is a required field"),
    reason: Yup.string().required("This is a required field"),
});

export const availabilityValidationSchema = Yup.object().shape({
    schedule: Yup.object().shape({
        frequency: Yup.string().required(),
        selectedDays: Yup.array().when("frequency", {
            is: (val) => val === "WEEKLY" || val === "CUSTOM",
            then: (schema) =>
                schema
                    .min(1, "Please select at least one day")
                    .of(Yup.string().oneOf(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]))
                    .required("Selected days are required"),
            otherwise: (schema) => schema.notRequired(),
        }),
    }),
});
