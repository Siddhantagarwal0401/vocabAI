import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Alert, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavourites } from '../context/FavouritesContext';
import { VocabularyItem } from './VocabularyCard';
import generalWordListJson from '../assets/word_list.json';

interface QuizAttempt {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  percentage: number;
}
const ANALYTICS_STORAGE_KEY = 'quizAnalyticsData';

const generalWordList: string[] = generalWordListJson as string[];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const NUM_CHOICES = 4;

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const { favourites } = useFavourites();

  const [quizWords, setQuizWords] = useState<VocabularyItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<VocabularyItem | null>(null);
  const [currentChoices, setCurrentChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizActive, setQuizActive] = useState(false);

  const nextButtonOpacity = useRef(new Animated.Value(0)).current;
  const [revealedCorrectChoiceWord, setRevealedCorrectChoiceWord] = useState<string | null>(null);

  const generateChoices = (correctItem: VocabularyItem): string[] => {
    const correctWord = correctItem.word;
    let distractors: string[] = [];

    const potentialDistractors = generalWordList.filter(word => word.toLowerCase() !== correctWord.toLowerCase());
    const shuffledPotentialDistractors = shuffleArray(potentialDistractors);

    for (let i = 0; i < NUM_CHOICES - 1 && i < shuffledPotentialDistractors.length; i++) {
      distractors.push(shuffledPotentialDistractors[i]);
    }

    const needed = NUM_CHOICES - 1 - distractors.length;
    if (needed > 0) {
      for (let i = 0; i < needed; i++) {
        let placeholder = `Option ${i + distractors.length + 2}`;
        while (placeholder.toLowerCase() === correctWord.toLowerCase() || distractors.includes(placeholder)) {
            placeholder += '_alt'; 
        }
        distractors.push(placeholder);
      }
    }

    return shuffleArray([correctWord, ...distractors]);
  };

  const resetQuestionState = () => {
    setSelectedChoice(null);
    setIsAnswered(false);
    setRevealedCorrectChoiceWord(null);
    nextButtonOpacity.setValue(0);
  };

  const loadQuestion = (index: number, words: VocabularyItem[]) => {
    resetQuestionState();
    if (index < words.length) {
      const correctItem = words[index];
      setCurrentQuestion(correctItem);
      setCurrentChoices(generateChoices(correctItem));
      setCurrentQuestionIndex(index);
    } else {
      saveQuizAttempt();
      Alert.alert(
        "Quiz Finished!", 
        `Your score: ${score} / ${quizWords.length} (${((score / quizWords.length) * 100).toFixed(0)}%).\n\nView detailed progress in the 'Analytics' tab.`,
        [{ text: "OK", onPress: () => resetQuiz() }]
      );
    }
  };

  const startQuiz = () => {
    if (favourites.length === 0) {
        Alert.alert("No Favourites", "Please add some words to your favourites to start a quiz.");
        return;
    }
    if (favourites.length < 2 && NUM_CHOICES > 1) {
        Alert.alert("Not Enough Words", `You need at least ${Math.max(2, NUM_CHOICES)} different words in favourites for a meaningful quiz with ${NUM_CHOICES} choices. You have ${favourites.length}.`);
        return;
    }

    setScore(0);
    const shuffledQuizWords = shuffleArray(favourites);
    setQuizWords(shuffledQuizWords);
    loadQuestion(0, shuffledQuizWords);
    setQuizActive(true);
  };

  const handleChoicePress = (choice: string) => {
    if (isAnswered || !currentQuestion) return;

    const correct = choice.toLowerCase() === currentQuestion.word.toLowerCase();
    setSelectedChoice(choice);
    setIsAnswered(true);

    if (correct) {
      setScore(prevScore => prevScore + 1);
    } else {
      setTimeout(() => {
        if (currentQuestion) { 
            setRevealedCorrectChoiceWord(currentQuestion.word);
        }
      }, 700); 
    }

    Animated.timing(nextButtonOpacity, {
      toValue: 1,
      duration: 300, 
      useNativeDriver: true, 
    }).start();
  };

  const handleNextQuestion = () => {
    loadQuestion(currentQuestionIndex + 1, quizWords);
  };

  const getChoiceButtonStyle = (choice: string) => {
    const isCorrectChoice = currentQuestion && choice.toLowerCase() === currentQuestion.word.toLowerCase();
    const isSelected = selectedChoice === choice;

    if (isAnswered) {
      if (isSelected) {
        return [styles.choiceButton, isCorrectChoice ? styles.correctChoice : styles.incorrectChoice];
      } else if (isCorrectChoice && revealedCorrectChoiceWord === choice) {
        return [styles.choiceButton, styles.revealedCorrectChoiceStyle];
      } else {
        return [styles.choiceButton, styles.disabledChoice];
      }
    }
    return [styles.choiceButton];
  };

  const getChoiceTextStyle = (choice: string) => {
    const isCorrectChoice = currentQuestion && choice.toLowerCase() === currentQuestion.word.toLowerCase();
    const isSelected = selectedChoice === choice;

    if (isAnswered) {
      if (isSelected) {
        return [styles.choiceText, styles.selectedChoiceText];
      } else if (isCorrectChoice && revealedCorrectChoiceWord === choice) {
        return [styles.choiceText, styles.selectedChoiceText];
      } else {
        return [styles.choiceText, styles.disabledChoiceText];
      }
    }
    return [styles.choiceText];
  };

  const saveQuizAttempt = async () => {
    if (quizWords.length === 0) return; 

    const attempt: QuizAttempt = {
      id: new Date().toISOString(), 
      date: new Date().toISOString(),
      score: score,
      totalQuestions: quizWords.length,
      percentage: (score / quizWords.length) * 100,
    };

    try {
      const existingAttemptsJson = await AsyncStorage.getItem(ANALYTICS_STORAGE_KEY);
      let existingAttempts: QuizAttempt[] = [];
      if (existingAttemptsJson) {
        existingAttempts = JSON.parse(existingAttemptsJson);
      }
      existingAttempts.push(attempt);
      await AsyncStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(existingAttempts));
      console.log('Quiz attempt saved:', attempt);
    } catch (error) {
      console.error('Failed to save quiz attempt:', error);
      Alert.alert('Error', 'Could not save your quiz results.');
    }
  };

  const resetQuiz = () => {
    setQuizWords([]);
    setCurrentQuestionIndex(0);
    setCurrentQuestion(null);
    setCurrentChoices([]);
    setSelectedChoice(null);
    setIsAnswered(false);
    setScore(0);
    setQuizActive(false);
    nextButtonOpacity.setValue(0);
    setRevealedCorrectChoiceWord(null);
  };

  if (!quizActive) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={styles.safeArea.backgroundColor} />
        <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center' }]}>
          <Ionicons name="school-outline" size={90} color="#555" style={styles.preQuizIcon} />
          <Text style={styles.headerText}>Quiz Challenge</Text>
          {favourites.length > 0 ? (
            <>
              <Text style={styles.subText}>
                Test your vocabulary on {favourites.length} favourited word{favourites.length === 1 ? '' : 's'}.
              </Text>
              <TouchableOpacity style={styles.startButton} onPress={startQuiz}>
                <Ionicons name="play-outline" size={22} color="#FFFFFF" style={{marginRight: 8}}/>
                <Text style={styles.startButtonText}>Start Quiz</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.subText}>
              Add words to Favourites to start a quiz.
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea}>
         <StatusBar barStyle="light-content" backgroundColor={styles.safeArea.backgroundColor} />
        <View style={[styles.container, {justifyContent: 'center'}]}><Text style={styles.subText}>Loading question...</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={styles.safeArea.backgroundColor} />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.quizTopArea}>
            <Text style={styles.progressText}>
            Word {currentQuestionIndex + 1} / {quizWords.length}
            </Text>
            <Text style={styles.scoreText}>Score: {score}</Text>
        </View>
        
        <View style={styles.quizContentArea}> 
            <View style={styles.questionContainer}>
            <Text style={styles.definitionHintText}>DEFINITION</Text>
            <Text style={styles.definitionText}>{currentQuestion.definition}</Text>
            </View>

            <View style={styles.choicesContainer}>
            {currentChoices.map((choice, index) => (
                <TouchableOpacity 
                key={index} 
                style={getChoiceButtonStyle(choice)}
                onPress={() => handleChoicePress(choice)}
                disabled={isAnswered}
                >
                <Text style={getChoiceTextStyle(choice)}>{choice}</Text>
                </TouchableOpacity>
            ))}
            </View>
        </View>

        <View style={styles.quizBottomArea}> 
            {isAnswered ? (
            <Animated.View style={{ opacity: nextButtonOpacity, width: '100%', alignItems: 'center' }}>
              <TouchableOpacity
                style={[styles.nextButton, styles.cardShadow]}
                onPress={handleNextQuestion}
              >
                <Ionicons name="arrow-forward-outline" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.nextButtonText}>Next Question</Text>
              </TouchableOpacity>
            </Animated.View>
            ) : (
            <View style={styles.nextButtonPlaceholder} />
            )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212', 
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  preQuizIcon: {
    marginBottom: 25,
  },
  headerText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#EAEAEA',
    marginBottom: 15,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: 35,
    paddingHorizontal: 15,
    lineHeight: 23,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF', 
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12, 
    minWidth: '60%',
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  quizTopArea: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10, 
    position: 'absolute', 
    top: 0, 
    left: 20, 
    right: 20, 
    zIndex: 1, 
  },
  quizContentArea: { 
    flex: 1, 
    width: '100%',
    justifyContent: 'center', 
    alignItems: 'center',
    paddingTop: 60, 
    paddingBottom: 70, 
  },
  quizBottomArea: { 
    width: '100%',
    position: 'absolute',
    bottom: 10, 
    left: 20,
    right: 20,
    alignItems: 'center', 
  },
  progressText: {
    fontSize: 14,
    color: '#AAAAAA',
    fontWeight: '500',
  },
  scoreText: {
    fontSize: 14,
    color: '#AAAAAA',
    fontWeight: '500',
  },
  questionContainer: {
    backgroundColor: '#1E1E1E', 
    borderRadius: 15, 
    padding: 20,
    width: '100%',
    marginBottom: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333', 
  },
  definitionHintText: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  definitionText: {
    fontSize: 18,
    color: '#EAEAEA',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },
  choicesContainer: {
    width: '100%',
  },
  choiceButton: {
    backgroundColor: '#2C2C2C', 
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 55,
    borderWidth: 1,
    borderColor: '#444444',
  },
  choiceText: {
    fontSize: 16,
    color: '#E0E0E0',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedChoiceText: { 
    color: '#FFFFFF', 
    fontWeight: 'bold',
  },
  disabledChoiceText: { 
    color: '#777777',
  },
  correctChoice: {
    backgroundColor: '#4CAF50', 
    borderColor: '#388E3C',     
  },
  incorrectChoice: {
    backgroundColor: '#F44336', 
    borderColor: '#D32F2F',     
  },
  revealedCorrectChoiceStyle: { 
    backgroundColor: 'transparent', 
    borderColor: '#4CAF50', 
    borderWidth: 2,
  },
  disabledChoice: {
    backgroundColor: '#222222', 
    borderColor: '#333333',
    opacity: 0.6, 
  },
  nextButton: {
    backgroundColor: '#007AFF', 
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '70%',
    alignSelf: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  nextButtonPlaceholder: { 
    minHeight: 50, 
  },
  placeholderText: { 
    fontSize: 16,
  },
  cardShadow: { 
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4, // for Android
  },
});
