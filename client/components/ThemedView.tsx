import { View, type ViewProps } from "react-native";

import { Colors } from "@/constants/theme";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const theme = Colors.dark;

  const backgroundColor = darkColor ? darkColor : theme.backgroundRoot;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
