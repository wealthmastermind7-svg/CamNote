import React from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { NovaMascot } from "@/components/NovaMascot";
import { ToolItem } from "@/components/ToolItem";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useIsProUser } from "@/lib/revenuecat";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ToolsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const theme = Colors.dark;
  const isProUser = useIsProUser();

  const handleToolPress = (toolName: string, locked: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (locked && !isProUser) {
      navigation.navigate("Paywall");
    } else {
      switch (toolName) {
        case "ocr":
          navigation.navigate("OCR");
          break;
        case "signature":
          navigation.navigate("Signature");
          break;
        case "password":
          navigation.navigate("PasswordProtect");
          break;
        case "merge":
          navigation.navigate("Merge");
          break;
        case "quality":
          navigation.navigate("Settings");
          break;
        case "cloud":
          navigation.navigate("Settings");
          break;
        case "help":
          navigation.navigate("Help");
          break;
        case "subscription":
          navigation.navigate("CustomerCenter");
          break;
        default:
          break;
      }
    }
  };

  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("Paywall");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
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
              message="Upgrade for more tools."
              size="small"
              showMessage={false}
            />
          </View>
          <ThemedText type="h1" style={styles.title}>
            Tools
          </ThemedText>
        </View>

        {!isProUser ? (
          <View
            style={[
              styles.promoCard,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <View style={styles.promoContent}>
              <ThemedText type="h3" style={styles.promoTitle}>
                Unlock Pro
              </ThemedText>
              <ThemedText
                type="small"
                style={[styles.promoText, { color: theme.textSecondary }]}
              >
                Get OCR, signatures, and more
              </ThemedText>
            </View>
            <View
              style={[
                styles.promoBadge,
                { backgroundColor: theme.accentDim, borderColor: theme.accent },
              ]}
            >
              <ThemedText
                type="small"
                style={[styles.promoBadgeText, { color: theme.accent }]}
                onPress={handleUpgrade}
              >
                Upgrade
              </ThemedText>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.promoCard,
              { backgroundColor: theme.accentDim },
            ]}
          >
            <View style={styles.promoContent}>
              <ThemedText type="h3" style={[styles.promoTitle, { color: theme.accent }]}>
                CamNote Pro
              </ThemedText>
              <ThemedText
                type="small"
                style={[styles.promoText, { color: theme.text }]}
              >
                All premium features unlocked
              </ThemedText>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <ThemedText
            type="small"
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            DOCUMENT TOOLS
          </ThemedText>

          <ToolItem
            icon="type"
            title="OCR Text Extraction"
            subtitle="Extract text from scanned documents"
            locked={!isProUser}
            onPress={() => handleToolPress("ocr", !isProUser)}
          />

          <ToolItem
            icon="edit-3"
            title="Digital Signature"
            subtitle="Sign documents digitally"
            locked={!isProUser}
            onPress={() => handleToolPress("signature", !isProUser)}
          />

          <ToolItem
            icon="lock"
            title="Password Protection"
            subtitle="Secure PDFs with passwords"
            locked={!isProUser}
            onPress={() => handleToolPress("password", !isProUser)}
          />

          <ToolItem
            icon="layers"
            title="Merge Documents"
            subtitle="Combine multiple scans"
            locked={false}
            onPress={() => handleToolPress("merge", false)}
          />
        </View>

        <View style={styles.section}>
          <ThemedText
            type="small"
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            SETTINGS
          </ThemedText>

          <ToolItem
            icon="sliders"
            title="Scan Quality"
            subtitle="Adjust resolution and compression"
            locked={false}
            onPress={() => handleToolPress("quality", false)}
          />

          <ToolItem
            icon="cloud"
            title="Cloud Backup"
            subtitle="Sync to iCloud"
            locked={false}
            onPress={() => handleToolPress("cloud", false)}
          />

          <ToolItem
            icon="help-circle"
            title="Help & Support"
            locked={false}
            onPress={() => handleToolPress("help", false)}
          />

          <ToolItem
            icon="credit-card"
            title="Manage Subscription"
            subtitle={isProUser ? "Pro subscription active" : "View subscription options"}
            locked={false}
            onPress={() => handleToolPress("subscription", false)}
          />
        </View>

        <View style={styles.footer}>
          <NovaMascot message="Need help? I'm here for you." size="medium" />
          <ThemedText
            type="caption"
            style={[styles.version, { color: theme.textSecondary }]}
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
  header: {
    marginBottom: Spacing.xl,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: Spacing.md,
  },
  title: {},
  promoCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing["3xl"],
  },
  promoContent: {},
  promoTitle: {
    marginBottom: Spacing.xs,
  },
  promoText: {},
  promoBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  promoBadgeText: {
    fontWeight: "600",
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
  footer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  version: {
    marginTop: Spacing.lg,
  },
});
