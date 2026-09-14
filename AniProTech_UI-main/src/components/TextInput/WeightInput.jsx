import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import TextField from "./TextInput";

const WeightInput = ({ label, name, value, valueChange, error }) => {
    const [unit, setUnit] = useState("kg");
    const [stone, setStone] = useState("");
    const [pounds, setPounds] = useState("");
    const [kg, setKg] = useState("");

    useEffect(() => {
        const kgVal = parseFloat(value);
        if (isNaN(kgVal)) {
            setKg("");
            setStone("");
            setPounds("");
        } else if (unit === "kg") {
            setKg(value); // Keep raw value here
        } else {
            const totalPounds = kgVal * 2.20462;
            const st = Math.floor(totalPounds / 14);
            const lbs = totalPounds % 14;
            setStone(st.toString());
            setPounds(lbs.toFixed(1).toString());
        }
    }, [value, unit]);

    const toggleUnit = () => {
        setUnit((prev) => (prev === "kg" ? "stone" : "kg"));
    };

    const handleKgChange = (val) => {
        setKg(val); // Set without formatting
        const kgNum = parseFloat(val);
        if (!isNaN(kgNum)) {
            valueChange({ target: { name, value: kgNum.toString() } });
        } else {
            valueChange({ target: { name, value: "" } });
        }
    };

    const handleStonePoundChange = (val, field) => {
        if (field === "stone") setStone(val);
        if (field === "pounds") setPounds(val);

        const s = parseFloat(field === "stone" ? val : stone) || 0;
        const p = parseFloat(field === "pounds" ? val : pounds) || 0;
        const totalKg = (s * 14 + p) / 2.20462;
        const formatted = totalKg.toFixed(2);
        valueChange({ target: { name, value: formatted } });
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <button
                    type="button"
                    onClick={toggleUnit}
                    className="text-sm text-customFeedCardBlueText hover:text-customFeedCardBlueText/80"
                >
                    Switch to {unit === "kg" ? "stone" : "kg"}
                </button>
            </div>

            {unit === "kg" ? (
                <div className="flex items-center gap-2">
                    <TextField
                        label=""
                        name={`${name}_kg`}
                        type="number"
                        value={kg}
                        valueChange={(e) => handleKgChange(e.target.value)}
                        error={error}
                        placeHolder="Enter weight in kg"
                        min="0"
                    />
                    <span className="text-sm text-gray-500">Kilograms</span>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <TextField
                        label=""
                        name={`${name}_stone`}
                        type="number"
                        value={stone}
                        valueChange={(e) => handleStonePoundChange(e.target.value, "stone")}
                        error={error}
                        placeHolder="Stone"
                        min="0"
                    />
                    <span className="text-sm text-gray-500">Stone</span>

                    <TextField
                        label=""
                        name={`${name}_pounds`}
                        type="number"
                        value={pounds}
                        valueChange={(e) => handleStonePoundChange(e.target.value, "pounds")}
                        error={error}
                        placeHolder="Pounds"
                        step="0.1"
                        min="0"
                        max="13.9"
                    />
                    <span className="text-sm text-gray-500">Pounds</span>
                </div>
            )}
        </div>
    );
};

WeightInput.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string,
    valueChange: PropTypes.func.isRequired,
    error: PropTypes.string,
};

export default WeightInput;
