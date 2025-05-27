import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, FlatList, StyleSheet, Dimensions, SafeAreaView, StatusBar, ActivityIndicator } from "react-native";
import { VocabularyCard, type VocabularyItem } from './VocabularyCard';

const { height } = Dimensions.get('window');
const BATCH_SIZE = 15; // Number of words to fetch details for at a time

export default function LearnScreen() {
  const [displayedWords, setDisplayedWords] = useState<VocabularyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For initial load
  const [isLoadingMore, setIsLoadingMore] = useState(false); // For subsequent loads
  const [error, setError] = useState<string | null>(null);

  const fetchWordDetails = useCallback(async (wordsToFetch: string[]): Promise<VocabularyItem[]> => {
    const promises = wordsToFetch.map(async (wordStr) => {
      try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${wordStr}`);
        if (!response.ok) {
          return null; 
        }
        const data = await response.json();
        if (data && data.length > 0 && data[0].word) { 
          const firstEntry = data[0];
          const firstMeaning = firstEntry.meanings?.[0];
          const firstDefinition = firstMeaning?.definitions?.[0];
          return {
            id: firstEntry.word, 
            word: firstEntry.word,
            definition: firstDefinition?.definition || 'No definition found.',
            example: firstDefinition?.example || 'No example sentence available.',
          };
        }
        console.warn(`No valid data structure for ${wordStr} from DictionaryAPI`);
        return null;
      } catch (err) {
        console.error(`Failed to fetch data for ${wordStr} (DictionaryAPI):`, err);
        return null;
      }
    });
    const results = await Promise.all(promises);
    return results.filter(item => item !== null) as VocabularyItem[];
  }, []);

  const loadMoreWords = useCallback(async () => {
    if (isLoadingMore) return; 

    setIsLoadingMore(true);
    setError(null); 

    try {
      const randomWordStringsResponse = await fetch(`https://random-word-api.herokuapp.com/word?number=${BATCH_SIZE}`);
      if (!randomWordStringsResponse.ok) {
        throw new Error(`Failed to fetch random words (RandomWordAPI): ${randomWordStringsResponse.status}`);
      }
      const randomWordStrings = await randomWordStringsResponse.json();

      if (!randomWordStrings || randomWordStrings.length === 0) {
        console.warn("Random word API returned no words or an unexpected format.");
        setIsLoadingMore(false);
        return;
      }

      const newVocabularyItems = await fetchWordDetails(randomWordStrings);
      
      const existingWordIds = new Set(displayedWords.map(item => item.id));
      const uniqueNewItems = newVocabularyItems.filter(newItem => 
        newItem && !existingWordIds.has(newItem.id)
      );

      if (uniqueNewItems.length > 0) {
        setDisplayedWords(prevWords => [...prevWords, ...uniqueNewItems]);
      } else if (newVocabularyItems.length > 0) {
        console.log("Fetched new words, but they were all duplicates or invalid after definition lookup.");
      }

    } catch (e) {
      console.error("Error loading more words:", e);
      setError(e instanceof Error ? e.message : "An unknown error occurred while fetching new words.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, fetchWordDetails, displayedWords]); 

  useEffect(() => {
    if (displayedWords.length === 0 && !isLoadingMore) { 
      setIsLoading(true); 
      loadMoreWords().finally(() => setIsLoading(false));
    }
  }, []); 


  const renderItem = useCallback(({ item }: { item: VocabularyItem }) => (
    <VocabularyCard item={item} />
  ), []);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: height, // Each item has the full screen height
    offset: height * index, // Offset from the top
    index,
  }), []); // height is a constant from Dimensions, so empty deps is fine here

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoadingContainer}>
        <ActivityIndicator size="large" color="#00DFD0" /> // Vibrant Teal loading indicator
      </View>
    );
  };

  if (isLoading && displayedWords.length === 0) { 
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00DFD0" /> // Vibrant Teal loading indicator
        <Text style={styles.loadingText}>Loading Vocabulary...</Text>
      </SafeAreaView>
    );
  }

  if (error && displayedWords.length === 0) { 
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (displayedWords.length === 0 && !isLoading && !isLoadingMore) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No words found. Check your connection or try again.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={displayedWords}
        extraData={displayedWords}
        renderItem={renderItem}
        keyExtractor={(item) => item.id} 
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment={'start'}
        decelerationRate={'fast'}
        snapToInterval={height}
        getItemLayout={getItemLayout}
        style={styles.flatList}
        onEndReached={loadMoreWords}
        onEndReachedThreshold={0.5} 
        ListFooterComponent={renderFooter}
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
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#C0C0C0', // Brighter loading text
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF7F50', // Coral error text
    textAlign: 'center',
  },
  footerLoadingContainer: {
    height: height, 
    justifyContent: 'center',
    alignItems: 'center',
  },
});
