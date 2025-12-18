import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, Platform, Image, TextInput, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { NovaMascot } from "@/components/NovaMascot";
import { FilterButton } from "@/components/FilterButton";
import { Button } from "@/components/Button";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { apiRequest } from "@/lib/query-client";
import type { Document } from "@shared/schema";

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
  const queryClient = useQueryClient();

  const [selectedFilter, setSelectedFilter] = useState("clean");
  const [pages, setPages] = useState([1]);
  const [title, setTitle] = useState("Untitled Document");
  const [isEditing, setIsEditing] = useState(false);
  const [pageRotations, setPageRotations] = useState<{ [key: number]: number }>({});

  const { data: document } = useQuery<Document>({
    queryKey: ["/api/documents", route.params.documentId],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<{ title: string; filter: string; pageCount: number }> }) => {
      const res = await apiRequest("PUT", `/api/documents/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      navigation.goBack();
    },
  });

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setSelectedFilter(document.filter);
      setPages(Array.from({ length: document.pageCount }, (_, i) => i + 1));
    }
  }, [document]);

  const handleFilterSelect = async (filterId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFilter(filterId);
    if (document) {
      updateMutation.mutate({ id: document.id, data: { filter: filterId } });
    }
  };

  const handleAddPage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newPages = [...pages, pages.length + 1];
    setPages(newPages);
    if (document) {
      updateMutation.mutate({ id: document.id, data: { pageCount: newPages.length } });
    }
  };

  const handleExport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("Export", { 
      documentId: route.params.documentId,
      imageUri: route.params.imageUri,
    });
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    if (document) {
      Alert.alert(
        "Delete Document",
        "Are you sure you want to delete this document?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Delete", 
            style: "destructive",
            onPress: () => deleteMutation.mutate(document.id)
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleTitleSubmit = () => {
    setIsEditing(false);
    if (document && title !== document.title) {
      updateMutation.mutate({ id: document.id, data: { title } });
    }
  };

  const handleRotate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPageRotations(prev => ({
      ...prev,
      0: ((prev[0] || 0) + 90) % 360
    }));
  };

  const handleCrop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Crop Document",
      "Crop functionality is available with the enhanced editing tools. Use the preview to adjust framing.",
      [{ text: "OK", style: "default" }]
    );
  };

  const imageUri = route.params.imageUri || document?.imageUri;

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

        <View style={styles.titleContainer}>
          {isEditing ? (
            <TextInput
              style={[styles.titleInput, { color: theme.text }]}
              value={title}
              onChangeText={setTitle}
              onBlur={handleTitleSubmit}
              onSubmitEditing={handleTitleSubmit}
              autoFocus
              selectTextOnFocus
            />
          ) : (
            <Pressable onPress={() => setIsEditing(true)} style={styles.titlePressable}>
              <ThemedText type="h2" style={styles.titleText}>{title}</ThemedText>
              <Feather name="edit-2" size={16} color={theme.textSecondary} style={styles.editIcon} />
            </Pressable>
          )}
        </View>

        <View
          style={[
            styles.documentPreview,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          {imageUri ? (
            <View style={styles.documentPlaceholder}>
              <Image
                source={{ uri: imageUri }}
                style={[
                  StyleSheet.absoluteFillObject,
                  { transform: [{ rotate: `${pageRotations[0] || 0}deg` }] }
                ]}
                resizeMode="cover"
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
              onPress={handleRotate}
            >
              <Feather name="rotate-cw" size={24} color={theme.text} />
              <ThemedText type="caption" style={styles.toolLabel}>
                Rotate
              </ThemedText>
            </Pressable>

            <Pressable
              style={[styles.toolButton, { backgroundColor: theme.backgroundSecondary }]}
              onPress={handleCrop}
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
              onPress={handleDelete}
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
          <Button 
            onPress={handleExport} 
            style={styles.exportButton}
          >
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
    marginBottom: Spacing.lg,
  },
  titleContainer: {
    marginBottom: Spacing.lg,
    alignItems: "center",
  },
  titlePressable: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleText: {
    textAlign: "center",
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  editIcon: {
    marginLeft: Spacing.sm,
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
