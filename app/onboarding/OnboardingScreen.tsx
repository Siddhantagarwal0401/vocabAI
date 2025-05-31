import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const slides = [
  {
    id: '1',
    title: 'Welcome to VocabAI',
    description: 'Your personal vocabulary builder powered by AI. Learn new words, track progress, and master English vocabulary through smart, adaptive learning.',
    icon: 'book-outline',
    color: '#FFA001',
  },
  {
    id: '2',
    title: 'Discover & Learn',
    description: 'Explore a vast collection of words with detailed definitions, examples, and usage tips. Save your favorites for quick access later.',
    icon: 'search-outline',
    color: '#4CAF50',
  },
  {
    id: '3',
    title: 'Smart Quizzes',
    description: 'Test your knowledge with personalized quizzes. Our AI adapts to your learning style for maximum retention and understanding.',
    icon: 'school-outline',
    color: '#2196F3',
  },
  {
    id: '4',
    title: 'Track Progress',
    description: 'Monitor your improvement with detailed analytics. See which words you\'ve mastered and which need more practice.',
    icon: 'stats-chart-outline',
    color: '#9C27B0',
  },
  {
    id: '5',
    title: 'Daily Challenges',
    description: 'Complete daily word challenges to keep your learning consistent and earn achievements as you progress.',
    icon: 'trophy-outline',
    color: '#FF5722',
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
  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E1E1E', '#121212']}
        style={styles.gradient}
      >
        {/* Skip Button */}
        {!isLastSlide && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          {slides.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.progressDot,
                index === currentIndex && styles.activeProgressDot,
                index < currentIndex && styles.completedProgressDot
              ]} 
            />
          ))}
        </View>

        {/* Slide Content */}
        <View style={[styles.slide, { width }]}>
          <View style={[styles.iconContainer, { backgroundColor: `${slide.color}20` }]}>
            <Ionicons 
              name={slide.icon as any} 
              size={80} 
              color={slide.color}
            />
          </View>
          
          <Text style={styles.counterText}>Step {currentIndex + 1} of {slides.length}</Text>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={currentIndex > 0 ? () => setCurrentIndex(currentIndex - 1) : undefined}
            disabled={currentIndex === 0}
          >
            <Text style={[styles.buttonText, { color: currentIndex === 0 ? '#555' : '#FFA001' }]}>
              Back
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: slide.color }]}
            onPress={handleNext}
          >
            <Text style={[styles.buttonText, { color: '#121212' }]}>
              {isLastSlide ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={20} 
              color="#121212" 
              style={styles.buttonIcon} 
            />
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 25,
    zIndex: 1,
  },
  skipText: {
    color: '#888888',
    fontSize: 16,
    fontWeight: '500',
  },
  progressBarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    width: '80%',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333333',
    marginHorizontal: 4,
  },
  activeProgressDot: {
    backgroundColor: '#FFA001',
    width: 24,
  },
  completedProgressDot: {
    backgroundColor: '#4CAF50',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  counterText: {
    color: '#FFA001',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 24,
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    minWidth: '45%',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
});