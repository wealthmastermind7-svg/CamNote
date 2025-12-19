import React, { useState, useRef } from "react";
import { View, StyleSheet, Pressable, Platform, Image, Dimensions, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { File } from "expo-file-system";
import * as FileSystemLegacy from "expo-file-system/legacy";
import { Feather } from "@expo/vector-icons";
import { GestureHandlerRootView, GestureDetector, Gesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { captureRef } from "react-native-view-shot";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { NovaMascot } from "@/components/NovaMascot";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getApiUrl } from "@/lib/query-client";

type SignatureRouteProp = RouteProp<RootStackParamList, "Signature">;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function SignatureScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const route = useRoute<SignatureRouteProp>();
  const theme = Colors.dark;
  const signatureCanvasRef = useRef<View>(null);

  const [documentUri, setDocumentUri] = useState<string | null>(route.params?.imageUri || null);
  const [paths, setPaths] = useState<{ x: number; y: number }[][]>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [isSigning, setIsSigning] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [signedImageUri, setSignedImageUri] = useState<string | null>(null);
  const [signatureX, setSignatureX] = useState(50);
  const [signatureY, setSignatureY] = useState(80);

  const pickDocument = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setDocumentUri(result.assets[0].uri);
      setSignedImageUri(null);
    }
  };

  const addPoint = (x: number, y: number) => {
    setCurrentPath(prev => [...prev, { x, y }]);
  };

  const finishPath = () => {
    if (currentPath.length > 0) {
      setPaths(prev => [...prev, currentPath]);
      setCurrentPath([]);
    }
  };

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      runOnJS(addPoint)(e.x, e.y);
    })
    .onUpdate((e) => {
      runOnJS(addPoint)(e.x, e.y);
    })
    .onEnd(() => {
      runOnJS(finishPath)();
    });

  const clearSignature = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPaths([]);
    setCurrentPath([]);
  };

  const startSigning = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSigning(true);
    setPaths([]);
  };

  const applySignature = async () => {
    if (!documentUri || paths.length === 0) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsApplying(true);

    try {
      let signatureBase64: string;
      
      if (Platform.OS === "web") {
        const canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "rgba(255,255,255,0)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          
          paths.forEach(path => {
            if (path.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) {
              ctx.lineTo(path[i].x, path[i].y);
            }
            ctx.stroke();
          });
        }
        const dataUrl = canvas.toDataURL("image/png");
        signatureBase64 = dataUrl.split(",")[1];
      } else {
        if (signatureCanvasRef.current) {
          const uri = await captureRef(signatureCanvasRef, {
            format: "png",
            quality: 1,
          });
          signatureBase64 = await FileSystemLegacy.readAsStringAsync(uri, {
            encoding: FileSystemLegacy.EncodingType.Base64,
          });
        } else {
          throw new Error("Cannot capture signature");
        }
      }

      const formData = new FormData();
      
      if (Platform.OS === "web") {
        const docResponse = await fetch(documentUri);
        const docBlob = await docResponse.blob();
        formData.append("document", docBlob, "document.jpg");
        
        const signatureBytes = atob(signatureBase64);
        const signatureArray = new Uint8Array(signatureBytes.length);
        for (let i = 0; i < signatureBytes.length; i++) {
          signatureArray[i] = signatureBytes.charCodeAt(i);
        }
        const signatureBlob = new Blob([signatureArray], { type: "image/png" });
        formData.append("signature", signatureBlob, "signature.png");
      } else {
        const docBase64 = await FileSystemLegacy.readAsStringAsync(documentUri, {
          encoding: FileSystemLegacy.EncodingType.Base64,
        });
        formData.append("document", {
          uri: documentUri,
          type: "image/jpeg",
          name: "document.jpg",
        } as any);
        
        const sigUri = FileSystemLegacy.cacheDirectory + `signature_temp_${Date.now()}.png`;
        await FileSystemLegacy.writeAsStringAsync(sigUri, signatureBase64, {
          encoding: FileSystemLegacy.EncodingType.Base64,
        });
        formData.append("signature", {
          uri: sigUri,
          type: "image/png",
          name: "signature.png",
        } as any);
      }
      
      const signatureCanvasWidth = SCREEN_WIDTH - Spacing.lg * 2;
      const signatureCanvasHeight = 200;
      formData.append("x", String(signatureX));
      formData.append("y", String(signatureY));
      formData.append("width", String(Math.round(signatureCanvasWidth)));
      formData.append("height", String(signatureCanvasHeight));

      const apiUrl = getApiUrl();
      const response = await fetch(new URL("/api/signature", apiUrl).toString(), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to apply signature");
      }

      const signedUri = FileSystemLegacy.cacheDirectory + `signed_${Date.now()}.png`;
      
      if (Platform.OS === "web") {
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setSignedImageUri(objectUrl);
      } else {
        const arrayBuffer = await response.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let base64 = "";
        for (let i = 0; i < bytes.length; i += 3) {
          const a = bytes[i];
          const b = bytes[i + 1] || 0;
          const c = bytes[i + 2] || 0;
          
          base64 += base64Chars[a >> 2];
          base64 += base64Chars[((a & 3) << 4) | (b >> 4)];
          base64 += i + 1 < bytes.length ? base64Chars[((b & 15) << 2) | (c >> 6)] : "=";
          base64 += i + 2 < bytes.length ? base64Chars[c & 63] : "=";
        }
        
        await FileSystemLegacy.writeAsStringAsync(signedUri, base64, {
          encoding: FileSystemLegacy.EncodingType.Base64,
        });
        setSignedImageUri(signedUri);
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Signature applied successfully!", [
        { text: "View Result", onPress: () => setIsSigning(false) },
        { text: "Done", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error("Signature error:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to apply signature. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  const canvasWidth = SCREEN_WIDTH - Spacing.lg * 2;
  const canvasHeight = 200;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View
          style={[
            styles.content,
            {
              paddingTop: headerHeight + Spacing.lg,
              paddingBottom: insets.bottom + Spacing.xl,
            },
          ]}
        >
          <View style={styles.header}>
            <NovaMascot
              message={
                signedImageUri 
                  ? "Your signature has been applied!" 
                  : isSigning 
                    ? "Draw your signature below." 
                    : "Select a document to sign."
              }
              size="small"
            />
          </View>

          {!isSigning ? (
            <>
              {signedImageUri ? (
                <View style={[styles.documentContainer, { backgroundColor: theme.backgroundSecondary }]}>
                  <Image source={{ uri: signedImageUri }} style={styles.documentImage} resizeMode="contain" />
                  <View style={styles.successBadge}>
                    <Feather name="check-circle" size={16} color="#22C55E" />
                    <ThemedText type="small" style={{ marginLeft: Spacing.xs, color: "#22C55E" }}>Signed</ThemedText>
                  </View>
                </View>
              ) : documentUri ? (
                <View style={[styles.documentContainer, { backgroundColor: theme.backgroundSecondary }]}>
                  <Image source={{ uri: documentUri }} style={styles.documentImage} resizeMode="contain" />
                  <Pressable
                    style={[styles.changeButton, { backgroundColor: theme.glass }]}
                    onPress={pickDocument}
                  >
                    <Feather name="refresh-cw" size={16} color={theme.text} />
                    <ThemedText type="small" style={{ marginLeft: Spacing.xs }}>Change</ThemedText>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={[styles.documentPicker, { backgroundColor: theme.backgroundSecondary, borderColor: theme.glassBorder }]}
                  onPress={pickDocument}
                >
                  <Feather name="file-text" size={48} color={theme.textSecondary} />
                  <ThemedText type="body" style={[styles.pickerText, { color: theme.textSecondary }]}>
                    Select document to sign
                  </ThemedText>
                </Pressable>
              )}

              <Button
                onPress={startSigning}
                disabled={!documentUri}
                variant="primary"
                style={styles.signButton}
              >
                {signedImageUri ? "Sign Again" : "Add Signature"}
              </Button>
            </>
          ) : (
            <>
              <ThemedText type="h3" style={styles.signatureTitle}>Draw Your Signature</ThemedText>
              
              <View 
                ref={signatureCanvasRef}
                style={[styles.signatureCanvas, { backgroundColor: "#FFFFFF", width: canvasWidth }]}
                collapsable={false}
              >
                <GestureDetector gesture={panGesture}>
                  <View style={{ width: canvasWidth, height: canvasHeight, position: "relative" }}>
                    {paths.map((path, pathIndex) => 
                      path.map((point, pointIndex) => (
                        <View
                          key={`${pathIndex}-${pointIndex}`}
                          style={{
                            position: "absolute",
                            left: point.x - 3.5,
                            top: point.y - 3.5,
                            width: 7,
                            height: 7,
                            backgroundColor: "#000000",
                            borderRadius: 3.5,
                          }}
                        />
                      ))
                    )}
                    {currentPath.map((point, pointIndex) => (
                      <View
                        key={`current-${pointIndex}`}
                        style={{
                          position: "absolute",
                          left: point.x - 3.5,
                          top: point.y - 3.5,
                          width: 7,
                          height: 7,
                          backgroundColor: "#000000",
                          borderRadius: 3.5,
                        }}
                      />
                    ))}
                  </View>
                </GestureDetector>
              </View>

              <View style={styles.signatureHint}>
                <Feather name="edit-2" size={14} color={theme.textSecondary} />
                <ThemedText type="small" style={[styles.hintText, { color: theme.textSecondary }]}>
                  Draw your signature in the white area above
                </ThemedText>
              </View>

              <View style={[styles.positionControls, { backgroundColor: theme.backgroundSecondary }]}>
                <View style={styles.controlRow}>
                  <ThemedText type="small">Position X: {signatureX}px</ThemedText>
                  <View style={styles.slider} />
                </View>
                <Pressable
                  style={styles.slider}
                  onPress={(event) => {
                    const { locationX } = event.nativeEvent;
                    if (locationX !== undefined) {
                      setSignatureX(Math.max(0, Math.min(200, Math.round(locationX / 2))));
                    }
                  }}
                >
                  <View style={[styles.sliderThumb, { left: `${(signatureX / 200) * 100}%` }]} />
                </Pressable>
                <View style={styles.controlRow}>
                  <ThemedText type="small">Position Y: {signatureY}px</ThemedText>
                  <View style={styles.slider} />
                </View>
                <Pressable
                  style={styles.slider}
                  onPress={(event) => {
                    const { locationX } = event.nativeEvent;
                    if (locationX !== undefined) {
                      setSignatureY(Math.max(0, Math.min(300, Math.round(locationX / 2))));
                    }
                  }}
                >
                  <View style={[styles.sliderThumb, { left: `${(signatureY / 300) * 100}%` }]} />
                </Pressable>
              </View>

              <View style={styles.signatureActions}>
                <Button
                  onPress={clearSignature}
                  variant="secondary"
                  style={styles.actionButton}
                  disabled={isApplying}
                >
                  Clear
                </Button>
                <Button
                  onPress={applySignature}
                  disabled={paths.length === 0 || isApplying}
                  variant="primary"
                  style={styles.actionButton}
                >
                  {isApplying ? (
                    <View style={styles.loadingButton}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <ThemedText type="body" style={{ marginLeft: Spacing.sm, color: "#FFFFFF" }}>Applying...</ThemedText>
                    </View>
                  ) : (
                    "Apply Signature"
                  )}
                </Button>
              </View>

              <Pressable
                style={styles.cancelLink}
                onPress={() => setIsSigning(false)}
                disabled={isApplying}
              >
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Cancel
                </ThemedText>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  documentPicker: {
    height: 200,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  pickerText: {
    marginTop: Spacing.md,
  },
  documentContainer: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    marginBottom: Spacing.lg,
    position: "relative",
  },
  documentImage: {
    width: "100%",
    height: 200,
  },
  changeButton: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  successBadge: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(34, 197, 94, 0.2)",
  },
  signButton: {
    marginTop: Spacing.md,
  },
  signatureTitle: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  signatureCanvas: {
    height: 200,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  signatureHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  hintText: {
    marginLeft: Spacing.xs,
  },
  signatureActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  loadingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelLink: {
    alignItems: "center",
    marginTop: Spacing.lg,
    padding: Spacing.md,
  },
});
