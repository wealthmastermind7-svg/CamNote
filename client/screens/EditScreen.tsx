import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Platform, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { NovaMascot } from "@/components/NovaMascot";
import { FilterButton } from "@/components/FilterButton";
import { Button } from "@/components/Button";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type EditRouteProp = RouteProp<RootStackParamList, "Edit">;

const filters = [
  { id: "clean", label: "Clean", color: "#FFFFFF" },
  { id: "bw", label: "B&W", color: "#888888" },
  { id: "soft", label: "Soft Color", color: "#E8D5C4" },
  { id: "original", label: "Original", color: "#D4E6F1" },
];

export default function EditScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditRouteProp>();
  const theme = Colors.dark;

  const [selectedFilter, setSelectedFilter] = useState("clean");
  const [pages, setPages] = useState([1]);

  const handleFilterSelect = (filterId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFilter(filterId);
  };

  const handleAddPage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPages([...pages, pages.length + 1]);
  };

  const handleExport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("Export", { 
      documentId: route.params.documentId,
      imageUri: route.params.imageUri,
    });
  };

  const handleToolPress = (tool: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

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
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing["7xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mascotRow}>
          <NovaMascot
            message="Adjust your scan, then export."
            size="small"
          />
        </View>

        <View
          style={[
            styles.documentPreview,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          {route.params.imageUri ? (
            <View style={styles.documentPlaceholder}>
              <Image
                source={{ uri: route.params.imageUri }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.documentOverlay} />
              <ThemedText
                type="caption"
                style={[styles.filterLabel, { color: theme.accent }]}
              >
                Filter: {filters.find((f) => f.id === selectedFilter)?.label}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.documentPlaceholder}>
              <Feather name="file-text" size={64} color={theme.textSecondary} />
              <ThemedText
                type="small"
                style={[styles.placeholderText, { color: theme.textSecondary }]}
              >
                Document Preview
              </ThemedText>
              <ThemedText
                type="caption"
                style={[styles.filterLabel, { color: theme.accent }]}
              >
                Filter: {filters.find((f) => f.id === selectedFilter)?.label}
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.pageIndicator}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Page 1 of {pages.length}
          </ThemedText>
          {pages.length > 1 ? (
            <View style={styles.pageDots}>
              {pages.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.pageDot,
                    {
                      backgroundColor: i === 0 ? theme.accent : theme.glassBorder,
                    },
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <ThemedText
            type="small"
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            FILTERS
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersRow}
          >
            {filters.map((filter) => (
              <FilterButton
                key={filter.id}
                label={filter.label}
                selected={selectedFilter === filter.id}
                onPress={() => handleFilterSelect(filter.id)}
                previewColor={filter.color}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <ThemedText
            type="small"
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            TOOLS
          </ThemedText>
          <View style={styles.toolsGrid}>
            <Pressable
              style={[styles.toolButton, { backgroundColor: theme.backgroundSecondary }]}
              onPress={() => handleToolPress("rotate")}
            >
              <Feather name="rotate-cw" size={24} color={theme.text} />
              <ThemedText type="caption" style={styles.toolLabel}>
                Rotate
              </ThemedText>
            </Pressable>

            <Pressable
              style={[styles.toolButton, { backgroundColor: theme.backgroundSecondary }]}
              onPress={() => handleToolPress("crop")}
            >
              <Feather name="crop" size={24} color={theme.text} />
              <ThemedText type="caption" style={styles.toolLabel}>
                Crop
              </ThemedText>
            </Pressable>

            <Pressable
              style={[styles.toolButton, { backgroundColor: theme.backgroundSecondary }]}
              onPress={handleAddPage}
            >
              <Feather name="plus" size={24} color={theme.text} />
              <ThemedText type="caption" style={styles.toolLabel}>
                Add Page
              </ThemedText>
            </Pressable>

            <Pressable
              style={[styles.toolButton, { backgroundColor: theme.backgroundSecondary }]}
              onPress={() => handleToolPress("delete")}
            >
              <Feather name="trash-2" size={24} color={theme.error} />
              <ThemedText type="caption" style={[styles.toolLabel, { color: theme.error }]}>
                Delete
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom + Spacing.lg,
          },
        ]}
      >
        {Platform.OS === "ios" ? (
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: theme.backgroundDefault },
            ]}
          />
        )}
        <View style={styles.bottomBarContent}>
          <Button onPress={handleExport} style={styles.exportButton}>
            Export Document
          </Button>
        </View>
      </View>
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
  mascotRow: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  documentPreview: {
    aspectRatio: 0.75,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  documentPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  documentOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  placeholderText: {
    marginTop: Spacing.lg,
  },
  filterLabel: {
    marginTop: Spacing.sm,
    fontWeight: "600",
  },
  pageIndicator: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  pageDots: {
    flexDirection: "row",
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  pageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: Spacing.md,
    fontWeight: "600",
  },
  filtersRow: {
    paddingRight: Spacing.lg,
  },
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  toolButton: {
    width: "47%",
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  toolLabel: {
    marginTop: Spacing.sm,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  bottomBarContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  exportButton: {
    width: "100%",
  },
});
