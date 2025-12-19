import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Share, Alert, ActivityIndicator, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { Colors, Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { NovaMascot } from "@/components/NovaMascot";
import { ExportOption } from "@/components/ExportOption";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useIsProUser } from "@/lib/revenuecat";
import { getApiUrl } from "@/lib/query-client";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ExportRouteProp = RouteProp<RootStackParamList, "Export">;

export default function ExportScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ExportRouteProp>();
  const theme = Colors.dark;
  const isProUser = useIsProUser();

  const imageUri = route.params.imageUri;

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: string, locked: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (locked) {
      navigation.navigate("Paywall");
      return;
    }

    try {
      if (!imageUri) {
        Alert.alert("Error", "No image available to export");
        return;
      }

      // Handle premium exports (DOCX, XLSX, TXT) with backend
      if (format.toLowerCase() === "docx" || format.toLowerCase() === "xlsx" || format.toLowerCase() === "txt") {
        setIsExporting(true);
        
        const formData = new FormData();
        
        if (Platform.OS === "web") {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          formData.append("image", blob, "image.jpg");
        } else {
          const { File } = await import("expo-file-system");
          const file = new File(imageUri);
          formData.append("image", file as unknown as Blob, "image.jpg");
        }

        const apiUrl = getApiUrl();
        const exportUrl = format.toLowerCase() === "docx" ? "/api/export/docx" : 
                         format.toLowerCase() === "xlsx" ? "/api/export/xlsx" : 
                         "/api/export/txt";

        const exportResponse = await fetch(`${apiUrl}${exportUrl}`, {
          method: "POST",
          body: formData,
        });

        if (!exportResponse.ok) {
          throw new Error(`Failed to export as ${format}`);
        }

        const blob = await exportResponse.blob();
        const fileExtension = format.toLowerCase() === "docx" ? "docx" : 
                             format.toLowerCase() === "xlsx" ? "xlsx" : "txt";
        
        if (Platform.OS === "web") {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `document.${fileExtension}`;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          const FileSystemLegacy = await import("expo-file-system/legacy");
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
          
          const fileName = `document.${fileExtension}`;
          const docDir = FileSystemLegacy.cacheDirectory;
          const fileUri = docDir + fileName;
          
          await FileSystemLegacy.writeAsStringAsync(fileUri, base64, {
            encoding: FileSystemLegacy.EncodingType.Base64,
          });
          
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
              mimeType: format.toLowerCase() === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" :
                       format.toLowerCase() === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" :
                       "text/plain",
              dialogTitle: `Export as ${format}`,
            });
          }
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        // Use native share dialog for PDF and JPG exports
        await Share.share({
          url: imageUri,
          title: `Export as ${format.toUpperCase()}`,
          message: `Scanned document exported as ${format.toUpperCase()}`,
        });
      }
    } catch (error) {
      console.error(`Export error:`, error);
      Alert.alert("Error", `Failed to export as ${format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async (destination: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      if (!imageUri) {
        Alert.alert("Error", "No image available to share");
        return;
      }

      // Use native share dialog for all sharing options
      await Share.share({
        url: imageUri,
        title: `Share via ${destination}`,
        message: "Scanned document - check it out",
      });
    } catch (error) {
      Alert.alert("Error", `Failed to share via ${destination}`);
    }
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
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mascotRow}>
          <NovaMascot
            message="Choose a format to export."
            size="small"
          />
        </View>

        <View style={styles.section}>
          <ThemedText
            type="small"
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            EXPORT FORMAT
          </ThemedText>

          <ExportOption
            icon="file-text"
            title="PDF"
            subtitle="Standard document format"
            locked={false}
            onPress={() => handleExport("pdf", false)}
          />

          <ExportOption
            icon="image"
            title="JPG Image"
            subtitle="High quality images"
            locked={false}
            onPress={() => handleExport("jpg", false)}
          />

          <ExportOption
            icon="file"
            title="Word Document"
            subtitle="Editable .docx format"
            locked={!isProUser}
            onPress={() => handleExport("docx", !isProUser)}
          />

          <ExportOption
            icon="grid"
            title="Excel Spreadsheet"
            subtitle="Extract tables to .xlsx"
            locked={!isProUser}
            onPress={() => handleExport("xlsx", !isProUser)}
          />

          <ExportOption
            icon="align-left"
            title="Plain Text"
            subtitle="OCR extracted text"
            locked={!isProUser}
            onPress={() => handleExport("txt", !isProUser)}
          />
        </View>

        <View style={styles.section}>
          <ThemedText
            type="small"
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            SHARE TO
          </ThemedText>

          <ExportOption
            icon="mail"
            title="Email"
            subtitle="Send as attachment"
            locked={false}
            onPress={() => handleShare("email")}
          />

          <ExportOption
            icon="share-2"
            title="Share Sheet"
            subtitle="AirDrop, Messages, and more"
            locked={false}
            onPress={() => handleShare("share")}
          />

          <ExportOption
            icon="printer"
            title="Print"
            subtitle="Send to nearby printer"
            locked={false}
            onPress={() => handleShare("print")}
          />
        </View>

        <View style={styles.proTip}>
          <NovaMascot
            message="Upgrade to Pro to export as Word, Excel, or extract text with OCR."
            size="small"
          />
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
  mascotRow: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: Spacing.lg,
    fontWeight: "600",
  },
  proTip: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
});
