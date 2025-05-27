import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FavouritesProvider } from '../context/FavouritesContext';
import { LinearGradient } from 'expo-linear-gradient';

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
            borderTopWidth: 0,
            paddingBottom: insets.bottom, 
            height: 58 + insets.bottom, 
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: -1 },
            shadowOpacity: 0.10,
            shadowRadius: 3.0,
            elevation: 5,
          },
          headerShown: false,
          tabBarBackground: () => (
            <LinearGradient
              colors={['#2A2A2E', '#1C1C1E']}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          ),
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
