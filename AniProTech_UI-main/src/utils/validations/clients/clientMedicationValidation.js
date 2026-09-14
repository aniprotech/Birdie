import * as Yup from "yup";

export const AddMedicationSchema = Yup.object().shape({
    medicationId: Yup.string(),
    medicationName: Yup.string(),
    support: Yup.string().required("Support is required"),
    type: Yup.string().when("support", {
      is: (val) => !!val,
      then: Yup.string().required("Type is required"),
    }),
    dose: Yup.string().when("type", {
      is: (val) => !!val,
      then: Yup.string().required("Dose is required"),
    }),
    routeType: Yup.string().when("dose", {
      is: (val) => !!val,
      then: Yup.string().required("Route type is required"),
    }),
    route: Yup.string().when(["routeType"], {
      is: (routeType) => routeType === "OTHERS",
      then: Yup.string().required("Route is required"),
    }),
    frequencyType: Yup.string().when(["routeType", "route"], {
      is: (routeType, route) => routeType === "CUTANEOUS" || (routeType === "OTHERS" && route),
      then: Yup.string().required("Frequency type is required"),
    }),
    dailyTimes: Yup.number().when("frequencyType", {
      is: "DAILY",
      then: Yup.number().required("Daily times is required").min(1).max(4),
    }),
    customRepeat: Yup.number().when("frequencyType", {
      is: "CUSTOM",
      then: Yup.number().required("Custom repeat is required").min(1),
    }),
    customUnit: Yup.string().when("frequencyType", {
      is: "CUSTOM",
      then: Yup.string().required("Custom unit is required"),
    }),
    timingPreference: Yup.string().when(["frequencyType", "dailyTimes"], {
      is: (frequencyType, dailyTimes) => frequencyType === "DAILY" && dailyTimes > 0,
      then: Yup.string().required("Timing preference is required"),
    }),
    selectedTimeSlots: Yup.array().when("timingPreference", {
      is: "TIME_PERIOD",
      then: Yup.array().min(1, "At least one time slot is required"),
    }),
    exactTimes: Yup.object().when("timingPreference", {
      is: "EXACT_TIME",
      then: Yup.object().test("has-times", "At least one time is required", (value) => {
        return Object.values(value || {}).some(time => time);
      }),
    }),
    firstDoseDate: Yup.string().when("timingPreference", {
      is: (val) => !!val,
      then: Yup.string().required("First dose date is required"),
    }),
    firstDoseTime: Yup.string().when("firstDoseDate", {
      is: (val) => !!val,
      then: Yup.string().required("First dose time is required"),
    }),
    lastDoseDate: Yup.string(),
    lastDoseTime: Yup.string(),
    additionalInstructions: Yup.string(),
    bodyMapData: Yup.mixed(),
  });