import React, { useState } from "react";
import { View, StyleSheet, Pressable, Platform, Image, TextInput, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { NovaMascot } from "@/components/NovaMascot";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { getApiUrl } from "@/lib/query-client";

interface SelectedDocument {
  id: string;
  uri: string;
}

export default function MergeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const theme = Colors.dark;

  const [documents, setDocuments] = useState<SelectedDocument[]>([]);
  const [title, setTitle] = useState("Merged Document");
  const [isProcessing, setIsProcessing] = useState(false);

  const addDocument = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newDocs = result.assets.map((asset, index) => ({
        id: `${Date.now()}-${index}`,
        uri: asset.uri,
      }));
      setDocuments([...documents, ...newDocs]);
    }
  };

  const removeDocument = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const moveDocument = async (fromIndex: number, direction: "up" | "down") => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    
    if (toIndex < 0 || toIndex >= documents.length) return;
    
    const newDocs = [...documents];
    [newDocs[fromIndex], newDocs[toIndex]] = [newDocs[toIndex], newDocs[fromIndex]];
    setDocuments(newDocs);
  };

  const mergeDocs = async () => {
    if (documents.length < 2) {
      Alert.alert("Not Enough Documents", "Please add at least 2 documents to merge.");
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      
      let FileClass: any = null;
      if (Platform.OS !== "web") {
        const FileSystem = await import("expo-file-system");
        FileClass = FileSystem.File;
      }
      
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        if (Platform.OS === "web") {
          const response = await fetch(doc.uri);
          const blob = await response.blob();
          formData.append("documents", blob, `document_${i}.jpg`);
        } else {
          const file = new FileClass({ uri: doc.uri, name: `document_${i}.jpg`, mimeType: "image/jpeg" });
          formData.append("documents", file as unknown as Blob);
        }
      }
      
      formData.append("title", title);

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/pdf/merge`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to merge documents");
      }

      const blob = await response.blob();
      
      if (Platform.OS === "web") {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title.replace(/\s+/g, "_")}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const FileSystemModule = await import("expo-file-system");
        const Sharing = await import("expo-sharing");
        
        const arrayBuffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let base64 = "";
        for (let i = 0; i < bytes.length; i += 3) {
          const a = bytes[i];
          const b = bytes[i + 1] || 0;
          const c = bytes[i + 2] || 0;
          
          base64 += base64Chars[a >> 2];
          base64 += base64Chars[((a & 3) << 4) | (b >> 4)];
          base64 += i + 1 < bytes.length ? base64Chars[((b & 15) << 2) | (c >> 6)] : "=";
          base64 += i + 2 < bytes.length ? base64Chars[c & 63] : "=";
        }
        
        const fileName = `${title.replace(/\s+/g, "_")}_merged.pdf`;
        const docDir = FileSystemModule.documentDirectory;
        const fileUri = docDir + fileName;
        
        await FileSystemModule.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystemModule.EncodingType.Base64,
        });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "application/pdf",
            dialogTitle: "Save Merged PDF",
          });
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert("Success", `Your ${documents.length}-page PDF has been created!`, [
            { text: "OK", onPress: () => navigation.goBack() }
          ]);
        } else {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert(
            "PDF Saved",
            `Your merged PDF has been saved to the app. File: ${fileName}`,
            [{ text: "OK", onPress: () => navigation.goBack() }]
          );
        }
        return;
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", `Your ${documents.length}-page PDF has been created!`, [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error("Merge error:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to merge documents. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <View style={styles.header}>
          <NovaMascot
            message={documents.length >= 2 ? "Ready to merge your documents!" : "Add at least 2 documents to merge."}
            size="small"
          />
        </View>

        <View style={styles.formSection}>
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            OUTPUT FILE NAME
          </ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter file name"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.documentsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
              DOCUMENTS ({documents.length})
            </ThemedText>
          </View>

          {documents.length > 0 ? (
            <View style={styles.documentsList}>
              {documents.map((item, index) => (
                <View key={item.id} style={[styles.documentItem, { backgroundColor: theme.backgroundSecondary }]}>
                  <View style={styles.documentOrder}>
                    <ThemedText type="h3" style={[styles.orderNumber, { color: theme.accent }]}>
                      {index + 1}
                    </ThemedText>
                  </View>
                  <Image source={{ uri: item.uri }} style={styles.thumbnail} resizeMode="cover" />
                  <View style={styles.documentActions}>
                    <Pressable
                      style={[styles.moveButton, index === 0 ? styles.disabledButton : null]}
                      onPress={() => moveDocument(index, "up")}
                      disabled={index === 0}
                    >
                      <Feather name="chevron-up" size={20} color={index === 0 ? theme.textSecondary : theme.text} />
                    </Pressable>
                    <Pressable
                      style={[styles.moveButton, index === documents.length - 1 ? styles.disabledButton : null]}
                      onPress={() => moveDocument(index, "down")}
                      disabled={index === documents.length - 1}
                    >
                      <Feather name="chevron-down" size={20} color={index === documents.length - 1 ? theme.textSecondary : theme.text} />
                    </Pressable>
                    <Pressable
                      style={styles.removeButton}
                      onPress={() => removeDocument(item.id)}
                    >
                      <Feather name="x" size={20} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          <Pressable
            style={[styles.addButton, { backgroundColor: theme.backgroundSecondary, borderColor: theme.glassBorder }]}
            onPress={addDocument}
          >
            <Feather name="plus" size={24} color={theme.accent} />
            <ThemedText type="body" style={[styles.addButtonText, { color: theme.text }]}>
              Add Documents
            </ThemedText>
          </Pressable>
        </View>

        {documents.length >= 2 ? (
          <View style={[styles.previewBox, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="file-text" size={20} color={theme.accent} />
            <ThemedText type="body" style={{ color: theme.text, marginLeft: Spacing.md }}>
              This will create a {documents.length}-page PDF
            </ThemedText>
          </View>
        ) : null}

        <Button
          onPress={mergeDocs}
          disabled={documents.length < 2 || isProcessing}
          variant="primary"
          style={styles.mergeButton}
        >
          {isProcessing ? "Merging..." : "Merge to PDF"}
        </Button>
      </KeyboardAwareScrollViewCompat>
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
  formSection: {
    marginBottom: Spacing.xl,
  },
  label: {
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  input: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    fontSize: 16,
  },
  documentsSection: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  documentsList: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  documentOrder: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  orderNumber: {
    fontWeight: "700",
  },
  thumbnail: {
    width: 60,
    height: 60,
  },
  documentActions: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingRight: Spacing.md,
    gap: Spacing.xs,
  },
  moveButton: {
    padding: Spacing.sm,
  },
  disabledButton: {
    opacity: 0.3,
  },
  removeButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: "dashed",
  },
  addButtonText: {
    marginLeft: Spacing.md,
  },
  previewBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  mergeButton: {
    marginBottom: Spacing.xl,
  },
});
