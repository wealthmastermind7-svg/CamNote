import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { NovaMascot } from "@/components/NovaMascot";
import { DocumentCard } from "@/components/DocumentCard";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Document {
  id: string;
  title: string;
  pageCount: number;
  date: string;
}

const mockDocuments: Document[] = [
  { id: "1", title: "Contract Agreement", pageCount: 4, date: "Today" },
  { id: "2", title: "Meeting Notes", pageCount: 2, date: "Yesterday" },
  { id: "3", title: "Receipt - Electronics", pageCount: 1, date: "Dec 14" },
  { id: "4", title: "Insurance Document", pageCount: 6, date: "Dec 12" },
  { id: "5", title: "Tax Form 2024", pageCount: 3, date: "Dec 10" },
];

export default function FilesScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const theme = Colors.dark;

  const [documents] = useState<Document[]>(mockDocuments);

  const handleDocumentPress = (doc: Document) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Edit", { documentId: doc.id });
  };

  const totalPages = documents.reduce((sum, doc) => sum + doc.pageCount, 0);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundRoot },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <NovaMascot
              message="Tap a document to edit."
              size="small"
              showMessage={false}
            />
          </View>
          <ThemedText type="h1" style={styles.title}>
            Files
          </ThemedText>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <ThemedText
                type="displayMedium"
                style={[styles.statNumber, { color: theme.accent }]}
              >
                {documents.length}
              </ThemedText>
              <ThemedText
                type="small"
                style={[styles.statLabel, { color: theme.textSecondary }]}
              >
                Documents
              </ThemedText>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: theme.glassBorder }]}
            />
            <View style={styles.stat}>
              <ThemedText
                type="displayMedium"
                style={[styles.statNumber, { color: theme.accent }]}
              >
                {totalPages}
              </ThemedText>
              <ThemedText
                type="small"
                style={[styles.statLabel, { color: theme.textSecondary }]}
              >
                Total Pages
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText
            type="small"
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            RECENT
          </ThemedText>
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              title={doc.title}
              pageCount={doc.pageCount}
              date={doc.date}
              onPress={() => handleDocumentPress(doc)}
            />
          ))}
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
  header: {
    marginBottom: Spacing["3xl"],
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flex: 1,
  },
  statNumber: {
    marginBottom: Spacing.xs,
  },
  statLabel: {
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 60,
    marginHorizontal: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: Spacing.lg,
    fontWeight: "600",
  },
});
