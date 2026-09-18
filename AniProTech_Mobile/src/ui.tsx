import React from "react";
import {
  Text,
  View,
  Pressable,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";
export const colours = {
  navy: "#071A33",
  cyan: "#00AEEB",
  cyanBright: "#00C8F4",
  background: "#F4FBFF",
  text: "#0B2447",
  muted: "#52677F",
};
export const styles = StyleSheet.create({
  page: { padding: 20, gap: 14, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: "700", color: colours.navy },
  heading: { fontSize: 18, fontWeight: "600", color: colours.navy },
  text: { fontSize: 15, color: colours.text, lineHeight: 22 },
  muted: { fontSize: 13, color: colours.muted, lineHeight: 19 },
  card: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#D8EAF3",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#B9D5E3",
    padding: 13,
    borderRadius: 10,
    backgroundColor: "white",
    fontSize: 16,
    color: colours.text,
  },
  button: {
    backgroundColor: colours.cyan,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colours.cyan,
  },
  buttonText: { color: "white", fontWeight: "600", fontSize: 14 },
  buttonSecondary: { backgroundColor: "white" },
  buttonSecondaryText: { color: colours.text },
  buttonSelected: {
    backgroundColor: colours.navy,
    borderColor: colours.navy,
  },
  buttonPressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  error: {
    color: "#a02a2a",
    backgroundColor: "#fff0f0",
    padding: 12,
    borderRadius: 10,
  },
  badge: { fontSize: 12, fontWeight: "600", color: colours.cyan },
  tabs: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#D8EAF3",
    backgroundColor: "white",
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 16 },
  tabText: { fontSize: 12, color: colours.muted },
});
export function Button({
  title,
  onPress,
  disabled = false,
  variant = "primary",
  selected = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  selected?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.buttonSecondary,
        selected && styles.buttonSelected,
        pressed && !disabled && styles.buttonPressed,
        disabled && { opacity: 0.45 },
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant === "secondary" && !selected && styles.buttonSecondaryText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Input({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 5 }}>
      <Text style={styles.muted}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#8290a4"
        style={styles.input}
        {...props}
      />
    </View>
  );
}
export function Card({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress?: () => void;
}) {
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      {children}
    </Pressable>
  ) : (
    <View style={styles.card}>{children}</View>
  );
}
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const addDays = (date: string, n: number) =>
  new Date(Date.parse(date) + n * 86400000).toISOString().slice(0, 10);
export const currency = (pence: number | string) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    Number(pence) / 100,
  );
export const timestamp = (date: string) =>
  new Date(date).toLocaleString("en-GB", { timeZone: "Europe/London" });
