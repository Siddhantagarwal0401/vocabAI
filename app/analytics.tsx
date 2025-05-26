import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, StatusBar, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ANALYTICS_STORAGE_KEY = 'quizAnalyticsData';

export interface QuizAttempt {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  percentage: number;
}

const AnalyticsScreen = () => {
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const loadQuizHistory = async () => {
    setIsLoading(true);
    try {
      const storedHistory = await AsyncStorage.getItem(ANALYTICS_STORAGE_KEY);
      if (storedHistory) {
        const parsedHistory: QuizAttempt[] = JSON.parse(storedHistory);
        // Sort by date, most recent first
        parsedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setQuizHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Failed to load quiz history:', error);
      // Optionally, show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  // useFocusEffect to reload data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadQuizHistory();
    }, [])
  );

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem(ANALYTICS_STORAGE_KEY);
      setQuizHistory([]);
      // Optionally, show a confirmation message
    } catch (error) {
      console.error('Failed to clear quiz history:', error);
      // Optionally, show an error message
    }
  };

  const renderAttempt = ({ item }: { item: QuizAttempt }) => (
    <View style={styles.attemptCard}>
      <View style={styles.attemptHeader}>
        <Text style={styles.attemptDate}>{new Date(item.date).toLocaleDateString()} - {new Date(item.date).toLocaleTimeString()}</Text>
        <Text style={[styles.attemptScore, item.percentage >= 70 ? styles.goodScore : styles.averageScore]}>
          {item.percentage.toFixed(0)}%
        </Text>
      </View>
      <Text style={styles.attemptDetails}>Score: {item.score} / {item.totalQuestions}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeAreaLoading}>
        <StatusBar barStyle="light-content" backgroundColor={styles.safeAreaLoading.backgroundColor} />
        <ActivityIndicator size="large" color="#FFFFFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={styles.safeArea.backgroundColor} />
      <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerLeftPlaceholder} />
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Quiz Analytics</Text>
        </View>
        {quizHistory.length > 0 ? (
          <TouchableOpacity onPress={clearHistory} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={26} color="#FF6B6B" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerRightPlaceholder} />
        )}
      </View>

      {quizHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="stats-chart-outline" size={60} color="#555555" />
          <Text style={styles.emptyText}>No quiz history yet.</Text>
          <Text style={styles.emptySubText}>Complete some quizzes to see your progress!</Text>
        </View>
      ) : (
        <FlatList
          data={quizHistory}
          renderItem={renderAttempt}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  safeAreaLoading: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    width: '100%',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#EAEAEA',
    textAlign: 'center',
  },
  clearButton: {
    padding: 5,
  },
  headerLeftPlaceholder: {
    width: 36,
  },
  headerRightPlaceholder: {
    width: 36,
  },
  listContentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  attemptCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  attemptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  attemptDate: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  attemptScore: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  goodScore: {
    color: '#4CAF50',
  },
  averageScore: {
    color: '#FFC107',
  },
  attemptDetails: {
    fontSize: 15,
    color: '#E0E0E0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#AAAAAA',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    color: '#777777',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default AnalyticsScreen;
