import React from 'react';
import { Tabs, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FavouritesProvider } from '../context/FavouritesContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const TabButton = ({ icon, active, primary = false, onPress }: { icon: string; active: boolean; primary?: boolean; onPress: () => void }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabButton, primary && styles.primaryTabButton]}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={active ? ['#FFA001', '#FF8A00'] : ['transparent', 'transparent']}
        style={styles.buttonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons
          name={icon as any}
          size={24}
          color={primary ? '#121212' : (active ? '#FFA001' : '#888888')}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function AppLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const getActiveRoute = () => {
    if (pathname.includes('learn')) return 'learn';
    if (pathname.includes('favourites')) return 'favourites';
    if (pathname.includes('quiz')) return 'quiz';
    if (pathname.includes('analytics')) return 'analytics';
    return 'learn';
  };

  const activeRoute = getActiveRoute();

  return (
    <FavouritesProvider>
      <View style={{ flex: 1, backgroundColor: '#121212' }}>
        <Tabs
          screenOptions={{
            tabBarShowLabel: false,
            headerShown: false,
            tabBarStyle: {
              display: 'none',
            },
          }}
        >
          <Tabs.Screen name="learn" />
          <Tabs.Screen name="favourites" />
          <Tabs.Screen name="quiz" />
          <Tabs.Screen name="analytics" />
        </Tabs>

        {/* Custom Floating Tab Bar */}
        <View style={[styles.tabBar, { bottom: insets.bottom + 20 }]}>
          <LinearGradient
            colors={['rgba(30, 30, 30, 0.9)', 'rgba(20, 20, 20, 0.95)']}
            style={styles.tabBarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.tabBarContent}>
              <TabButton
                icon={activeRoute === 'learn' ? 'book' : 'book-outline'}
                active={activeRoute === 'learn'}
                onPress={() => {
                  const router = require('expo-router').router;
                  router.replace('/learn');
                }}
              />
              <TabButton
                icon={activeRoute === 'favourites' ? 'heart' : 'heart-outline'}
                active={activeRoute === 'favourites'}
                onPress={() => {
                  const router = require('expo-router').router;
                  router.replace('/favourites');
                }}
              />
              <TabButton
                icon={activeRoute === 'quiz' ? 'school' : 'school-outline'}
                active={activeRoute === 'quiz'}
                onPress={() => {
                  const router = require('expo-router').router;
                  router.replace('/quiz');
                }}
              />
              <TabButton
                icon={activeRoute === 'analytics' ? 'stats-chart' : 'stats-chart-outline'}
                active={activeRoute === 'analytics'}
                onPress={() => {
                  const router = require('expo-router').router;
                  router.replace('/analytics');
                }}
              />
            </View>
          </LinearGradient>
        </View>
      </View>
    </FavouritesProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 1, 0.2)',
  },
  tabBarGradient: {
    flex: 1,
    borderRadius: 35,
    padding: 10,
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  primaryTabButton: {
    backgroundColor: '#FFA001',
    transform: [{ scale: 1.15 }],
    shadowColor: '#FFA001',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
