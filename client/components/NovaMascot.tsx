import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { Colors, Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";

interface NovaMascotProps {
  message?: string;
  size?: "small" | "medium" | "large";
  showMessage?: boolean;
}

export function NovaMascot({
  message = "Let's get started.",
  size = "medium",
  showMessage = true,
}: NovaMascotProps) {
  const theme = Colors.dark;
  const breathe = useSharedValue(0);
  const glow = useSharedValue(0);

  const dimensions = {
    small: 48,
    medium: 80,
    large: 120,
  };

  const orbSize = dimensions[size];

  useEffect(() => {
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const orbAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(breathe.value, [0, 1], [1, 1.05]);
    const translateY = interpolate(breathe.value, [0, 1], [0, -4]);

    return {
      transform: [{ scale }, { translateY }],
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(glow.value, [0, 1], [0.3, 0.6]);

    return {
      opacity,
    };
  });

  const innerGlowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(glow.value, [0, 1], [0.5, 0.8]);

    return {
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.orbContainer, orbAnimatedStyle]}>
        <Animated.View
          style={[
            styles.outerGlow,
            glowAnimatedStyle,
            {
              width: orbSize * 2,
              height: orbSize * 2,
              borderRadius: orbSize,
              backgroundColor: theme.accent,
            },
          ]}
        />
        <View
          style={[
            styles.orb,
            {
              width: orbSize,
              height: orbSize,
              borderRadius: orbSize / 2,
              backgroundColor: theme.backgroundSecondary,
              borderColor: theme.accent,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.innerGlow,
              innerGlowStyle,
              {
                width: orbSize * 0.7,
                height: orbSize * 0.7,
                borderRadius: (orbSize * 0.7) / 2,
                backgroundColor: theme.accent,
              },
            ]}
          />
          <View style={styles.eyesContainer}>
            <View
              style={[
                styles.eye,
                {
                  width: orbSize * 0.12,
                  height: orbSize * 0.18,
                  backgroundColor: theme.text,
                },
              ]}
            />
            <View style={{ width: orbSize * 0.15 }} />
            <View
              style={[
                styles.eye,
                {
                  width: orbSize * 0.12,
                  height: orbSize * 0.18,
                  backgroundColor: theme.text,
                },
              ]}
            />
          </View>
        </View>
      </Animated.View>
      {showMessage ? (
        <View style={styles.messageContainer}>
          <ThemedText
            type="small"
            style={[styles.message, { color: theme.textSecondary }]}
          >
            {message}
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  orbContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  outerGlow: {
    position: "absolute",
  },
  orb: {
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  innerGlow: {
    position: "absolute",
  },
  eyesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  eye: {
    borderRadius: 4,
  },
  messageContainer: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  message: {
    textAlign: "center",
  },
});
