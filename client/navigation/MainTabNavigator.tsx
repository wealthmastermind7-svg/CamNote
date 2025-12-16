import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";
import { Colors, BorderRadius } from "@/constants/theme";

import ScanScreen from "@/screens/ScanScreen";
import FilesScreen from "@/screens/FilesScreen";
import ToolsScreen from "@/screens/ToolsScreen";

export type MainTabParamList = {
  ScanTab: undefined;
  FilesTab: undefined;
  ToolsTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const theme = Colors.dark;

  return (
    <Tab.Navigator
      initialRouteName="ScanTab"
      screenOptions={{
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundDefault,
            web: theme.backgroundDefault,
          }),
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.select({ ios: 88, android: 70, web: 70 }),
          paddingBottom: Platform.select({ ios: 28, android: 8, web: 8 }),
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={60}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.backgroundDefault }]} />
          ),
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="ScanTab"
        component={ScanScreen}
        options={{
          title: "Scan",
          tabBarIcon: ({ color, size }) => (
            <Feather name="camera" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="FilesTab"
        component={FilesScreen}
        options={{
          title: "Files",
          tabBarIcon: ({ color, size }) => (
            <Feather name="folder" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ToolsTab"
        component={ToolsScreen}
        options={{
          title: "Tools",
          tabBarIcon: ({ color, size }) => (
            <Feather name="tool" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
