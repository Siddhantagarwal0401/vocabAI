import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, StatusBar, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
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
        parsedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setQuizHistory(parsedHistory);
      } else {
        setQuizHistory([]);
      }
    } catch (error) {
      console.error('Failed to load quiz history:', error);
      setQuizHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadQuizHistory();
    }, [])
  );

  const confirmClearHistory = () => {
    Alert.alert(
      "Clear Quiz History",
      "Are you sure you want to delete all your quiz analytics? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Clear All",
          onPress: clearHistory,
          style: "destructive"
        }
      ]
    );
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem(ANALYTICS_STORAGE_KEY);
      setQuizHistory([]);
      Alert.alert('Success', 'Quiz history has been cleared.');
    } catch (error) {
      console.error('Failed to clear quiz history:', error);
      Alert.alert('Error', 'Could not clear quiz history.');
    }
  };

  const getScoreIcon = (percentage: number) => {
    if (percentage >= 85) return { name: "trophy-outline" as const, color: '#4CAF50' };
    if (percentage >= 60) return { name: "checkmark-circle-outline" as const, color: '#FFC107' };
    return { name: "alert-circle-outline" as const, color: '#F44336' };
  };

  const renderAttempt = ({ item }: { item: QuizAttempt }) => {
    const scoreIcon = getScoreIcon(item.percentage);
    return (
      <View style={styles.attemptCard}>
        <View style={styles.attemptCardHeader}>
          <Text style={styles.attemptDate}>{new Date(item.date).toLocaleDateString()} - {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          <View style={styles.scoreIconContainer}>
            <Ionicons name={scoreIcon.name} size={24} color={scoreIcon.color} />
          </View>
        </View>
        <View style={styles.attemptCardBody}>
          <Text style={styles.attemptScoreText}>Score: {item.score} / {item.totalQuestions}</Text>
          <Text style={[styles.attemptPercentage, { color: scoreIcon.color }]}>
            {item.percentage.toFixed(0)}%
          </Text>
        </View>
      </View>
    );
  };

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
          <TouchableOpacity onPress={confirmClearHistory} style={styles.clearButton}>
            <Ionicons name="trash-bin-outline" size={22} color="#FF6B6B" style={{ marginRight: 5 }} />
            <Text style={styles.clearButtonText}>Clear</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#2c1d1d',
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#FF8F8F',
    fontSize: 14,
    fontWeight: '600',
  },
  headerLeftPlaceholder: {
    width: 70,
  },
  headerRightPlaceholder: {
    width: 70,
  },
  listContentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  attemptCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  attemptCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  attemptDate: {
    fontSize: 13,
    color: '#AAAAAA',
    fontWeight: '500',
  },
  scoreIconContainer: {
    // Styles for icon container if needed, e.g., padding
  },
  attemptCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  attemptScoreText: {
    fontSize: 16,
    color: '#E0E0E0',
    fontWeight: '500',
  },
  attemptPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  goodScore: {
    color: '#4CAF50',
  },
  averageScore: {
    color: '#FFC107',
  },
  poorScore: {
    color: '#F44336',
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
