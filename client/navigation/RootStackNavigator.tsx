import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import EditScreen from "@/screens/EditScreen";
import ExportScreen from "@/screens/ExportScreen";
import PaywallScreen from "@/screens/PaywallScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import HelpScreen from "@/screens/HelpScreen";
import CustomerCenterScreen from "@/screens/CustomerCenterScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { Colors } from "@/constants/theme";

export type RootStackParamList = {
  Main: undefined;
  Edit: { documentId: string; imageUri?: string };
  Export: { documentId: string; imageUri?: string };
  Paywall: undefined;
  Settings: undefined;
  Help: undefined;
  CustomerCenter: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const theme = Colors.dark;

  return (
    <Stack.Navigator
      screenOptions={{
        ...screenOptions,
        contentStyle: { backgroundColor: theme.backgroundRoot },
      }}
    >
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Edit"
        component={EditScreen}
        options={{
          headerTitle: "Edit",
          headerTintColor: theme.text,
        }}
      />
      <Stack.Screen
        name="Export"
        component={ExportScreen}
        options={{
          headerTitle: "Export",
          headerTintColor: theme.text,
        }}
      />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: "Settings",
          headerTintColor: theme.text,
        }}
      />
      <Stack.Screen
        name="Help"
        component={HelpScreen}
        options={{
          headerTitle: "Help & Support",
          headerTintColor: theme.text,
        }}
      />
      <Stack.Screen
        name="CustomerCenter"
        component={CustomerCenterScreen}
        options={{
          headerTitle: "Subscription",
          headerTintColor: theme.text,
        }}
      />
    </Stack.Navigator>
  );
}
