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
    backgroundColor: '#121212', // Dark background for the card
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
    color: '#EAEAEA', // Light color for word text
  },
  definitionText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 25,
    color: '#B0B0B0', // Medium light color for definition
    fontStyle: 'normal', // Removing italic for a cleaner look, can be re-added if preferred
    lineHeight: 30, // Improved readability
  },
  exampleText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#888888', // Softer light color for example
    lineHeight: 28, // Improved readability
    fontStyle: 'italic', // Keep italic for example to differentiate
  },
});

export { VocabularyCard };
