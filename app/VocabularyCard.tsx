import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
      <LinearGradient
        colors={['#2A2A2A', '#1E1E1E']}
        style={styles.contentOuterContainer}
      >
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
            minimumFontScale={0.5} 
          >
            {item.word}
          </Text>
          <Text style={styles.definitionText}>{item.definition}</Text>
          {item.example && (
            <>
              <Text style={styles.exampleText}>"{item.example}"</Text>
            </>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: width,
    height: height,
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#121212', 
    position: 'relative',
  },
  contentOuterContainer: { 
    width: '90%',
    maxWidth: 500,
    height: '70%', 
    justifyContent: 'flex-start', 
    alignItems: 'center',
    borderRadius: 20, 
    paddingVertical: 30, 
    paddingHorizontal: 20, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  wordText: {
    fontSize: 46, 
    fontWeight: '600', 
    textAlign: 'center',
    marginBottom: 20, 
    color: '#EAEAEA',
  },
  scrollableContentContainer: {
    width: '100%', 
    flex: 1, 
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingBottom: 20,
  },
  definitionText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20, 
    marginBottom: 20, 
    color: '#B0B0B0',
    fontStyle: 'normal',
    lineHeight: 30,
  },
  exampleText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 15, 
    color: '#888888',
    lineHeight: 28,
    fontStyle: 'italic',
  },
  favouriteButton: {
    position: 'absolute',
    top: 25, 
    right: 25, 
    zIndex: 1, 
    padding: 10, 
  },
});

export { VocabularyCard };
