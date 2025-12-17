import React from "react";
import { View, StyleSheet, ScrollView, Share, Alert } from "react-native";
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ExportRouteProp = RouteProp<RootStackParamList, "Export">;

export default function ExportScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ExportRouteProp>();
  const theme = Colors.dark;

  const imageUri = route.params.imageUri;

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

      // Use native share dialog for both PDF and JPG exports
      await Share.share({
        url: imageUri,
        title: `Export as ${format.toUpperCase()}`,
        message: `Scanned document exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      Alert.alert("Error", `Failed to export as ${format.toUpperCase()}`);
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
            locked={true}
            onPress={() => handleExport("docx", true)}
          />

          <ExportOption
            icon="grid"
            title="Excel Spreadsheet"
            subtitle="Extract tables to .xlsx"
            locked={true}
            onPress={() => handleExport("xlsx", true)}
          />

          <ExportOption
            icon="align-left"
            title="Plain Text"
            subtitle="OCR extracted text"
            locked={true}
            onPress={() => handleExport("txt", true)}
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
