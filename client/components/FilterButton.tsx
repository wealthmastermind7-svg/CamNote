import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";

interface FilterButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  previewColor?: string;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FilterButton({
  label,
  selected,
  onPress,
  previewColor,
}: FilterButtonProps) {
  const theme = Colors.dark;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, springConfig);
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
        styles.button,
        {
          backgroundColor: selected ? theme.accentDim : theme.backgroundSecondary,
          borderColor: selected ? theme.accent : theme.glassBorder,
        },
        animatedStyle,
      ]}
    >
      {previewColor ? (
        <View
          style={[
            styles.colorPreview,
            { backgroundColor: previewColor },
          ]}
        />
      ) : null}
      <ThemedText
        type="small"
        style={[
          styles.label,
          { color: selected ? theme.accent : theme.text },
        ]}
      >
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  colorPreview: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  label: {
    fontWeight: "600",
  },
});
