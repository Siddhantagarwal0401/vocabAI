import { Text, View, FlatList, StyleSheet, Dimensions, SafeAreaView, StatusBar } from "react-native";
import VocabularyCard, { VocabularyItem } from './VocabularyCard'; // Import the card and its type

// Sample Vocabulary Data
const vocabularyData: VocabularyItem[] = [
  {
    id: '1',
    word: 'Ephemeral',
    definition: 'Lasting for a very short time.',
    example: 'The beauty of the cherry blossoms is ephemeral, enjoyed for only a few weeks each spring.',
  },
  {
    id: '2',
    word: 'Ubiquitous',
    definition: 'Present, appearing, or found everywhere.',
    example: 'Smartphones have become ubiquitous in modern society.',
  },
  {
    id: '3',
    word: 'Serendipity',
    definition: 'The occurrence and development of events by chance in a happy or beneficial way.',
    example: 'Discovering the old bookstore was a moment of pure serendipity.',
  },
  {
    id: '4',
    word: 'Mellifluous',
    definition: '(Of a voice or words) sweet or musical; pleasant to hear.',
    example: 'The singer captivated the audience with her mellifluous voice.',
  },
  {
    id: '5',
    word: 'Quintessential',
    definition: 'Representing the most perfect or typical example of a quality or class.',
    example: 'A warm apple pie is the quintessential American dessert.',
  },
];

const { height } = Dimensions.get('window');

export default function Index() {
  const renderItem = ({ item }: { item: VocabularyItem }) => (
    <VocabularyCard item={item} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={vocabularyData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled // This enables the swipe-card effect
        showsVerticalScrollIndicator={false}
        snapToAlignment={'start'}
        decelerationRate={'fast'}
        snapToInterval={height} // Snap to full height of the screen
        style={styles.flatList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Or a common background for all cards if VocabularyCard doesn't have one
  },
  flatList: {
    flex: 1,
  },
});
