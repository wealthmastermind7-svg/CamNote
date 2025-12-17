import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { NovaMascot } from "@/components/NovaMascot";
import { Button } from "@/components/Button";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const theme = Colors.dark;

  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const captureScale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);

  const captureAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: captureScale.value }],
  }));

  const flashAnimatedStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const handleGalleryPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      navigation.navigate("Edit", {
        documentId: `doc-${Date.now()}`,
        imageUri: result.assets[0].uri,
      });
    }
  };

  const handleFlashToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlashEnabled(!flashEnabled);
  };

  const handleCapture = async () => {
    if (isCapturing || !cameraRef.current) return;

    setIsCapturing(true);

    captureScale.value = withSequence(
      withSpring(0.9, { damping: 15 }),
      withSpring(1, { damping: 15 })
    );

    flashOpacity.value = withSequence(
      withTiming(0.8, { duration: 50 }),
      withTiming(0, { duration: 200 })
    );

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const photo = await cameraRef.current.takePictureAsync();
      setTimeout(() => {
        setIsCapturing(false);
        navigation.navigate("Edit", { 
          documentId: `doc-${Date.now()}`,
          imageUri: photo.uri,
        });
      }, 300);
    } catch (error) {
      setIsCapturing(false);
    }
  };

  if (!permission) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.backgroundRoot,
            paddingTop: insets.top,
            paddingBottom: tabBarHeight,
          },
        ]}
      >
        <NovaMascot message="Loading camera..." size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    if (permission.status === "denied" && !permission.canAskAgain) {
      return (
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.backgroundRoot,
              paddingTop: insets.top,
              paddingBottom: tabBarHeight,
            },
          ]}
        >
          <NovaMascot message="Camera access is needed to scan documents." size="large" />
          <View style={styles.permissionContent}>
            <ThemedText type="h2" style={styles.permissionTitle}>
              Camera Permission Required
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.permissionText, { color: theme.textSecondary }]}
            >
              Please enable camera access in your device settings to scan documents.
            </ThemedText>
            {Platform.OS !== "web" ? (
              <Button
                onPress={async () => {
                  try {
                    await Linking.openSettings();
                  } catch (error) {
                  }
                }}
                style={styles.permissionButton}
              >
                Open Settings
              </Button>
            ) : null}
          </View>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.backgroundRoot,
            paddingTop: insets.top,
            paddingBottom: tabBarHeight,
          },
        ]}
      >
        <NovaMascot message="I need camera access to scan your documents." size="large" />
        <View style={styles.permissionContent}>
          <ThemedText type="h2" style={styles.permissionTitle}>
            Enable Camera
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.permissionText, { color: theme.textSecondary }]}
          >
            CamNote uses your camera to scan and digitize documents instantly.
          </ThemedText>
          <Button onPress={requestPermission} style={styles.permissionButton}>
            Enable Camera
          </Button>
        </View>
      </View>
    );
  }

  if (Platform.OS === "web") {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.backgroundRoot,
            paddingTop: insets.top,
            paddingBottom: tabBarHeight,
          },
        ]}
      >
        <NovaMascot message="Use Expo Go for the best scanning experience." size="large" />
        <View style={styles.permissionContent}>
          <ThemedText type="h2" style={styles.permissionTitle}>
            Best on Mobile
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.permissionText, { color: theme.textSecondary }]}
          >
            For the full document scanning experience with auto edge detection, please run CamNote in Expo Go on your mobile device.
          </ThemedText>
          <Button
            onPress={() => navigation.navigate("Edit", { documentId: `demo-${Date.now()}` })}
            style={styles.permissionButton}
          >
            Try Demo Mode
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.cameraContainer,
        {
          backgroundColor: theme.backgroundRoot,
        },
      ]}
    >
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        flash={flashEnabled ? "on" : "off"}
      />

      <Animated.View
        style={[
          styles.flash,
          { backgroundColor: "#FFFFFF" },
          flashAnimatedStyle,
        ]}
        pointerEvents="none"
      />

      <View
        style={[
          styles.overlay,
          {
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing["3xl"],
          },
        ]}
      >
        <View style={styles.topBar}>
          <NovaMascot message="Position document in frame." size="small" />
        </View>

        <View style={styles.frameGuide}>
          <View style={[styles.corner, styles.topLeft, { borderColor: theme.accent }]} />
          <View style={[styles.corner, styles.topRight, { borderColor: theme.accent }]} />
          <View style={[styles.corner, styles.bottomLeft, { borderColor: theme.accent }]} />
          <View style={[styles.corner, styles.bottomRight, { borderColor: theme.accent }]} />
        </View>

        <View style={styles.bottomControls}>
          <Pressable
            style={styles.galleryButton}
            onPress={handleGalleryPress}
          >
            <View
              style={[
                styles.galleryIcon,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Feather name="image" size={24} color={theme.text} />
            </View>
          </Pressable>

          <Animated.View style={captureAnimatedStyle}>
            <Pressable
              onPress={handleCapture}
              disabled={isCapturing}
              style={[
                styles.captureButton,
                { borderColor: theme.text },
              ]}
            >
              <View
                style={[
                  styles.captureInner,
                  { backgroundColor: theme.text },
                ]}
              />
            </Pressable>
          </Animated.View>

          <Pressable
            style={styles.flashButton}
            onPress={handleFlashToggle}
          >
            <View
              style={[
                styles.flashIcon,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Feather
                name={flashEnabled ? "zap" : "zap-off"}
                size={24}
                color={flashEnabled ? theme.accent : theme.text}
              />
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  cameraContainer: {
    flex: 1,
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },
  topBar: {
    alignItems: "center",
  },
  frameGuide: {
    width: "85%",
    aspectRatio: 0.75,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: BorderRadius.md,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: BorderRadius.md,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: BorderRadius.md,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: BorderRadius.md,
  },
  bottomControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: Spacing["4xl"],
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  galleryButton: {
    flex: 1,
    alignItems: "flex-start",
  },
  galleryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  flashButton: {
    flex: 1,
    alignItems: "flex-end",
  },
  flashIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionContent: {
    alignItems: "center",
    marginTop: Spacing["3xl"],
    paddingHorizontal: Spacing.xl,
  },
  permissionTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  permissionText: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  permissionButton: {
    minWidth: 200,
  },
});
