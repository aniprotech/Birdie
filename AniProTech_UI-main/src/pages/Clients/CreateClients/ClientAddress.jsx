import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FieldArray, useFormikContext } from "formik";
import TextField from "../../../components/TextInput/TextInput";
import TextAddressField from "../../../components/TextInput/TextAddressInput";
import TextAreaField from "../../../components/TextInput/TextAreaField";
import DropdownField from "../../../components/DropdownInput/Dropdown";
import AddressMapAndZone from "../../../components/Map/AddressMapAndZone";
import { clientsContactAddressTypes } from "../../../constants";

const initialAddress = {
    searchAddress: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    county: "",
    country: "",
    postalCode: "",
    secureCheckin: false,
    accessDetails: "",
    addressType: "MAIN_BUSINESS_PREMISES",
    isPrimary: false,
    lat: 55.9427,
    lng: -3.2676,
    radius: 100,
};

const ClientAddress = ({ id }) => {

    const { values, handleChange, touched, errors, setFieldValue } = useFormikContext();

    useEffect(() => {
        if (values.addresses?.length > 0 && values.addresses[0].isPrimary !== true) {
            setFieldValue("addresses.0.isPrimary", true);
        }
    }, [values.addresses, setFieldValue]);

    const handleAddressChange = (val, fieldName, structuredData) => {
        const idxMatch = fieldName.match(/addresses\.(\d+)\.searchAddress/);
        if (!idxMatch) return;

        const index = Number(idxMatch[1]);
        setFieldValue(`addresses.${index}.searchAddress`, val);

        if (structuredData) {
            setFieldValue(`addresses.${index}.addressLine1`, structuredData.address || "");
            setFieldValue(`addresses.${index}.city`, structuredData.city || "");
            setFieldValue(`addresses.${index}.county`, structuredData.county || "");
            setFieldValue(`addresses.${index}.country`, structuredData.country || "");
            setFieldValue(`addresses.${index}.postalCode`, structuredData.postalCode || "");
            setFieldValue(`addresses.${index}.lat`, structuredData.lat || 55.9427);
            setFieldValue(`addresses.${index}.lng`, structuredData.lng || -3.2676);
        }
    };

    const handleLatLngChange = (index, newLatLng) => {
        setFieldValue(`addresses.${index}.lat`, newLatLng.lat);
        setFieldValue(`addresses.${index}.lng`, newLatLng.lng);
    };

    const handleRadiusChange = (index, newRadius) => {
        setFieldValue(`addresses.${index}.radius`, newRadius);
    };

    return (
        <div
            id={id}
            className="scroll-mt-20 rounded-md bg-white p-6 shadow"
        >
            <p className="mb-6 text-lg font-semibold text-customTextGrey1 md:text-xl">Addresses</p>

            <FieldArray name="addresses">
                {({ push, remove }) => (
                    <div className="flex flex-col gap-6">
                        {values?.addresses?.map((address, index) => {
                            const isPrimary = index === 0;
                            const lat = address?.lat || 55.9427;
                            const lng = address?.lng || -3.2676;
                            const radius = address?.radius || 100;

                            return (
                                <div
                                    key={index}
                                    className="mb-6"
                                >
                                    <h2 className="poppins-medium mb-2 text-lg text-customTextGrey1">
                                        {isPrimary ? "Primary address" : `Additional address ${index}`}
                                    </h2>
                                    <div className="mb-4 rounded-md bg-customHoverBlue p-4">
                                        <TextAddressField
                                            name={`addresses.${index}.searchAddress`}
                                            label="Search Address"
                                            value={address?.searchAddress}
                                            valueChange={handleAddressChange}
                                            isAddressField={true}
                                            componentName="FormikValidation"
                                        />
                                    </div>
                                    <hr className="my-7 font-semibold text-black" />
                                    <div className="space-y-4">
                                        {!isPrimary && (
                                            <DropdownField
                                                name={`addresses.${index}.addressType`}
                                                label="Address Type"
                                                value={address?.addressType || "MAIN_BUSINESS_PREMISES"}
                                                valueChange={handleChange}
                                                options={clientsContactAddressTypes}
                                                componentName="FormikValidation"
                                            />
                                        )}

                                        <TextField
                                            name={`addresses.${index}.addressLine1`}
                                            label="Address line 1"
                                            value={address?.addressLine1}
                                            valueChange={handleChange}
                                        />
                                        <TextField
                                            name={`addresses.${index}.addressLine2`}
                                            label="Address line 2"
                                            value={address?.addressLine2}
                                            valueChange={handleChange}
                                        />
                                        <TextField
                                            name={`addresses.${index}.city`}
                                            label="City"
                                            value={address?.city}
                                            valueChange={handleChange}
                                        />
                                        <TextField
                                            name={`addresses.${index}.county`}
                                            label="County"
                                            value={address?.county}
                                            valueChange={handleChange}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <TextField
                                                name={`addresses.${index}.postalCode`}
                                                label="Postal code"
                                                value={address?.postalCode}
                                                valueChange={handleChange}
                                            />
                                            <TextField
                                                name={`addresses.${index}.country`}
                                                label="Country"
                                                value={address?.country}
                                                valueChange={handleChange}
                                            />
                                        </div>
                                        <TextAreaField
                                            name={`addresses.${index}.accessDetails`}
                                            label="Access details"
                                            value={address?.accessDetails}
                                            valueChange={handleChange}
                                            error={touched?.addresses?.[index]?.accessDetails && errors?.addresses?.[index]?.accessDetails}
                                            required
                                            rows={4}
                                        />
                                        {!isPrimary && (
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="border border-customRed px-4 py-2 text-sm text-customRed hover:underline"
                                            >
                                                Remove address
                                            </button>
                                        )}
                                    </div>
                                    <AddressMapAndZone
                                        address={address?.searchAddress}
                                        lat={lat}
                                        lng={lng}
                                        radius={radius}
                                        originalLatLng={{ lat, lng }}
                                        onLatLngChange={(newLatLng) => handleLatLngChange(index, newLatLng)}
                                        onRadiusChange={(newRadius) => handleRadiusChange(index, newRadius)}
                                        disabled={false}
                                        isLoaded={true}
                                        onPinDragged={({ lat, lng }) => {
                                          console.log("New position in parent:", lat, lng);
                                        }}
                                    />
                                </div>
                            );
                        })}

                        <button
                            type="button"
                            onClick={() => push({ ...initialAddress })}
                            className="mt-2 w-full max-w-60 border border-customNavy px-4 py-2 text-sm text-customTextNavy transition hover:bg-blue-50"
                        >
                            Add additional address
                        </button>
                    </div>
                )}
            </FieldArray>
        </div>
    );
};

ClientAddress.propTypes = {
    id: PropTypes.string.isRequired,
};

export default ClientAddress;
