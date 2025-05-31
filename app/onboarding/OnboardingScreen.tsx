import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETE = '@onboarding_complete';

const slides = [
  {
    id: '1',
    title: 'Welcome to VocabAI',
    description: 'Expand your vocabulary with AI-powered learning',
    icon: 'book-outline',
    color: '#FFA001',
  },
  {
    id: '2',
    title: 'Discover New Words',
    description: 'Learn new words daily with personalized recommendations',
    icon: 'search-outline',
    color: '#4CAF50',
  },
  {
    id: '3',
    title: 'Track Your Progress',
    description: 'Monitor your learning journey with detailed analytics',
    icon: 'stats-chart-outline',
    color: '#2196F3',
  },
  {
    id: '4',
    title: 'Practice with Quizzes',
    description: 'Reinforce your learning with engaging quizzes',
    icon: 'help-circle-outline',
    color: '#9C27B0',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = useWindowDimensions();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const slide = slides[currentIndex];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E1E1E', '#121212']}
        style={styles.gradient}
      >
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Slide Content */}
        <View style={[styles.slide, { width }]}>
          <View style={[styles.iconContainer, { backgroundColor: `${slide.color}20` }]}>
            <Ionicons 
              name={slide.icon as any} 
              size={80} 
              color={slide.color}
            />
          </View>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>

        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                currentIndex === index && styles.activeDot
              ]} 
            />
          ))}
        </View>

        {/* Next/Get Started Button */}
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={20} 
            color="#FFFFFF" 
            style={styles.nextIcon} 
          />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 25,
    zIndex: 1,
  },
  skipText: {
    color: '#888888',
    fontSize: 16,
    fontWeight: '500',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 50,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333333',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#007AFF',
    width: 24,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginBottom: 50,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  nextIcon: {
    marginLeft: 4,
  },
});