import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  originalPrice?: string;
  savings?: string;
  selected: boolean;
  onPress: () => void;
  trialEnabled?: boolean;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PricingCard({
  title,
  price,
  period,
  originalPrice,
  savings,
  selected,
  onPress,
  trialEnabled = false,
}: PricingCardProps) {
  const theme = Colors.dark;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        {
          backgroundColor: selected ? theme.accentDim : theme.backgroundSecondary,
          borderColor: selected ? theme.accent : theme.glassBorder,
        },
        animatedStyle,
      ]}
    >
      {savings ? (
        <View style={[styles.savingsBadge, { backgroundColor: theme.accent }]}>
          <ThemedText type="caption" style={styles.savingsText}>
            {savings}
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View
            style={[
              styles.radioOuter,
              {
                borderColor: selected ? theme.accent : theme.tabIconDefault,
              },
            ]}
          >
            {selected ? (
              <View
                style={[styles.radioInner, { backgroundColor: theme.accent }]}
              />
            ) : null}
          </View>
          <View style={styles.textContainer}>
            <ThemedText type="h4" style={styles.title}>
              {title}
            </ThemedText>
            {originalPrice ? (
              <ThemedText
                type="caption"
                style={[styles.originalPrice, { color: theme.textSecondary }]}
              >
                {originalPrice}
              </ThemedText>
            ) : null}
            {trialEnabled ? (
              <ThemedText
                type="caption"
                style={[styles.trialText, { color: theme.accent }]}
              >
                7-day free trial
              </ThemedText>
            ) : null}
          </View>
        </View>

        <View style={styles.priceContainer}>
          <ThemedText type="h3" style={styles.price}>
            {price}
          </ThemedText>
          <ThemedText
            type="caption"
            style={[styles.period, { color: theme.textSecondary }]}
          >
            {period}
          </ThemedText>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  savingsBadge: {
    position: "absolute",
    top: -10,
    right: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  savingsText: {
    color: "#0A0C10",
    fontWeight: "700",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  textContainer: {
    gap: 2,
  },
  title: {
    marginBottom: 0,
  },
  originalPrice: {
    textDecorationLine: "line-through",
  },
  trialText: {
    fontWeight: "600",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    marginBottom: 0,
  },
  period: {},
});
