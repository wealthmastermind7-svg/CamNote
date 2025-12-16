import React from "react";
import { StyleSheet, Pressable, ViewStyle, Platform, View } from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius, GlassStyles } from "@/constants/theme";

interface CardProps {
  elevation?: number;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  glass?: boolean;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const getBackgroundColorForElevation = (
  elevation: number,
  theme: any,
): string => {
  switch (elevation) {
    case 1:
      return theme.backgroundDefault;
    case 2:
      return theme.backgroundSecondary;
    case 3:
      return theme.backgroundTertiary;
    default:
      return theme.backgroundRoot;
  }
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({
  elevation = 1,
  title,
  description,
  children,
  onPress,
  style,
  glass = false,
}: CardProps) {
  const theme = Colors.dark;
  const scale = useSharedValue(1);

  const cardBackgroundColor = glass
    ? Platform.OS === "ios"
      ? "transparent"
      : theme.glass
    : getBackgroundColorForElevation(elevation, theme);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const content = (
    <>
      {glass && Platform.OS === "ios" ? (
        <BlurView
          intensity={GlassStyles.blurIntensity}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={styles.innerContent}>
        {title ? (
          <ThemedText type="h4" style={styles.cardTitle}>
            {title}
          </ThemedText>
        ) : null}
        {description ? (
          <ThemedText type="small" style={[styles.cardDescription, { color: theme.textSecondary }]}>
            {description}
          </ThemedText>
        ) : null}
        {children}
      </View>
    </>
  );

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        {
          backgroundColor: cardBackgroundColor,
          borderColor: glass ? theme.glassBorder : "transparent",
          borderWidth: glass ? 1 : 0,
        },
        animatedStyle,
        style,
      ]}
    >
      {content}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius["2xl"],
    overflow: "hidden",
  },
  innerContent: {
    padding: Spacing.xl,
  },
  cardTitle: {
    marginBottom: Spacing.sm,
  },
  cardDescription: {
    opacity: 0.7,
  },
});
