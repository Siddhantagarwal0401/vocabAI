import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
const isSmallDevice = width < 375 || height < 700;

// --- Responsive Scaling Utilities ---
const BASE_WIDTH = 390; // A common base width (e.g., iPhone 12/13/14)
const scale = (size: number) => (width / BASE_WIDTH) * size;
// Moderate scale for fonts and UI elements that shouldn't scale too aggressively
const moderateScale = (size: number, factor = 0.3) => size + (scale(size) - size) * factor;
// --- End Responsive Scaling Utilities ---

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
        colors={['#00796B', '#FF7043']}
        style={styles.contentOuterContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Favourite Button */}
        <TouchableOpacity onPress={toggleFavourite} style={styles.favouriteButton}>
          <Ionicons 
            name={isFav ? "heart" : "heart-outline"} 
            size={moderateScale(32)} 
            color={isFav ? "#FFA726" : "#FFFFFF"} 
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
  // cardContainer, contentOuterContainer, etc. will be modified below to use moderateScale
  cardContainer: {
    width: width,
    height: height,
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#121212', 
    position: 'relative',
    // Added padding to prevent card from appearing too low on small devices
    paddingBottom: isSmallDevice ? moderateScale(40) : moderateScale(0),
  },
  contentOuterContainer: { 
    width: '90%',
    maxWidth: 500, // Keep maxWidth to prevent extreme width on tablets
    height: isSmallDevice ? '60%' : '70%', // Smaller height on small devices
    maxHeight: height * 0.75, // Ensure it never exceeds 75% of screen height
    justifyContent: 'flex-start', 
    alignItems: 'center',
    borderRadius: moderateScale(20), 
    paddingTop: moderateScale(2),
    paddingBottom: moderateScale(20),
    paddingHorizontal: moderateScale(20), 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: moderateScale(5) },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(10),
    elevation: moderateScale(8, 0.5),
    // Adjust vertical position based on device size
    marginTop: isSmallDevice ? moderateScale(-40) : 0,
  },
  wordText: {
    fontFamily: 'System', // Replace with your app's font if you have one
    fontWeight: 'bold',
    fontSize: moderateScale(isSmallDevice ? 34 : 38, 0.2), // Smaller base size on small devices
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: moderateScale(15),
    paddingHorizontal: moderateScale(10), // Added padding for very long words that scale down
  },
  scrollableContentContainer: {
    width: '100%', 
    flex: 1, 
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingBottom: moderateScale(20), // Ensures content doesn't stick to the very bottom if scrollable
  },
  definitionText: {
    fontSize: moderateScale(20), 
    textAlign: 'center',
    marginTop: moderateScale(20), 
    marginBottom: moderateScale(20), 
    color: '#E0E0E0',
    fontStyle: 'normal',
    lineHeight: moderateScale(30),
  },
  exampleText: {
    fontSize: moderateScale(18), 
    textAlign: 'center',
    marginTop: moderateScale(15), 
    color: '#C0C0C0',
    lineHeight: moderateScale(28),
    fontStyle: 'italic',
  },
  favouriteButton: {
    position: 'absolute',
    top: moderateScale(15),
    right: moderateScale(15),
    zIndex: 1,
    padding: moderateScale(8), // Added padding for easier touch
  },
});

export { VocabularyCard };
