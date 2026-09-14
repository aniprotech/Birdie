import * as Yup from "yup";

export const clientsMedicationValidationSchema = Yup.object({
    allergies: Yup.string().required('Please enter allergies or write "None known."'),
    gpName: Yup.string().required("GP name is required"),
    gpContact: Yup.string().required("Contact number is required"),
    pharmacyName: Yup.string().required("Pharmacy name is required"),
    pharmacyAddress: Yup.string().required("Pharmacy address is required"),
    pharmacyPostcode: Yup.string().required("Post code is required"),
    medicineSupport: Yup.string().required("Please select a medicine support option"),
});
