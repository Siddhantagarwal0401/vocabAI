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
        tabBarActiveTintColor: '#FFFFFF', // Active icon color (white)
        tabBarInactiveTintColor: '#B0B0B0', // Inactive icon color (lighter grey)
        tabBarShowLabel: false, // Still icon-only
        tabBarStyle: {
          backgroundColor: '#2A2A2A', // A slightly lighter dark shade for the bar
          borderTopWidth: 0,
          paddingBottom: insets.bottom, // Apply bottom safe area padding
          height: 58 + insets.bottom, // Adjusted height
          // Shadow for a subtle lift
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.15,
          shadowRadius: 3.5,
          elevation: 7,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="learn"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons 
              name={focused ? "school" : "school"} // MaterialIcons 'school' is usually filled. If an outline variant existed, we'd use it for !focused.
              color={color} 
              size={28} // Consistent size, active state handled by color and potentially filled/outline
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons 
              name={focused ? "favorite" : "favorite-border"} // Using filled for active, outline for inactive
              color={color} 
              size={28} // Consistent size
            />
          ),
        }}
      />
    </Tabs>
  );
}
