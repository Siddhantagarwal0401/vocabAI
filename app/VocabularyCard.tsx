import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavourites } from '../context/FavouritesContext';

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
  const { addFavourite, removeFavourite, isFavourite } = useFavourites();
  const isFav = isFavourite(item.id);

  const toggleFavourite = () => {
    if (isFav) {
      removeFavourite(item.id);
    } else {
      addFavourite(item);
    }
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.contentOuterContainer}>
        {/* Favourite Button */}
        <TouchableOpacity onPress={toggleFavourite} style={styles.favouriteButton}>
          <Ionicons 
            name={isFav ? "heart" : "heart-outline"} 
            size={32} 
            color={isFav ? "#FF6B6B" : "#EAEAEA"} 
          />
        </TouchableOpacity>

        {/* Word at the top of the content block */}
        
        
        {/* ScrollView for definition and example */}
        <ScrollView 
          style={styles.scrollableContentContainer}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <Text 
            style={styles.wordText}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.5} // Prevents font from becoming too small
          >
            {item.word}
          </Text>
          <Text style={styles.definitionText}>{item.definition}</Text>
          {item.example && <Text style={styles.exampleText}>"{item.example}"</Text>}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: width,
    height: height,
    justifyContent: 'center', // Centers the contentOuterContainer vertically
    alignItems: 'center', // Centers the contentOuterContainer horizontally
    backgroundColor: '#121212',
    position: 'relative', // Needed for absolute positioning of the button
  },
  contentOuterContainer: {
    width: '90%',
    maxWidth: 500,
    height: '70%', // Takes up 70% of card height, leaving space above and below
    justifyContent: 'flex-start', // Aligns children from the top
    alignItems: 'center', // Centers children horizontally
  },
  wordText: {
    fontSize: 52,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 25,
    color: '#EAEAEA',
    paddingHorizontal: 20,
  },
  scrollableContentContainer: {
    width: '100%', // Takes full width of parent container
    flex: 1, // Takes remaining space after wordText
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center', // Center content vertically in scroll area
    alignItems: 'center', // Center content horizontally
    paddingBottom: 20,
  },
  definitionText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 25,
    color: '#B0B0B0',
    fontStyle: 'normal',
    lineHeight: 30,
  },
  exampleText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#888888',
    lineHeight: 28,
    fontStyle: 'italic',
  },
  favouriteButton: {
    position: 'absolute',
    top: 20, // Adjust as needed for placement from top of contentOuterContainer
    right: 20, // Adjust as needed for placement from right of contentOuterContainer
    zIndex: 1, // Ensure it's above other elements
    padding: 10, // Add some padding to make it easier to tap
  },
});

export { VocabularyCard };
