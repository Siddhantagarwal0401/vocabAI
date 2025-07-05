import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Text, View, FlatList, StyleSheet, Dimensions, SafeAreaView, StatusBar, ActivityIndicator, TouchableOpacity, Platform } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { VocabularyCard, type VocabularyItem } from './VocabularyCard';

const { height, width } = Dimensions.get('window');
const isSmallDevice = width < 375 || height < 700;
const isTablet = width > 768;

// --- Responsive Scaling Utilities ---
const BASE_WIDTH = 390; // Base width (iPhone 12/13/14)
const scale = (size: number) => (width / BASE_WIDTH) * size;
// Moderate scale for fonts and UI elements that shouldn't scale too aggressively
const moderateScale = (size: number, factor = 0.3) => size + (scale(size) - size) * factor;
const BATCH_SIZE = 15; // Number of words to fetch details for at a time
const SEED_WORDS = [
  // More Advanced / Less Common SAT-Relevant Terms
  'abnegation', 'aggrandize', 'alacrity', 'anathema', 'antipathy', 'apocryphal', 'approbation',
  'arrogate', 'asceticism', 'assiduous', 'augury', 'autocratic', 'bilious', 'blandishment',
  'bombastic', 'boorish', 'cajole', 'calumny', 'capitulate', 'cavil', 'celerity', 'chary',
  'chicanery', 'churlish', 'circumlocution', 'clairvoyant', 'cogitate', 'cognoscenti',
  'comport', 'contumacious', 'convivial', 'corpulent', 'cupidity', 'dearth', 'debilitate',
  'decorous', 'demagogue', 'denizen', 'deprecate', 'derision', 'desiccated', 'desultory',
  'diaphanous', 'diffidence', 'dilatory', 'disaffected', 'disapprobation', 'discomfit',
  'dissemble', 'dogmatic', 'ebullience', 'effrontery', 'emollient', 'encomium', 'endemic',
  'enervate', 'engender', 'epistemology', 'equanimity', 'equivocate', 'erudite', 'evanescent',
  'exacerbate', 'exculpate', 'execrable', 'exigent', 'expatiate', 'expurgate', 'extemporaneous',
  'factious', 'fatuous', 'feckless', 'fecund', 'flagitious', 'florid', 'fractious', 'fulminate',
  'furtive', 'gainsay', 'garrulous', 'germane', 'grandiloquent', 'hegemony', 'heretical',
  'ignominious', 'impecunious', 'imperious', 'imperturbable', 'implacable', 'impugn',
  'inchoate', 'incontrovertible', 'indefatigable', 'indolent', 'ineffable', 'ineluctable',
  'inexorable', 'ingenuous', 'inimical', 'iniquity', 'insipid', 'insolvent', 'insouciant',
  'intransigent', 'inured', 'invective', 'irascible', 'jejune', 'kismet', 'kowtow', 'largesse',
  'lassitude', 'libertine', 'limpid', 'loquacious', 'lugubrious', 'maladroit', 'malinger',
  'martinet', 'mawkish', 'mellifluous', 'mendacious', 'mercurial', 'misanthrope', 'mitigate',
  'modicum', 'munificent', 'myopic', 'nadir', 'nascent', 'nebulous', 'neophyte', 'noisome',
  'nonplussed', 'obdurate', 'obsequious', 'obstreperous', 'obtuse', 'officious', 'onerous',
  'opprobrium', 'ossify', 'ostracize', 'panacea', 'panegyric', 'paragon', 'parsimonious',
  'paucity', 'peccadillo', 'pellucid', 'penchant', 'penurious', 'peremptory', 'perfidious',
  'perfunctory', 'pernicious', 'perspicacious', 'pertinacious', 'phlegmatic', 'pithy',
  'platitude', 'plethora', 'polemical', 'prattle', 'precipitous', 'precocious', 'predilection',
  'prescient', 'prevaricate', 'probity', 'proclivity', 'prodigal', 'prodigious', 'profligate',
  'proliferate', 'prolix', 'promulgate', 'propinquity', 'propitious', 'prosaic', 'proscribe',
  'protean', 'protracted', 'provident', 'prurient', 'puerile', 'pugnacious', 'pulchritude',
  'punctilious', 'pusillanimous', 'quagmire', 'quell', 'querulousness', 'quiescent', 'quotidian',
  'raconteur', 'recalcitrance', 'recondite', 'redoubtable', 'refractory', 'relegate', 'reprobate',
  'repudiate', 'rescind', 'restive', 'reticent', 'reverent', 'rife', 'rubric', 'sacrosanct',
  'sagacious', 'salubrious', 'sanguine', 'sardonic', 'scurrilous', 'sedulous', 'sempiternal',
  'sinecure', 'solicitous', 'solipsistic', 'somnolent', 'sonorous', 'sophistry', 'soporific',
  'spartan', 'specious', 'splenetic', 'sporadic', 'spurious', 'staid', 'stentorian', 'stoic',
  'stolid', 'subjugate', 'subterfuge', 'succinct', 'sullen', 'supercilious', 'surfeit',
  'surreptitious', 'sycophant', 'tacit', 'tawdry', 'temerity', 'tendentious', 'tenuous',
  'terse', 'timorous', 'torpid', 'tractable', 'transient', 'transmute', 'trenchant',
  'trepidation', 'truculent', 'turbid', 'turgid', 'turpitude', 'ubiquity', 'umbrage',
  'unctuous', 'untenable', 'upbraid', 'urbane', 'usurp', 'vacuous', 'vapid', 'variegated',
  'vaunted', 'venal', 'venerate', 'veracious', 'verbose', 'verdant', 'verisimilitude',
  'vernacular', 'vestige', 'vicarious', 'vicissitude', 'vilify', 'vindicate', 'vindictive',
  'virtuoso', 'virulent', 'viscous', 'vitiate', 'vituperate', 'vociferous', 'voluble',
  'voracious', 'welter', 'winsome', 'wizened', 'xenophobia', 'yearn', 'zany'
];

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const [displayedWords, setDisplayedWords] = useState<VocabularyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For initial load
  const [isLoadingMore, setIsLoadingMore] = useState(false); // For subsequent loads
  const [error, setError] = useState<string | null>(null);
  const [hasRetried, setHasRetried] = useState(false);
  const seedWordIndexRef = useRef(0);
  const flatListRef = useRef<FlatList<VocabularyItem>>(null);

  const fetchWordDetails = useCallback(async (wordsToFetch: string[]): Promise<VocabularyItem[]> => {
    const promises = wordsToFetch.map(async (wordStr) => {
      try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${wordStr}`);
        if (!response.ok) {
          // Log a warning or error, but return null to not break Promise.all
          console.warn(`DictionaryAPI request failed for ${wordStr}: ${response.status}`);
          return null; 
        }
        const data = await response.json();

        if (data && data.length > 0 && data[0].word) {
          const entry = data[0];
          let definition = 'No definition found.';
          let example = 'No example sentence available.';
          let definitionFound = false;

          // Iterate through meanings and their definitions to find the first available example
          for (const meaning of entry.meanings || []) {
            for (const def of meaning.definitions || []) {
              if (!definitionFound) { // Capture the first definition encountered
                definition = def.definition || definition;
                definitionFound = true;
              }
              if (def.example) {
                // If an example is found, use its definition and example
                definition = def.definition || definition; // Prefer the definition associated with the example
                example = def.example;
                // Once an example is found, we can stop searching in this entry
                return {
                  id: entry.word,
                  word: entry.word,
                  definition,
                  example,
                };
              }
            }
          }
          // If no example was found after checking all definitions, return with the first definition found (or default)
          return {
            id: entry.word,
            word: entry.word,
            definition,
            example, // This will be 'No example sentence available.' if none was found
          };
        }
        console.warn(`No valid data structure for ${wordStr} from DictionaryAPI (e.g., word not found). Response:`, data);
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
      const currentSeedWord = SEED_WORDS[seedWordIndexRef.current];
      seedWordIndexRef.current = (seedWordIndexRef.current + 1) % SEED_WORDS.length;
      
      const DATAMUSE_POOL_SIZE = 150; // Fetch a larger pool for 'ml' query
      const MIN_WORD_LENGTH = 5;

      console.log(`Fetching words from Datamuse API using seed: '${currentSeedWord}'...`);
      const datamuseResponse = await fetch(
        `https://api.datamuse.com/words?ml=${currentSeedWord}&max=${DATAMUSE_POOL_SIZE}`
      );

      if (!datamuseResponse.ok) {
        throw new Error(
          `Failed to fetch words from Datamuse API (seed: ${currentSeedWord}): ${datamuseResponse.status} ${await datamuseResponse.text()}`
        );
      }

      const datamuseWordsResult = await datamuseResponse.json();

      if (!datamuseWordsResult || !Array.isArray(datamuseWordsResult) || datamuseWordsResult.length === 0) {
        console.warn(`Datamuse API returned no words or an unexpected format for seed: '${currentSeedWord}'.`);
        throw new Error(`Datamuse API returned no words for seed: '${currentSeedWord}'.`);
      }

      // Filter words: single word, min length, not the seed word
      const filteredWords: string[] = datamuseWordsResult
        .map((item: any) => item.word)
        .filter((word: string) => {
          if (!word || word.includes(" ") || word.length < MIN_WORD_LENGTH) {
            return false;
          }
          return word.toLowerCase() !== currentSeedWord.toLowerCase();
        });

      if (filteredWords.length === 0) {
        console.warn(`No suitable words found after filtering from Datamuse pool (seed: '${currentSeedWord}'). Pool size before filtering: ${datamuseWordsResult.length}`);
        throw new Error(`No suitable words found after filtering for seed: '${currentSeedWord}'.`);
      }
      
      console.log(`Fetched ${filteredWords.length} suitable words from Datamuse pool (seed: '${currentSeedWord}').`);

      // Randomly select BATCH_SIZE words from the filtered pool
      const selectedRandomWords: string[] = [];
      const availableWords = [...filteredWords]; 

      const numWordsToPick = Math.min(BATCH_SIZE, availableWords.length);
      
      if (numWordsToPick === 0 && BATCH_SIZE > 0) {
         throw new Error(`No words available in the filtered pool to select from (seed: '${currentSeedWord}').`);
      }

      for (let i = 0; i < numWordsToPick; i++) {
        if (availableWords.length === 0) break; 
        const randomIndex = Math.floor(Math.random() * availableWords.length);
        selectedRandomWords.push(availableWords.splice(randomIndex, 1)[0]);
      }

      if (selectedRandomWords.length === 0 && BATCH_SIZE > 0) { 
        console.warn(`No words were selected from the Datamuse pool (seed: '${currentSeedWord}'). Filtered pool size: ${filteredWords.length}`);
        throw new Error(`Failed to select any random words after fetching from Datamuse (seed: '${currentSeedWord}').`);
      }
      
      console.log(`Selected ${selectedRandomWords.length} random words for details (seed: '${currentSeedWord}'):`, selectedRandomWords);

      const newVocabularyItems = await fetchWordDetails(selectedRandomWords);
      
      const existingWordIds = new Set(displayedWords.map(item => item.id));
      const uniqueNewItems = newVocabularyItems.filter(
        newItem => newItem && !existingWordIds.has(newItem.id)
      );

      if (uniqueNewItems.length > 0) {
        setDisplayedWords(prevWords => [...prevWords, ...uniqueNewItems]);
      } else if (newVocabularyItems.length > 0) {
        console.log(
          `Fetched new words (seed: '${currentSeedWord}'), but they were all duplicates or invalid after definition lookup.`
        );
      } else if (selectedRandomWords.length > 0) {
        console.log(`Fetched words (seed: '${currentSeedWord}'), but none had valid definitions or examples from DictionaryAPI.`);
      } else {
        console.log(`No words were processed (seed: '${currentSeedWord}', either not selected or BATCH_SIZE was 0).`);
      }

    } catch (e) {
      console.error("Error in loadMoreWords (Datamuse with seed words):", e);
      setError(e instanceof Error ? e.message : "An unknown error occurred while fetching new words.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, fetchWordDetails, displayedWords, BATCH_SIZE]); 

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

  // Handle retry functionality
  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setHasRetried(true);
    loadMoreWords().finally(() => setIsLoading(false));
  }, [loadMoreWords]);

  if (isLoading && displayedWords.length === 0) { 
    return (
      <SafeAreaView style={[styles.loadingContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ActivityIndicator size="large" color="#00DFD0" />
        <Text style={styles.loadingText}>Loading Vocabulary...</Text>
      </SafeAreaView>
    );
  }

  if (error && displayedWords.length === 0) { 
    return (
      <SafeAreaView style={[styles.loadingContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Ionicons name="cloud-offline-outline" size={moderateScale(60)} color="#FF7F50" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Ionicons name="refresh-outline" size={moderateScale(20)} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (displayedWords.length === 0 && !isLoading && !isLoadingMore) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Ionicons name="alert-circle-outline" size={moderateScale(60)} color="#FFA500" />
        <Text style={styles.loadingText}>No words found. Check your connection or try again.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Ionicons name="refresh-outline" size={moderateScale(20)} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <FlatList
        ref={flatListRef}
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
        removeClippedSubviews={Platform.OS === 'android'} // Only use on Android
        initialNumToRender={1}
      />
      {error && displayedWords.length > 0 && (
        <View style={[styles.errorToast, { bottom: insets.bottom + moderateScale(20) }]}>
          <Text style={styles.errorToastText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)} style={styles.dismissButton}>
            <Ionicons name="close" size={moderateScale(20)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
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
    paddingHorizontal: moderateScale(20),
  },
  loadingText: {
    marginTop: moderateScale(16),
    fontSize: moderateScale(16),
    color: '#C0C0C0',
    textAlign: 'center',
    maxWidth: '80%',
  },
  errorText: {
    marginTop: moderateScale(16),
    marginBottom: moderateScale(20),
    fontSize: moderateScale(16),
    color: '#FF7F50',
    textAlign: 'center',
    maxWidth: '80%',
  },
  footerLoadingContainer: {
    height: height, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    marginTop: moderateScale(20),
    backgroundColor: '#007AFF',
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(24),
    borderRadius: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  errorToast: {
    position: 'absolute',
    left: moderateScale(20),
    right: moderateScale(20),
    backgroundColor: 'rgba(255, 127, 80, 0.9)',
    borderRadius: moderateScale(12),
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: moderateScale(3) },
    shadowOpacity: 0.27,
    shadowRadius: moderateScale(4.65),
    elevation: moderateScale(6),
  },
  errorToastText: {
    color: '#FFFFFF',
    fontSize: moderateScale(14),
    fontWeight: '500',
    flex: 1,
    marginRight: moderateScale(10),
  },
  dismissButton: {
    padding: moderateScale(5),
  },
});
