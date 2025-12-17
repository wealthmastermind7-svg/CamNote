import React, { useState } from "react";
import { View, StyleSheet, Pressable, Platform, Image, TextInput, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { NovaMascot } from "@/components/NovaMascot";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getApiUrl } from "@/lib/query-client";

type PasswordRouteProp = RouteProp<RootStackParamList, "PasswordProtect">;

export default function PasswordProtectScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const route = useRoute<PasswordRouteProp>();
  const theme = Colors.dark;

  const [documentUri, setDocumentUri] = useState<string | null>(route.params?.imageUri || null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [title, setTitle] = useState("Protected Document");
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const pickDocument = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setDocumentUri(result.assets[0].uri);
    }
  };

  const createProtectedPDF = async () => {
    if (!documentUri) return;

    if (password.length < 4) {
      Alert.alert("Invalid Password", "Password must be at least 4 characters.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      
      if (Platform.OS === "web") {
        const response = await fetch(documentUri);
        const blob = await response.blob();
        formData.append("document", blob, "document.jpg");
      } else {
        const { File } = await import("expo-file-system");
        const file = new File(documentUri);
        formData.append("document", file as unknown as Blob, "document.jpg");
      }
      
      formData.append("password", password);
      formData.append("title", title);

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/pdf/protect`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create protected PDF");
      }

      const blob = await response.blob();
      
      if (Platform.OS === "web") {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title.replace(/\s+/g, "_")}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const FileSystemLegacy = await import("expo-file-system/legacy");
        const Sharing = await import("expo-sharing");
        
        const arrayBuffer = await blob.arrayBuffer();
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
        
        const fileName = `${title.replace(/\s+/g, "_")}_protected.pdf`;
        const docDir = FileSystemLegacy.cacheDirectory;
        const fileUri = docDir + fileName;
        
        await FileSystemLegacy.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystemLegacy.EncodingType.Base64,
        });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "application/pdf",
            dialogTitle: "Save Protected PDF",
          });
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert("Success", "Your protected PDF has been created!", [
            { text: "OK", onPress: () => navigation.goBack() }
          ]);
        } else {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert(
            "PDF Saved",
            `Your protected PDF has been saved to the app. File: ${fileName}`,
            [{ text: "OK", onPress: () => navigation.goBack() }]
          );
        }
        return;
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Your protected PDF has been created!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error("PDF protection error:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to create protected PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const passwordsMatch = password === confirmPassword && password.length >= 4;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <View style={styles.header}>
          <NovaMascot
            message="Secure your documents with a password."
            size="small"
          />
        </View>

        {documentUri ? (
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
            <Feather name="lock" size={48} color={theme.textSecondary} />
            <ThemedText type="body" style={[styles.pickerText, { color: theme.textSecondary }]}>
              Select document to protect
            </ThemedText>
          </Pressable>
        )}

        <View style={styles.formSection}>
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            DOCUMENT TITLE
          </ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter document title"
            placeholderTextColor={theme.textSecondary}
          />

          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            PASSWORD
          </ThemedText>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password (min 4 characters)"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={!showPassword}
            />
            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Feather name={showPassword ? "eye-off" : "eye"} size={20} color={theme.textSecondary} />
            </Pressable>
          </View>

          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            CONFIRM PASSWORD
          </ThemedText>
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: theme.backgroundSecondary, color: theme.text },
              confirmPassword && password !== confirmPassword ? styles.inputError : null
            ]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry={!showPassword}
          />
          
          {confirmPassword && password !== confirmPassword ? (
            <ThemedText type="small" style={styles.errorText}>
              Passwords do not match
            </ThemedText>
          ) : null}
        </View>

        <View style={[styles.infoBox, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather name="info" size={16} color={theme.accent} />
          <ThemedText type="small" style={[styles.infoText, { color: theme.textSecondary }]}>
            The PDF will require this password to open. Store your password safely - it cannot be recovered.
          </ThemedText>
        </View>

        <Button
          onPress={createProtectedPDF}
          disabled={!documentUri || !passwordsMatch || isProcessing}
          variant="primary"
          style={styles.createButton}
        >
          {isProcessing ? "Creating PDF..." : "Create Protected PDF"}
        </Button>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  documentPicker: {
    height: 160,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  pickerText: {
    marginTop: Spacing.md,
  },
  documentContainer: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    marginBottom: Spacing.xl,
    position: "relative",
  },
  documentImage: {
    width: "100%",
    height: 160,
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
  formSection: {
    marginBottom: Spacing.xl,
  },
  label: {
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  input: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    fontSize: 16,
    marginBottom: Spacing.lg,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  passwordContainer: {
    position: "relative",
    marginBottom: Spacing.lg,
  },
  passwordInput: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    paddingRight: 50,
    fontSize: 16,
  },
  eyeButton: {
    position: "absolute",
    right: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    padding: Spacing.sm,
  },
  errorText: {
    color: "#EF4444",
    marginTop: -Spacing.md,
    marginBottom: Spacing.md,
  },
  infoBox: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  infoText: {
    flex: 1,
    lineHeight: 20,
  },
  createButton: {
    marginBottom: Spacing.xl,
  },
});
