import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform } from "react-native";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";

interface ExportOptionProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  locked?: boolean;
  onPress: () => void;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ExportOption({
  icon,
  title,
  subtitle,
  locked = false,
  onPress,
}: ExportOptionProps) {
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
          backgroundColor: Platform.OS === "ios" ? "transparent" : theme.glass,
          borderColor: theme.glassBorder,
        },
        animatedStyle,
      ]}
    >
      {Platform.OS === "ios" ? (
        <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
      ) : null}

      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: locked ? theme.glassBorder : theme.accentDim,
            },
          ]}
        >
          <Feather
            name={icon}
            size={24}
            color={locked ? theme.textSecondary : theme.accent}
          />
        </View>

        <View style={styles.textContainer}>
          <ThemedText
            type="h4"
            style={[
              styles.title,
              { color: locked ? theme.textSecondary : theme.text },
            ]}
          >
            {title}
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.subtitle, { color: theme.textSecondary }]}
          >
            {subtitle}
          </ThemedText>
        </View>

        {locked ? (
          <View
            style={[styles.lockBadge, { backgroundColor: theme.glassBorder }]}
          >
            <Feather name="lock" size={16} color={theme.textSecondary} />
            <ThemedText
              type="caption"
              style={[styles.lockText, { color: theme.textSecondary }]}
            >
              PRO
            </ThemedText>
          </View>
        ) : (
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 2,
  },
  subtitle: {},
  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  lockText: {
    fontWeight: "600",
  },
});
