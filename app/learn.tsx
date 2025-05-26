import React, { useState, useEffect } from 'react';
import { Text, View, FlatList, StyleSheet, Dimensions, SafeAreaView, StatusBar, ActivityIndicator } from "react-native";
import { VocabularyCard, type VocabularyItem } from './VocabularyCard';

const { height } = Dimensions.get('window');

// Words to fetch from the API
const wordsToFetch = ["ephemeral", "ubiquitous", "serendipity", "mellifluous", "eloquent"];

export default function LearnScreen() {
  const [words, setWords] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVocabularyData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedWordsData: VocabularyItem[] = [];
        
        // Helper function to fetch and process a single word
        const fetchWord = async (word: string): Promise<VocabularyItem | null> => {
          try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            if (!response.ok) {
              // If response is not OK, but not a network error, log and skip
              console.warn(`API error for ${word}: ${response.status}`);
              return null;
            }
            const data = await response.json();
            
            if (data && data.length > 0) {
              const firstEntry = data[0];
              const firstMeaning = firstEntry.meanings?.[0];
              const firstDefinition = firstMeaning?.definitions?.[0];

              return {
                id: word, // Use the word itself as ID
                word: firstEntry.word,
                definition: firstDefinition?.definition || 'No definition found.',
                example: firstDefinition?.example || 'No example sentence available.',
              };
            }
            return null; // No data or unexpected structure
          } catch (err) {
            // Network errors or JSON parsing errors
            console.error(`Failed to fetch data for ${word}:`, err);
            return null; // Return null if a single word fetch fails
          }
        };

        const promises = wordsToFetch.map(word => fetchWord(word));
        const results = await Promise.all(promises);

        // Filter out any null results (due to errors for specific words)
        const validResults = results.filter(item => item !== null) as VocabularyItem[];
        setWords(validResults);

      } catch (err) {
        // This catch is for errors in Promise.all or other general errors
        console.error("Failed to load vocabulary data from API:", err);
        setError('Failed to load vocabulary. Please try again later.');
      }
      setLoading(false);
    };

    fetchVocabularyData();
  }, []);

  const renderItem = ({ item }: { item: VocabularyItem }) => (
    <VocabularyCard item={item} />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Fetching Words...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!words.length) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No words loaded. Check your connection or try again.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={words}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment={'start'}
        decelerationRate={'fast'}
        snapToInterval={height}
        style={styles.flatList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  flatList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    paddingHorizontal: 20, // Added padding for error messages
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B', // A reddish color for errors
    textAlign: 'center',
  },
});
