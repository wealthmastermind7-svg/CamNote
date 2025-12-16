import React from "react";
import { StyleSheet, View, Platform, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";

interface ToolItemProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
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

export function ToolItem({
  icon,
  title,
  subtitle,
  locked = false,
  onPress,
}: ToolItemProps) {
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
        styles.item,
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
            size={22}
            color={locked ? theme.textSecondary : theme.accent}
          />
        </View>

        <View style={styles.textContainer}>
          <ThemedText
            type="body"
            style={[
              styles.title,
              { color: locked ? theme.textSecondary : theme.text },
            ]}
          >
            {title}
          </ThemedText>
          {subtitle ? (
            <ThemedText
              type="caption"
              style={[styles.subtitle, { color: theme.textSecondary }]}
            >
              {subtitle}
            </ThemedText>
          ) : null}
        </View>

        {locked ? (
          <View
            style={[styles.proBadge, { backgroundColor: theme.glassBorder }]}
          >
            <ThemedText
              type="caption"
              style={[styles.proText, { color: theme.textSecondary }]}
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
  item: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "500",
  },
  subtitle: {
    marginTop: 2,
  },
  proBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  proText: {
    fontWeight: "700",
  },
});
