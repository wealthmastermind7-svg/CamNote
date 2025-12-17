import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { Feather } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useRevenueCat } from "@/lib/revenuecat";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ManageOptionProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function ManageOption({ icon, title, subtitle, onPress }: ManageOptionProps) {
  const theme = Colors.dark;

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.optionCard}>
        <View style={[styles.iconContainer, { backgroundColor: theme.accentDim }]}>
          <Feather name={icon} size={20} color={theme.accent} />
        </View>
        <View style={styles.optionContent}>
          <ThemedText type="body" style={styles.optionTitle}>
            {title}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {subtitle}
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </Card>
    </Pressable>
  );
}

export default function CustomerCenterScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const theme = Colors.dark;
  const { customerInfo, isProUser, restorePurchases } = useRevenueCat();
  const [isRestoring, setIsRestoring] = useState(false);

  const handleManageSubscription = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (Platform.OS === "ios") {
      try {
        await WebBrowser.openBrowserAsync(
          "https://apps.apple.com/account/subscriptions"
        );
      } catch (error) {
        Alert.alert(
          "Manage Subscription",
          "To manage your subscription, go to Settings > Your Name > Subscriptions on your device."
        );
      }
    } else if (Platform.OS === "android") {
      try {
        await WebBrowser.openBrowserAsync(
          "https://play.google.com/store/account/subscriptions"
        );
      } catch (error) {
        Alert.alert(
          "Manage Subscription",
          "To manage your subscription, go to Play Store > Menu > Subscriptions on your device."
        );
      }
    } else {
      Alert.alert(
        "Manage Subscription",
        "Please manage your subscription through the App Store or Play Store on your mobile device."
      );
    }
  };

  const handleViewBillingHistory = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (Platform.OS === "ios") {
      try {
        await WebBrowser.openBrowserAsync("https://reportaproblem.apple.com/");
      } catch (error) {
        Alert.alert(
          "Billing History",
          "To view your billing history, go to Settings > Your Name > Media & Purchases > View Account on your device."
        );
      }
    } else if (Platform.OS === "android") {
      try {
        await WebBrowser.openBrowserAsync(
          "https://play.google.com/store/account/orderhistory"
        );
      } catch (error) {
        Alert.alert(
          "Billing History",
          "To view your billing history, go to Play Store > Menu > Account > Order history on your device."
        );
      }
    } else {
      Alert.alert(
        "Billing History",
        "Please view your billing history through the App Store or Play Store on your mobile device."
      );
    }
  };

  const handleContactSupport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Help");
  };

  const handleRestorePurchases = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRestoring(true);

    try {
      const success = await restorePurchases();
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Success", "Your purchase has been restored!");
      } else {
        Alert.alert(
          "No Purchases Found",
          "We couldn't find any previous purchases to restore. If you believe this is an error, please contact support."
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Unable to restore purchases. Please try again later."
      );
    } finally {
      setIsRestoring(false);
    }
  };

  const getSubscriptionStatus = () => {
    if (!isProUser) {
      return "Free Plan";
    }

    const entitlement = customerInfo?.entitlements.active["CamNote Pro"];
    if (entitlement) {
      const expirationDate = entitlement.expirationDate
        ? new Date(entitlement.expirationDate)
        : null;

      if (expirationDate) {
        const formattedDate = expirationDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        return `Pro - Renews ${formattedDate}`;
      }
      return "CamNote Pro";
    }

    return "CamNote Pro";
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isProUser ? theme.accentDim : theme.backgroundTertiary,
                  borderColor: isProUser ? theme.accent : theme.glassBorder,
                },
              ]}
            >
              <Feather
                name={isProUser ? "star" : "user"}
                size={16}
                color={isProUser ? theme.accent : theme.textSecondary}
              />
            </View>
            <View style={styles.statusText}>
              <ThemedText type="h3">
                {isProUser ? "CamNote Pro" : "Free Plan"}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {getSubscriptionStatus()}
              </ThemedText>
            </View>
          </View>

          {!isProUser ? (
            <Pressable
              style={[styles.upgradeButton, { backgroundColor: theme.accent }]}
              onPress={() => navigation.navigate("Paywall")}
            >
              <ThemedText type="body" style={{ color: theme.buttonText, fontWeight: "600" }}>
                Upgrade to Pro
              </ThemedText>
            </Pressable>
          ) : null}
        </Card>

        <View style={styles.section}>
          <ThemedText
            type="small"
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            MANAGE SUBSCRIPTION
          </ThemedText>

          <ManageOption
            icon="credit-card"
            title="Manage Subscription"
            subtitle="Change or cancel your plan"
            onPress={handleManageSubscription}
          />

          <ManageOption
            icon="file-text"
            title="Billing History"
            subtitle="View past transactions"
            onPress={handleViewBillingHistory}
          />

          <ManageOption
            icon="refresh-cw"
            title="Refresh Status"
            subtitle="Sync your subscription"
            onPress={handleRestorePurchases}
          />
        </View>

        <View style={styles.section}>
          <ThemedText
            type="small"
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            SUPPORT
          </ThemedText>

          <ManageOption
            icon="help-circle"
            title="Help & Support"
            subtitle="FAQs and contact info"
            onPress={handleContactSupport}
          />
        </View>

        {customerInfo?.originalAppUserId ? (
          <View style={styles.userIdContainer}>
            <ThemedText
              type="caption"
              style={[styles.userId, { color: theme.textSecondary }]}
            >
              User ID: {customerInfo.originalAppUserId.slice(0, 8)}...
            </ThemedText>
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
  statusCard: {
    padding: Spacing.xl,
    marginBottom: Spacing["2xl"],
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    marginRight: Spacing.lg,
  },
  statusText: {
    flex: 1,
  },
  upgradeButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
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
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  userIdContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  userId: {
    fontFamily: "monospace",
  },
});
