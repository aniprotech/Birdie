import React from "react";
import { useFormikContext } from "formik";
import TextAreaField from "../../../components/TextInput/TextAreaField";

const ClientHighlights = ({ id }) => {
  const { values, handleChange } = useFormikContext();

  return (
    <div
      id={id}
      className="scroll-mt-20 bg-white rounded-md p-6 shadow "
    >
      <p className="text-lg font-semibold text-customTextGrey1 md:text-xl">Highlights</p>

      <TextAreaField
        name="highlights"
        placeHolder="Enter key highlights here..."
        value={values?.highlights || ""}
        valueChange={handleChange}
        rows={5}
      />
    </div>
  );
};

export default ClientHighlights;
