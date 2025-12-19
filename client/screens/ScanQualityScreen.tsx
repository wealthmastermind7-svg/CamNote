import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { SCAN_QUALITY } from "@/constants/config";

export default function ScanQualityScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const theme = Colors.dark;
  const [selectedQuality, setSelectedQuality] = useState<string>(SCAN_QUALITY.DEFAULT);

  const handleQualityPress = async (qualityId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedQuality(qualityId);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Scan Quality
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.description, { color: theme.textSecondary }]}
          >
            Choose the quality level for your scans. Higher DPI means better
            quality but larger file sizes.
          </ThemedText>
        </View>

        <View style={styles.optionsContainer}>
          {SCAN_QUALITY.PRESETS.map((preset) => (
            <Pressable
              key={preset.id}
              onPress={() => handleQualityPress(preset.id)}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor:
                    selectedQuality === preset.id
                      ? theme.accentDim
                      : theme.backgroundSecondary,
                  borderColor:
                    selectedQuality === preset.id
                      ? theme.accent
                      : theme.glassBorder,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View style={styles.optionHeader}>
                <View style={styles.optionLeft}>
                  <ThemedText
                    type="body"
                    style={[
                      styles.optionTitle,
                      {
                        color:
                          selectedQuality === preset.id
                            ? theme.accent
                            : theme.text,
                      },
                    ]}
                  >
                    {preset.label}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={[
                      styles.optionDescription,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {preset.description}
                  </ThemedText>
                </View>

                {selectedQuality === preset.id ? (
                  <View
                    style={[styles.checkmark, { backgroundColor: theme.accent }]}
                  >
                    <Feather name="check" size={16} color="#FFFFFF" />
                  </View>
                ) : (
                  <View
                    style={[styles.checkmark, { backgroundColor: theme.glass }]}
                  />
                )}
              </View>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Feather name="maximize" size={14} color={theme.accent} />
                  <ThemedText type="small" style={styles.statText}>
                    {preset.dpi} DPI
                  </ThemedText>
                </View>
                <View style={styles.stat}>
                  <Feather name="minimize-2" size={14} color={theme.accent} />
                  <ThemedText type="small" style={styles.statText}>
                    {preset.compression} compression
                  </ThemedText>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <View
          style={[
            styles.infoBox,
            { backgroundColor: theme.accentDim, borderColor: theme.accent },
          ]}
        >
          <Feather name="info" size={16} color={theme.accent} />
          <ThemedText
            type="small"
            style={[styles.infoText, { color: theme.accent }]}
          >
            Your selected quality will apply to all new scans. You can change
            this anytime.
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  description: {
    lineHeight: 20,
  },
  optionsContainer: {
    marginBottom: Spacing["2xl"],
    gap: Spacing.md,
  },
  option: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    padding: Spacing.lg,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  optionLeft: {
    flex: 1,
    marginRight: Spacing.lg,
  },
  optionTitle: {
    marginBottom: Spacing.xs,
    fontWeight: "600",
  },
  optionDescription: {
    lineHeight: 18,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  statText: {
    fontSize: 12,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  infoText: {
    flex: 1,
    lineHeight: 18,
  },
});
