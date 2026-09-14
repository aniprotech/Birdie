import * as Yup from "yup";

export const clientsCarePlanValidationSchema = Yup.object().shape({
    details: Yup.string(),
    isEssential: Yup.boolean(),
    timeType: Yup.string().oneOf(["anytime", "sessions"]).required("Time type is required"),
    schedule: Yup.object().shape({
        frequency: Yup.string().required("Frequency is required"),
        repeatEvery: Yup.number().min(1).required("Repeat interval is required"),
        repeatUnit: Yup.string().required("Repeat unit is required"),
        selectedDays: Yup.array().of(Yup.string()),
        selectedSessions: Yup.array().when("timeType", {
            is: "sessions",
            then: Yup.array().min(1, "Please select at least one session"),
        }),
    }),
    startDate: Yup.date().required("Start date is required"),
    endDate: Yup.date().nullable(),
});

export const signatureValidationSchema = Yup.object().shape({
    signatories: Yup.array().of(
        Yup.object().shape({
            name: Yup.string().required("Name is required"),
            role: Yup.string().required("Role is required"),
            // note: Yup.string().when("role", {
            //     is: "Other",
            //     then: Yup.string().required("Please state your other role"),
            //     otherwise: Yup.string().nullable()
            // }),
            agreed: Yup.boolean().oneOf([true], "You must agree to the terms")
        })
    )
});