import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF', // Pure white for active icon
        tabBarInactiveTintColor: '#9E9E9E', // Softer grey for inactive icon
        tabBarShowLabel: false, // Icon-only tab bar
        tabBarStyle: {
          backgroundColor: '#212121', // Dark background
          borderTopWidth: 0, // No top border
          paddingBottom: insets.bottom, // Apply bottom safe area padding
          paddingTop: 5, // Adjusted for icon-only centering
          height: 55 + insets.bottom, // Slightly more compact height for icon-only
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -3, // Slightly more pronounced shadow
          },
          shadowOpacity: 0.12,
          shadowRadius: 4.0,
          elevation: 8, // For Android shadow
        },
        headerShown: false,
        // tabBarLabelStyle is not needed if tabBarShowLabel is false
      }}
    >
      <Tabs.Screen
        name="learn"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="school" color={color} size={focused ? 30 : 26} /> // More distinct size difference
          ),
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="favorite" color={color} size={focused ? 30 : 26} /> // More distinct size difference
          ),
        }}
      />
      {/* The index route is no longer needed here as tabs define the initial routes */}
      {/* <Stack.Screen name="index" options={{ headerShown: false }} /> */}
    </Tabs>
  );
}
