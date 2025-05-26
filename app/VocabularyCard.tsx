import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

export interface VocabularyItem {
  id: string;
  word: string;
  definition: string;
  example: string;
}

interface VocabularyCardProps {
  item: VocabularyItem;
}

const { height, width } = Dimensions.get('window');

const VocabularyCard: React.FC<VocabularyCardProps> = ({ item }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.contentContainer}>
        <Text style={styles.wordText}>{item.word}</Text>
        <Text style={styles.definitionText}>{item.definition}</Text>
        <Text style={styles.exampleText}>"{item.example}"</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: width, // Full screen width
    height: height, // Full screen height
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Pure white background for the entire card view
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%', // Content takes 90% of width for some side padding
    maxWidth: 500, // Max width for very large screens
    paddingHorizontal: 20,
  },
  wordText: {
    fontSize: 52, // Slightly larger
    fontWeight: '700', // Bolder
    textAlign: 'center',
    marginBottom: 35, // Increased margin
    color: '#1A1A1A', // Very dark grey, almost black for strong presence
  },
  definitionText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 25,
    color: '#4A4A4A', // Medium-dark grey for definition
    fontStyle: 'normal', // Removing italic for a cleaner look, can be re-added if preferred
    lineHeight: 30, // Improved readability
  },
  exampleText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#7B7B7B', // Lighter grey for example sentence
    lineHeight: 28, // Improved readability
    fontStyle: 'italic', // Keep italic for example to differentiate
  },
});

export default VocabularyCard;
