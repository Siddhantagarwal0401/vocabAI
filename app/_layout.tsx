import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FavouritesProvider } from '../context/FavouritesContext';

export default function AppLayout() {
  const insets = useSafeAreaInsets();

  return (
    <FavouritesProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FFA001', 
          tabBarInactiveTintColor: '#CCCCCC', 
          tabBarShowLabel: false, 
          tabBarStyle: {
            backgroundColor: '#1C1C1E', 
            borderTopWidth: 0,
            paddingBottom: insets.bottom, 
            height: 58 + insets.bottom, 
            // Refined shadow for a sleeker look
            shadowColor: '#000000', // Explicitly black for shadow
            shadowOffset: { width: 0, height: -1 }, // Softer, less pronounced offset
            shadowOpacity: 0.10, // Reduced opacity
            shadowRadius: 3.0, // Slightly softer radius
            elevation: 5, // Adjusted elevation for Android
          },
          headerShown: false, 
        }}
      >
        <Tabs.Screen
          name="learn"
          options={{
            title: 'Learn', 
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "book" : "book-outline"} size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="favourites"
          options={{
            title: 'Favourites', 
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "heart" : "heart-outline"} size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="quiz"
          options={{
            title: 'Quiz',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "school" : "school-outline"} size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "stats-chart" : "stats-chart-outline"} size={28} color={color} />
            ),
          }}
        />
      </Tabs>
    </FavouritesProvider>
  );
}
