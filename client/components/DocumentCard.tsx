import React from "react";
import { StyleSheet, View, Image, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { Pressable } from "react-native";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";

interface DocumentCardProps {
  title: string;
  pageCount: number;
  date: string;
  thumbnail?: string;
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

export function DocumentCard({
  title,
  pageCount,
  date,
  thumbnail,
  onPress,
}: DocumentCardProps) {
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
            styles.thumbnailContainer,
            { backgroundColor: theme.backgroundTertiary },
          ]}
        >
          {thumbnail ? (
            <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
          ) : (
            <Feather name="file-text" size={32} color={theme.textSecondary} />
          )}
        </View>

        <View style={styles.textContainer}>
          <ThemedText type="h4" style={styles.title} numberOfLines={1}>
            {title}
          </ThemedText>
          <View style={styles.metaContainer}>
            <ThemedText
              type="caption"
              style={[styles.meta, { color: theme.textSecondary }]}
            >
              {pageCount} {pageCount === 1 ? "page" : "pages"}
            </ThemedText>
            <View
              style={[styles.dot, { backgroundColor: theme.textSecondary }]}
            />
            <ThemedText
              type="caption"
              style={[styles.meta, { color: theme.textSecondary }]}
            >
              {date}
            </ThemedText>
          </View>
        </View>

        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
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
  thumbnailContainer: {
    width: 56,
    height: 72,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  meta: {},
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: Spacing.sm,
  },
});
