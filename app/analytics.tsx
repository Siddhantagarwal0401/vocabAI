import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, StatusBar, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; 
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomAlert, { AlertButton } from '../components/CustomAlert'; 
import { LineChart } from 'react-native-chart-kit'; 

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

  // State for CustomAlert
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<AlertButton[]>([]);

  // State for Summary Stats
  const [totalQuizzesTaken, setTotalQuizzesTaken] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [bestScoreAchieved, setBestScoreAchieved] = useState(0);

  // State for Chart Data
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: [{ data: number[]; strokeWidth?: number }];
  } | null>(null);

  const calculateSummaryStats = (history: QuizAttempt[]) => {
    if (history.length === 0) {
      setTotalQuizzesTaken(0);
      setAverageScore(0);
      setBestScoreAchieved(0);
      setChartData(null); // Clear chart data
      return;
    }

    setTotalQuizzesTaken(history.length);
    const totalPercentage = history.reduce((sum, attempt) => sum + attempt.percentage, 0);
    setAverageScore(totalPercentage / history.length);
    const bestScore = history.reduce((max, attempt) => Math.max(max, attempt.percentage), 0);
    setBestScoreAchieved(bestScore);

    // Prepare data for the chart (last 10 quizzes, reversed for chronological order in chart)
    const recentQuizzes = history.slice(0, 10).reverse(); // Take last 10, then reverse so oldest of these is first
    if (recentQuizzes.length >= 1) { // Need at least 1 point to show something, 2 for a line
      setChartData({
        labels: recentQuizzes.map((_, index) => `${index + 1}`), // Simple labels 1, 2, 3...
        datasets: [
          {
            data: recentQuizzes.map(attempt => attempt.percentage),
            strokeWidth: 2,
          },
        ],
      });
    } else {
      setChartData(null);
    }
  };

  const loadQuizHistory = async () => {
    setIsLoading(true);
    try {
      const storedHistory = await AsyncStorage.getItem(ANALYTICS_STORAGE_KEY);
      if (storedHistory) {
        const parsedHistory: QuizAttempt[] = JSON.parse(storedHistory);
        parsedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setQuizHistory(parsedHistory);
        calculateSummaryStats(parsedHistory); // Calculate stats after loading
      } else {
        setQuizHistory([]);
        calculateSummaryStats([]); // Reset stats if no history
      }
    } catch (error) {
      console.error('Failed to load quiz history:', error);
      setQuizHistory([]);
      calculateSummaryStats([]); // Reset stats on error
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
    setAlertTitle("Clear Quiz History");
    setAlertMessage("Are you sure you want to delete all your quiz analytics? This action cannot be undone.");
    setAlertButtons([
      { 
        text: "Cancel", 
        onPress: () => setIsAlertVisible(false), 
        style: 'cancel' 
      },
      { 
        text: "Clear All", 
        onPress: () => {
          setIsAlertVisible(false);
          clearHistory(); 
        },
        style: 'destructive'
      }
    ]);
    setIsAlertVisible(true);
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem(ANALYTICS_STORAGE_KEY);
      setQuizHistory([]);
      setAlertTitle("Success");
      setAlertMessage("Quiz history has been cleared.");
      setAlertButtons([{ text: "OK", onPress: () => setIsAlertVisible(false), style: 'primary' }]);
      setIsAlertVisible(true); 
    } catch (error) {
      console.error('Failed to clear quiz history:', error);
      setAlertTitle("Error");
      setAlertMessage("Could not clear quiz history.");
      setAlertButtons([{ text: "OK", onPress: () => setIsAlertVisible(false), style: 'primary' }]);
      setIsAlertVisible(true);
    }
  };

  const getScoreIcon = (percentage: number) => {
    if (percentage >= 85) return { name: "trophy-outline" as const, color: '#4CAF50' };
    if (percentage >= 60) return { name: "checkmark-circle-outline" as const, color: '#FFC107' };
    return { name: "alert-circle-outline" as const, color: '#F44336' };
  };

  const screenWidth = Dimensions.get('window').width;
  const chartConfig = {
    backgroundColor: '#1E1E1E',
    backgroundGradientFrom: '#1E1E1E',
    backgroundGradientTo: '#1E1E1E',
    decimalPlaces: 0, // No decimal places for percentage
    color: (opacity = 1) => `rgba(255, 160, 1, ${opacity})`, // Line and label color (using your active tint)
    labelColor: (opacity = 1) => `rgba(204, 204, 204, ${opacity})`, // Axis label color
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5', // Dot radius
      strokeWidth: '2',
      stroke: '#FFA001', // Dot stroke color
    },
    propsForBackgroundLines: {
        strokeDasharray: '', // solid lines
        stroke: 'rgba(204, 204, 204, 0.2)', // Lighter, more subtle grid lines
    },
  };

  const renderScoreTrendChart = () => {
    if (quizHistory.length === 0) return null; // If no history, render nothing for the chart section

    if (!chartData || chartData.datasets[0].data.length < 2) { // Need at least 2 points to draw a line
      if (quizHistory.length > 0 && quizHistory.length < 2) { // This case should be rare if quizHistory.length is 0 above
        return (
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>Take one more quiz to see your score trend.</Text>
          </View>
        );
      }
      return null; // Don't render chart if not enough data (and not the 1-quiz placeholder case)
    }

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Recent Score Trend (Last {chartData.datasets[0].data.length} Quizzes)</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 30} // Adjust width to fit within screen with padding
          height={220}
          chartConfig={chartConfig}
          bezier // Makes the line smooth
          style={styles.chartStyle}
          yAxisSuffix="%" // Restore this prop
          yAxisInterval={1} // Show all integer y-axis labels if possible
          segments={5} // Suggest 5 segments for y-axis grid lines
          fromZero // Ensure Y axis starts from 0
        />
      </View>
    );
  };

  const renderSummaryStats = () => {
    if (quizHistory.length === 0) return null; // If no history, render nothing for summary stats
    
    // These conditions are more for initial load, but covered by the above if history is truly empty.
    if (isLoading && quizHistory.length === 0) return null; 

    return (
      <View style={styles.summaryStatsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalQuizzesTaken}</Text>
          <Text style={styles.statLabel}>Quizzes Taken</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{averageScore.toFixed(0)}%</Text>
          <Text style={styles.statLabel}>Average Score</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{bestScoreAchieved.toFixed(0)}%</Text>
          <Text style={styles.statLabel}>Best Score</Text>
        </View>
      </View>
    );
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
            <Ionicons name="trash-bin-outline" size={22} color="#FF6B6B" style={{marginRight: 5}} />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerRightPlaceholder} /> 
        )}
      </View>

      {renderSummaryStats()} 
      {renderScoreTrendChart()} 

      {quizHistory.length > 0 ? (
        <FlatList
          data={quizHistory}
          renderItem={renderAttempt}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
          ListHeaderComponent={() => <View style={{ height: 10 }} />} // Spacer
          ListFooterComponent={() => <View style={{ height: insets.bottom + 80 }} />} // Increased bottom space for the floating tab bar
        />
      ) : (
        !isLoading && (
          <View style={styles.emptyContainer}>
            <Ionicons name="stats-chart-outline" size={60} color="#555555" />
            <Text style={styles.emptyText}>No quiz history yet.</Text>
            <Text style={styles.emptySubText}>Take a quiz to see your analytics!</Text>
          </View>
        )
      )}

      <CustomAlert
        isVisible={isAlertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={alertButtons}
        onRequestClose={() => setIsAlertVisible(false)}
      />
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
    paddingBottom: 100, // Increased bottom padding to ensure last item is visible above navbar
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
  summaryStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: '#1E1E1E', // Slightly different background for this section
    marginHorizontal: 15,
    borderRadius: 12,
    marginBottom: 20, // Space before the list of attempts
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  statItem: {
    alignItems: 'center',
    flex: 1, // Ensure items take equal space
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFA001', // Use active tint color for emphasis
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  chartContainer: {
    marginTop: 10, // Space above the chart
    marginBottom: 20,
    alignItems: 'center',
    marginHorizontal: 15,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EAEAEA',
    marginBottom: 10,
  },
  chartStyle: {
    borderRadius: 12, // Match container's border radius
  },
  chartPlaceholder: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    marginHorizontal: 15,
    borderRadius: 12,
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  chartPlaceholderText: {
    color: '#AAAAAA',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default AnalyticsScreen;
