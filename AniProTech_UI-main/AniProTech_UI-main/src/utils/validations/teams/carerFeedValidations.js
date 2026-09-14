import * as Yup from "yup";


export const carerFeedNotesConcernValidationSchema = Yup.object({
    client: Yup.string().required("This is a required field"),
    carer: Yup.string().required("This is a required field"),
    category: Yup.string().required("This is a required field"),
    severity: Yup.string().required("This is a required field"),
    privacy: Yup.string().required("This is a required field"),
    event_description: Yup.string().required("This is a required field"),
    actions_taken: Yup.string().required("This is a required field"),
  });
  