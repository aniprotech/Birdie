import React, { useState } from "react";
import { useFormikContext } from "formik";
import PhoneNumberField from "../../../components/DropdownInput/PhoneNumberDropdown";
import DropdownField from "../../../components/DropdownInput/Dropdown";
import TextField from "../../../components/TextInput/TextInput";
import { clientsContactPhoneTypes } from "../../../constants";

const ClientContact = ({ id }) => {
  const {
    values,
    errors,
    touched,
    submitCount,
    setFieldValue,
    setFieldTouched,
    setFieldError,
  } = useFormikContext();

  const [customErrors, setCustomErrors] = useState({
    email: "",
    primaryPhone: "",
    primaryPhoneType: "",
    secondaryPhone: "",
    secondaryPhoneType: "",
  });

  const updateError = (field, message = "") => {
    setCustomErrors((prev) => ({ ...prev, [field]: message }));
    setFieldError(field, message || undefined);
  };


  const validatePhoneField = (phone, type, prefix) => {
    const phoneKey = `${prefix}Phone`;
    const typeKey = `${prefix}PhoneType`;

    if (phone && !/^\d{10}$/.test(phone)) {
      updateError(phoneKey, "Phone number must be 10 digits");
    } else {
      updateError(phoneKey);
    }

    if (phone && !type) {
      const errorMessage = `${prefix === "primary" ? "Primary" : "Secondary"} phone type is required`;
      updateError(typeKey, errorMessage);
    } else {
      updateError(typeKey);
    }
  };

  const handlePhoneChange = (e, prefix) => {
    const phone = e?.target?.value;
    const key = `${prefix}Phone`;
    setFieldValue(key, phone);
    setFieldTouched(key, true);
    validatePhoneField(phone, values[`${prefix}PhoneType`], prefix);
  };

  const handlePhoneTypeChange = (val, prefix) => {
    const typeKey = `${prefix}PhoneType`;
    setFieldValue(typeKey, val);
    setFieldTouched(typeKey, true);
    validatePhoneField(values[`${prefix}Phone`] || "", val, prefix);
  };

  const handleEmailChange = async (e) => {
    const email = e.target.value;
    setFieldValue("email", email);
    setFieldTouched("email", true);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (email && !emailRegex.test(email)) {
      updateError("email", "Invalid email address");
    } else {
      updateError("email");
    }

  };

  const renderPhoneSection = (prefix, label) => (
    <div className="space-y-4">
      <p className="text-lg poppins-medium text-customTextGrey1 md:text-lg">{label}</p>
      <PhoneNumberField
        label={`${label}`}
        phoneName={`${prefix}Phone`}
        phoneValue={values[`${prefix}Phone`] || ""}
        phoneChange={(e) => handlePhoneChange(e, prefix)}
        countryValue={values[`${prefix}Country`]}
        countryChange={(val) => setFieldValue(`${prefix}Country`, val)}
      />
      <DropdownField
        label={`${label} type`}
        name={`${prefix}PhoneType`}
        value={values[`${prefix}PhoneType`] || ""}
        options={clientsContactPhoneTypes}
        valueChange={(val) => handlePhoneTypeChange(val, prefix)}
        componentName="NoValidation"
        error={customErrors[`${prefix}PhoneType`] || ((touched[`${prefix}PhoneType`] || submitCount > 0) ? errors[`${prefix}PhoneType`] : undefined)}
      />
    </div>
  );

  return (
    <div id={id} className="w-full scroll-m-20 rounded-xl bg-white p-5">
      <p className="mb-6 text-lg font-semibold text-customTextGrey1 md:text-xl">Contact details</p>
      <div className="space-y-7">
        {renderPhoneSection("primary", "Primary phone number")}
        {renderPhoneSection("secondary", "Secondary phone number")}
        <TextField
          label="Email address"
          type="email"
          name="email"
          value={values.email || ""}
          valueChange={handleEmailChange}
          placeholder="Enter email address"
          required
          error={(touched.email || submitCount > 0) ? errors.email || customErrors.email : customErrors.email}
        />
      </div>
    </div>
  );
};

export default ClientContact;
