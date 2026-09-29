import React from "react";
import { Text, View } from "react-native";
import { styles } from "./ui";

type PickerProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  optional?: boolean;
  minDate?: string;
};

function WebPicker({ label, value, onChangeText, optional, minDate, mode }: PickerProps & { mode: "date" | "time" }) {
  return <View style={{ gap: 5 }}>
    <Text style={styles.muted}>{label}</Text>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <input
        aria-label={label}
        type={mode}
        value={value}
        min={mode === "date" ? minDate : undefined}
        onChange={event => onChangeText(event.target.value)}
        onClick={event => { try { event.currentTarget.showPicker?.(); } catch { /* Browser picker unavailable. */ } }}
        style={{ flex: 1, minWidth: 0, border: "1px solid #B9D5E3", borderRadius: 10, padding: 13, background: "white", fontSize: 16, color: "#0B2447", cursor: "pointer" }}
      />
      {optional && !!value && <button type="button" onClick={() => onChangeText("")} style={{ border: "1px solid #B9D5E3", borderRadius: 10, padding: 13, background: "white" }}>Clear</button>}
    </View>
  </View>;
}

export function DateInput(props: PickerProps) { return <WebPicker {...props} mode="date" />; }
export function TimeInput(props: PickerProps) { return <WebPicker {...props} mode="time" />; }
