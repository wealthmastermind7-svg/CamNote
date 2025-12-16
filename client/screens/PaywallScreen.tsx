import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { NovaMascot } from "@/components/NovaMascot";
import { PricingCard } from "@/components/PricingCard";
import { FeatureItem } from "@/components/FeatureItem";
import { Button } from "@/components/Button";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const theme = Colors.dark;

  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual");
  const [trialEnabled, setTrialEnabled] = useState(false);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handlePlanSelect = (plan: "monthly" | "annual") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlan(plan);
  };

  const handleTrialToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTrialEnabled(value);
  };

  const handleContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  const handleRestore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.closeButton} onPress={handleClose}>
          <Feather name="x" size={24} color={theme.textSecondary} />
        </Pressable>

        <View style={styles.header}>
          <NovaMascot message="Unlock the full experience." size="large" showMessage={false} />

          <ThemedText type="h1" style={styles.title}>
            Unlock Pro
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.subtitle, { color: theme.textSecondary }]}
          >
            Get unlimited access to all premium features
          </ThemedText>
        </View>

        <View style={styles.features}>
          <FeatureItem text="Unlimited document scans" />
          <FeatureItem text="OCR text extraction" />
          <FeatureItem text="Export to Word and Excel" />
          <FeatureItem text="Password-protected PDFs" />
          <FeatureItem text="Digital signature tool" />
          <FeatureItem text="Priority support" />
        </View>

        <View
          style={[
            styles.trialToggle,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <ThemedText type="body" style={styles.trialText}>
            Not Sure? Enable Free Trial
          </ThemedText>
          <Switch
            value={trialEnabled}
            onValueChange={handleTrialToggle}
            trackColor={{ false: theme.glassBorder, true: theme.accentDim }}
            thumbColor={trialEnabled ? theme.accent : theme.textSecondary}
            ios_backgroundColor={theme.glassBorder}
          />
        </View>

        <View style={styles.plans}>
          <PricingCard
            title="Yearly Plan"
            price="$39.99"
            period="/year"
            originalPrice="$119.88"
            savings="SAVE 67%"
            selected={selectedPlan === "annual"}
            onPress={() => handlePlanSelect("annual")}
            trialEnabled={trialEnabled}
          />

          <PricingCard
            title="Monthly Plan"
            price="$9.99"
            period="/month"
            selected={selectedPlan === "monthly"}
            onPress={() => handlePlanSelect("monthly")}
            trialEnabled={trialEnabled}
          />
        </View>

        <Button onPress={handleContinue} style={styles.continueButton}>
          {trialEnabled ? "Start 7-Day Free Trial" : "Continue"}
        </Button>

        <View style={styles.footer}>
          <Pressable onPress={handleRestore}>
            <ThemedText
              type="small"
              style={[styles.footerLink, { color: theme.textSecondary }]}
            >
              Restore Purchase
            </ThemedText>
          </Pressable>
          <ThemedText
            type="caption"
            style={[styles.footerDot, { color: theme.glassBorder }]}
          >
            {" "}
            |{" "}
          </ThemedText>
          <Pressable>
            <ThemedText
              type="small"
              style={[styles.footerLink, { color: theme.textSecondary }]}
            >
              Terms of Use
            </ThemedText>
          </Pressable>
          <ThemedText
            type="caption"
            style={[styles.footerDot, { color: theme.glassBorder }]}
          >
            {" "}
            |{" "}
          </ThemedText>
          <Pressable>
            <ThemedText
              type="small"
              style={[styles.footerLink, { color: theme.textSecondary }]}
            >
              Privacy Policy
            </ThemedText>
          </Pressable>
        </View>

        <ThemedText
          type="caption"
          style={[styles.legalText, { color: theme.textSecondary }]}
        >
          {trialEnabled
            ? "After 7-day trial, auto-renews at the selected plan rate. Cancel anytime."
            : "Payment charged at confirmation. Auto-renews unless cancelled 24hrs before period ends."}
        </ThemedText>
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
  closeButton: {
    alignSelf: "flex-start",
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  title: {
    marginTop: Spacing.xl,
    textAlign: "center",
  },
  subtitle: {
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  features: {
    marginBottom: Spacing.xl,
  },
  trialToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  trialText: {
    fontWeight: "500",
  },
  plans: {
    marginBottom: Spacing.xl,
  },
  continueButton: {
    marginBottom: Spacing.xl,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: Spacing.lg,
  },
  footerLink: {
    textDecorationLine: "underline",
  },
  footerDot: {},
  legalText: {
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
  },
});
