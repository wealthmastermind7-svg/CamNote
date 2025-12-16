import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#ECEDEE",
    textSecondary: "rgba(236, 237, 238, 0.7)",
    buttonText: "#FFFFFF",
    tabIconDefault: "rgba(255, 255, 255, 0.5)",
    tabIconSelected: "#22C55E",
    link: "#22C55E",
    backgroundRoot: "#0A0C10",
    backgroundDefault: "#12141A",
    backgroundSecondary: "#1A1D24",
    backgroundTertiary: "#22262E",
    accent: "#22C55E",
    accentDim: "rgba(34, 197, 94, 0.2)",
    glass: "rgba(255, 255, 255, 0.18)",
    glassBorder: "rgba(255, 255, 255, 0.08)",
    error: "#EF4444",
    warning: "#F59E0B",
    success: "#22C55E",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "rgba(236, 237, 238, 0.7)",
    buttonText: "#FFFFFF",
    tabIconDefault: "rgba(255, 255, 255, 0.5)",
    tabIconSelected: "#22C55E",
    link: "#22C55E",
    backgroundRoot: "#0A0C10",
    backgroundDefault: "#12141A",
    backgroundSecondary: "#1A1D24",
    backgroundTertiary: "#22262E",
    accent: "#22C55E",
    accentDim: "rgba(34, 197, 94, 0.2)",
    glass: "rgba(255, 255, 255, 0.18)",
    glassBorder: "rgba(255, 255, 255, 0.08)",
    error: "#EF4444",
    warning: "#F59E0B",
    success: "#22C55E",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
  "7xl": 80,
  "8xl": 96,
  inputHeight: 48,
  buttonHeight: 56,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  display: {
    fontSize: 96,
    fontWeight: "700" as const,
    letterSpacing: -2,
  },
  displayMedium: {
    fontSize: 64,
    fontWeight: "700" as const,
    letterSpacing: -1.5,
  },
  h1: {
    fontSize: 40,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
};

export const GlassStyles = {
  blurIntensity: 35,
  opacity: 0.18,
  borderOpacity: 0.08,
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
