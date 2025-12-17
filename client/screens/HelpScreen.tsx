import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const theme = Colors.dark;

  const helpTopics = [
    {
      title: "Getting Started",
      description: "Learn the basics of CamNote",
      icon: "play-circle",
    },
    {
      title: "Document Scanning",
      description: "Tips for best scan quality",
      icon: "camera",
    },
    {
      title: "Exporting Documents",
      description: "Export to different formats",
      icon: "download",
    },
    {
      title: "Contact Support",
      description: "Reach out to our team",
      icon: "mail",
    },
  ];

  const handleTopicPress = (title: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Spacing.lg,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText
            type="h2"
            style={[styles.heading, { marginBottom: Spacing.xl }]}
          >
            Help & Support
          </ThemedText>

          {helpTopics.map((topic, index) => (
            <Pressable
              key={index}
              onPress={() => handleTopicPress(topic.title)}
              style={({ pressed }) => [
                styles.topicItem,
                {
                  backgroundColor: theme.backgroundSecondary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View style={styles.topicContent}>
                <Feather
                  name={topic.icon as any}
                  size={20}
                  color={theme.accent}
                  style={styles.topicIcon}
                />
                <View style={styles.topicText}>
                  <ThemedText type="body" style={styles.topicTitle}>
                    {topic.title}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={[
                      styles.topicDescription,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {topic.description}
                  </ThemedText>
                </View>
              </View>
              <Feather
                name="chevron-right"
                size={20}
                color={theme.textSecondary}
              />
            </Pressable>
          ))}
        </View>

        <View
          style={[
            styles.faqCard,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <ThemedText type="h3" style={[styles.faqTitle, { marginBottom: Spacing.md }]}>
            Frequently Asked Questions
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.faqText, { color: theme.textSecondary }]}
          >
            How can I improve scan quality? Use good lighting and hold your camera
            steady for the best results.
          </ThemedText>
          <ThemedText
            type="body"
            style={[
              styles.faqText,
              { color: theme.textSecondary, marginTop: Spacing.lg },
            ]}
          >
            Can I merge multiple documents? Yes, use the Merge Documents tool to combine
            multiple scans into one.
          </ThemedText>
        </View>

        <View
          style={[
            styles.versionCard,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <ThemedText
            type="caption"
            style={[styles.versionText, { color: theme.textSecondary }]}
          >
            CamNote v1.0.0
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
  heading: {},
  section: {
    marginBottom: Spacing["2xl"],
  },
  topicItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  topicContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  topicIcon: {
    marginRight: Spacing.lg,
  },
  topicText: {
    flex: 1,
  },
  topicTitle: {
    marginBottom: Spacing.xs,
  },
  topicDescription: {},
  faqCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  faqTitle: {},
  faqText: {
    lineHeight: 24,
  },
  versionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  versionText: {},
});
