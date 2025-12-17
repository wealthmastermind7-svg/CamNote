import React from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Colors, Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { NovaMascot } from "@/components/NovaMascot";
import { DocumentCard } from "@/components/DocumentCard";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Document } from "@shared/schema";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function formatDate(date: Date): string {
  const now = new Date();
  const docDate = new Date(date);
  const diffDays = Math.floor((now.getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return docDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function FilesScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const theme = Colors.dark;

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
    refetchOnMount: true,
    staleTime: 0,
  });

  const handleDocumentPress = (doc: Document) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Edit", { documentId: doc.id, imageUri: doc.imageUri });
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
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.accent} />
              <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
                Loading documents...
              </ThemedText>
            </View>
          ) : documents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <NovaMascot message="No documents yet. Scan your first document!" size="medium" />
            </View>
          ) : (
            documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                title={doc.title}
                pageCount={doc.pageCount}
                date={formatDate(doc.createdAt)}
                onPress={() => handleDocumentPress(doc)}
              />
            ))
          )}
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
  loadingContainer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
});
