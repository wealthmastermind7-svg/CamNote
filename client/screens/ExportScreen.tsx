import React from "react";
import { View, StyleSheet, ScrollView, Share, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { Colors, Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { NovaMascot } from "@/components/NovaMascot";
import { ExportOption } from "@/components/ExportOption";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ExportScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();
  const theme = Colors.dark;

  const handleExport = async (format: string, locked: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (locked) {
      navigation.navigate("Paywall");
      return;
    }

    try {
      await Share.share({
        message: `Sharing document as ${format.toUpperCase()}`,
        title: "Share Document",
      });
    } catch (error) {
    }
  };

  const handleShare = async (destination: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await Share.share({
        message: `Sharing document via ${destination}`,
        title: "Share Document",
      });
    } catch (error) {
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
