import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { PurchasesPackage } from "react-native-purchases";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { NovaMascot } from "@/components/NovaMascot";
import { PricingCard } from "@/components/PricingCard";
import { FeatureItem } from "@/components/FeatureItem";
import { Button } from "@/components/Button";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useRevenueCat } from "@/lib/revenuecat";
import { REVENUECAT, LEGAL_URLS } from "@/constants/config";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const theme = Colors.dark;

  const {
    currentOffering,
    isLoading,
    purchasePackage,
    restorePurchases,
    isProUser,
  } = useRevenueCat();

  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual");
  const [trialEnabled, setTrialEnabled] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const monthlyPackage = currentOffering?.monthly;
  const annualPackage = currentOffering?.annual;

  useEffect(() => {
    if (isProUser) {
      navigation.goBack();
    }
  }, [isProUser, navigation]);

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

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const selectedPackage =
      selectedPlan === "annual" ? annualPackage : monthlyPackage;

    if (!selectedPackage) {
      if (Platform.OS === "web") {
        Alert.alert(
          "Not Available",
          "In-app purchases are only available in the mobile app. Please use Expo Go on your device to subscribe."
        );
      } else {
        Alert.alert("Error", "Selected plan is not available. Please try again.");
      }
      return;
    }

    setIsPurchasing(true);
    try {
      const success = await purchasePackage(selectedPackage);
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.goBack();
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRestoring(true);

    try {
      const success = await restorePurchases();
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Success", "Your purchase has been restored!");
        navigation.goBack();
      } else {
        Alert.alert(
          "No Purchases Found",
          "We couldn't find any previous purchases to restore."
        );
      }
    } finally {
      setIsRestoring(false);
    }
  };

  const getMonthlyPrice = () => {
    if (monthlyPackage?.product.priceString) {
      return monthlyPackage.product.priceString;
    }
    // Fallback to default price if RevenueCat data is unavailable
    return REVENUECAT.FALLBACK_MONTHLY_PRICE;
  };

  const getAnnualPrice = () => {
    if (annualPackage?.product.priceString) {
      return annualPackage.product.priceString;
    }
    // Fallback to default price if RevenueCat data is unavailable
    return REVENUECAT.FALLBACK_ANNUAL_PRICE;
  };

  const getAnnualSavings = () => {
    if (monthlyPackage?.product.price && annualPackage?.product.price) {
      const monthlyTotal = monthlyPackage.product.price * 12;
      const annualPrice = annualPackage.product.price;
      const savings = Math.round(((monthlyTotal - annualPrice) / monthlyTotal) * 100);
      return `SAVE ${savings}%`;
    }
    // Fallback to default savings if RevenueCat data is unavailable
    return "SAVE 67%";
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <ThemedText type="body" style={{ marginTop: Spacing.lg, color: theme.textSecondary }}>
          Loading plans...
        </ThemedText>
      </View>
    );
  }

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
            price={getAnnualPrice()}
            period="/year"
            originalPrice={monthlyPackage ? `${monthlyPackage.product.priceString} x 12` : REVENUECAT.FALLBACK_ANNUAL_MONTHLY_CALC}
            savings={getAnnualSavings()}
            selected={selectedPlan === "annual"}
            onPress={() => handlePlanSelect("annual")}
            trialEnabled={trialEnabled}
          />

          <PricingCard
            title="Monthly Plan"
            price={getMonthlyPrice()}
            period="/month"
            selected={selectedPlan === "monthly"}
            onPress={() => handlePlanSelect("monthly")}
            trialEnabled={trialEnabled}
          />
        </View>

        <Button
          onPress={handleContinue}
          style={styles.continueButton}
          disabled={isPurchasing || isRestoring}
        >
          {isPurchasing ? (
            <ActivityIndicator size="small" color={theme.buttonText} />
          ) : trialEnabled ? (
            `Start ${REVENUECAT.FREE_TRIAL_DAYS}-Day Free Trial`
          ) : (
            "Continue"
          )}
        </Button>

        <View style={styles.footer}>
          <Pressable onPress={handleRestore} disabled={isRestoring}>
            <ThemedText
              type="small"
              style={[styles.footerLink, { color: theme.textSecondary }]}
            >
              {isRestoring ? "Restoring..." : "Restore Purchase"}
            </ThemedText>
          </Pressable>
          <ThemedText
            type="caption"
            style={[styles.footerDot, { color: theme.glassBorder }]}
          >
            {" "}
            |{" "}
          </ThemedText>
          <Pressable onPress={() => Linking.openURL(LEGAL_URLS.TERMS)}>
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
          <Pressable onPress={() => Linking.openURL(LEGAL_URLS.PRIVACY)}>
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
            ? `After ${REVENUECAT.FREE_TRIAL_DAYS}-day trial, auto-renews at the selected plan rate. Cancel anytime.`
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
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
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
