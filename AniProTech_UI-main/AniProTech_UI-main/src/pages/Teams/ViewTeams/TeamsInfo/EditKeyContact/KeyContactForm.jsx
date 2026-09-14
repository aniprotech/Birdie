  import React from "react";
  import { useFormikContext } from "formik";
  import DropdownField from "../../../../../components/DropdownInput/Dropdown";
  import TextField from "../../../../../components/TextInput/TextInput";
  import { teamTypeOfContactOptions } from "../../../../../constants";
  import PhoneNumberField from "../../../../../components/DropdownInput/PhoneNumberDropdown";
  import CheckboxButtonGroup from "../../../../../components/TextInput/CheckboxButtonGroup";
import { teamsRelationshipOptions } from "../../../../../constants/teamConstants";

  const KeyContactForm = ({ index, setFieldValue }) => {  
    const { values, errors, handleChange } = useFormikContext();

    return (
      <div className="space-y-6">
        <TextField
          name={`keyContacts[${index}].firstName`}
          label="First Name"
          value={values.keyContacts[index].firstName}
          valueChange={handleChange}
          error={errors?.keyContacts?.[index]?.firstName}
          style="textSize"
        />

        <TextField
          name={`keyContacts[${index}].lastName`}
          label="Last Name"
          value={values.keyContacts[index].lastName}
          valueChange={handleChange}
          error={errors?.keyContacts?.[index]?.lastName}
          style="textSize"
        />

        <DropdownField
          label="Relationship"
          name={`keyContacts[${index}].relationShip`}
          options={teamsRelationshipOptions}
          value={values.keyContacts[index].relationShip || null}
          valueChange={handleChange}
          error={errors?.keyContacts?.[index]?.relationShip}
          componentName="FormikValidation"
          style="textSize"
        />

        <PhoneNumberField
          label="Mobile number"
          phoneName={`keyContacts[${index}].phoneNumber`}
          phoneValue={values.keyContacts[index].phoneNumber}
          phoneChange={handleChange}
          countryValue={values.keyContacts[index].phoneCode}
          phoneError={errors?.keyContacts?.[index]?.phoneNumber}
          countryChange={(val) =>
            setFieldValue(`keyContacts[${index}].phoneCode`, val)
          }
          style="textSize"
        />

        <TextField
          name={`keyContacts[${index}].email`}
          label="Email address"
          value={values.keyContacts[index].email}
          valueChange={handleChange}
          error={errors?.keyContacts?.[index]?.email}
          style="textSize"
        />

        <CheckboxButtonGroup
          label="Type of contact"
          name={`keyContacts[${index}].typeOfContact`}
          value={values.keyContacts[index].typeOfContact}
          valueChange={handleChange}
          error={errors?.keyContacts?.[index]?.typeOfContact}
          options={teamTypeOfContactOptions}
          style="textSize"
        />
      </div>
    );
  };

  export default KeyContactForm;
