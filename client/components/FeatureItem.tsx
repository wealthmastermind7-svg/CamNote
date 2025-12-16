import React from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors, Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";

interface FeatureItemProps {
  text: string;
  locked?: boolean;
}

export function FeatureItem({ text, locked = false }: FeatureItemProps) {
  const theme = Colors.dark;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: locked ? theme.glassBorder : theme.accentDim,
          },
        ]}
      >
        <Feather
          name={locked ? "lock" : "check"}
          size={14}
          color={locked ? theme.textSecondary : theme.accent}
        />
      </View>
      <ThemedText
        type="small"
        style={[
          styles.text,
          { color: locked ? theme.textSecondary : theme.text },
        ]}
      >
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  text: {
    flex: 1,
  },
});
