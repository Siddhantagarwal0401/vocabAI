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
