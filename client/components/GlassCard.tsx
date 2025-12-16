import React from "react";
import { StyleSheet, Pressable, ViewStyle, Platform, View } from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { Colors, Spacing, BorderRadius, GlassStyles } from "@/constants/theme";

interface GlassCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  blurIntensity?: number;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GlassCard({
  children,
  onPress,
  style,
  disabled = false,
  blurIntensity = GlassStyles.blurIntensity,
}: GlassCardProps) {
  const theme = Colors.dark;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(0.98, springConfig);
    }
  };

  const handlePressOut = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(1, springConfig);
    }
  };

  const content = (
    <>
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={blurIntensity}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={styles.innerContent}>{children}</View>
    </>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={disabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.card,
          {
            backgroundColor: Platform.OS === "ios" ? "transparent" : theme.glass,
            borderColor: theme.glassBorder,
            opacity: disabled ? 0.6 : 1,
          },
          animatedStyle,
          style,
        ]}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: Platform.OS === "ios" ? "transparent" : theme.glass,
          borderColor: theme.glassBorder,
        },
        style,
      ]}
    >
      {content}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  innerContent: {
    padding: Spacing.xl,
  },
});
