import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Platform, Image, ActivityIndicator, Share, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { NovaMascot } from "@/components/NovaMascot";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getApiUrl } from "@/lib/query-client";

type OCRRouteProp = RouteProp<RootStackParamList, "OCR">;

export default function OCRScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const route = useRoute<OCRRouteProp>();
  const theme = Colors.dark;

  const [imageUri, setImageUri] = useState<string | null>(route.params?.imageUri || null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [wordCount, setWordCount] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const pickImage = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setExtractedText("");
      setConfidence(null);
    }
  };

  const processOCR = async () => {
    if (!imageUri) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsProcessing(true);
    setExtractedText("");

    try {
      const formData = new FormData();
      
      if (Platform.OS === "web") {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append("image", blob, "image.jpg");
      } else {
        const FileSystem = await import("expo-file-system");
        const { File } = FileSystem;
        const file = new File({ uri: imageUri, name: "image.jpg", mimeType: "image/jpeg" });
        formData.append("image", file as unknown as Blob);
      }

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/ocr`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("OCR processing failed");
      }

      const data = await response.json();
      setExtractedText(data.text);
      setConfidence(data.confidence);
      setWordCount(data.wordCount);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("OCR error:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setExtractedText("Failed to extract text. Please try again with a clearer image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      if (Platform.OS === "web" && navigator.clipboard) {
        await navigator.clipboard.writeText(extractedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        Alert.alert("Copied", "Text copied to clipboard");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      Alert.alert("Copy", "Please select and copy the text manually");
    }
  };

  const shareText = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: extractedText,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
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
        <View style={styles.header}>
          <NovaMascot
            message={extractedText ? "Text extracted successfully!" : "Select an image to extract text."}
            size="small"
          />
        </View>

        {imageUri ? (
          <View style={[styles.imageContainer, { backgroundColor: theme.backgroundSecondary }]}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
            <Pressable
              style={[styles.changeImageButton, { backgroundColor: theme.glass }]}
              onPress={pickImage}
            >
              <Feather name="refresh-cw" size={16} color={theme.text} />
              <ThemedText type="small" style={{ marginLeft: Spacing.xs }}>Change</ThemedText>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={[styles.imagePicker, { backgroundColor: theme.backgroundSecondary, borderColor: theme.glassBorder }]}
            onPress={pickImage}
          >
            <Feather name="image" size={48} color={theme.textSecondary} />
            <ThemedText type="body" style={[styles.pickerText, { color: theme.textSecondary }]}>
              Tap to select an image
            </ThemedText>
          </Pressable>
        )}

        <Button
          onPress={processOCR}
          disabled={!imageUri || isProcessing}
          variant="primary"
          style={styles.extractButton}
        >
          {isProcessing ? "Processing..." : "Extract Text"}
        </Button>

        {isProcessing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
            <ThemedText type="small" style={[styles.processingText, { color: theme.textSecondary }]}>
              Analyzing image with Tesseract OCR...
            </ThemedText>
          </View>
        ) : null}

        {extractedText && !isProcessing ? (
          <View style={styles.resultsContainer}>
            <View style={styles.statsRow}>
              {confidence !== null ? (
                <View style={[styles.statBadge, { backgroundColor: theme.accentDim }]}>
                  <ThemedText type="small" style={{ color: theme.accent }}>
                    {confidence}% confidence
                  </ThemedText>
                </View>
              ) : null}
              <View style={[styles.statBadge, { backgroundColor: theme.backgroundSecondary }]}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {wordCount} words
                </ThemedText>
              </View>
            </View>

            <View style={[styles.textContainer, { backgroundColor: theme.backgroundSecondary }]}>
              <ThemedText type="body" style={styles.extractedText} selectable>
                {extractedText}
              </ThemedText>
            </View>

            <View style={styles.actionButtons}>
              <Button
                onPress={copyToClipboard}
                variant={copied ? "primary" : "secondary"}
                style={styles.actionButton}
              >
                {copied ? "Copied!" : "Copy Text"}
              </Button>
              <Button
                onPress={shareText}
                variant="secondary"
                style={styles.actionButton}
              >
                Share
              </Button>
            </View>
          </View>
        ) : null}
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
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  imagePicker: {
    height: 200,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  pickerText: {
    marginTop: Spacing.md,
  },
  imageContainer: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    marginBottom: Spacing.lg,
    position: "relative",
  },
  image: {
    width: "100%",
    height: 200,
  },
  changeImageButton: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  extractButton: {
    marginBottom: Spacing.xl,
  },
  processingContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  processingText: {
    marginTop: Spacing.md,
  },
  resultsContainer: {
    marginTop: Spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  textContainer: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  extractedText: {
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
