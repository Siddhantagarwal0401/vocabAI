import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFavourites } from '../context/FavouritesContext';
import { VocabularyItem } from './VocabularyCard'; // Assuming VocabularyCard exports this type

// Component to render each favourite item
const FavouriteListItem: React.FC<{ item: VocabularyItem; onRemove: (id: string) => void }> = ({ item, onRemove }) => {
  return (
    <View style={styles.favouriteItemContainer}>
      <View style={styles.favouriteTextContainer}>
        <Text style={styles.favouriteWord}>{item.word}</Text>
        <Text style={styles.favouriteDefinition}>{item.definition}</Text>
      </View>
      <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.removeButton}>
        <Ionicons name="trash-bin-outline" size={24} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );
};

export default function FavouritesScreen() {
  const { favourites, removeFavourite } = useFavourites();
  const insets = useSafeAreaInsets();

  if (favourites.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={[styles.containerEmpty, { paddingTop: insets.top }]}>
          <Ionicons name="heart-dislike-outline" size={60} color="#B0B0B0" />
          <Text style={styles.emptyText}>No Favourites Yet</Text>
          <Text style={styles.emptySubText}>Tap the heart on a word card to save it here.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.containerList, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerText}>Your Favourites</Text>
        <FlatList
          data={favourites}
          renderItem={({ item }) => <FavouriteListItem item={item} onRemove={removeFavourite} />}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  containerEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  containerList: {
    flex: 1,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#EAEAEA',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#EAEAEA',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  favouriteItemContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  favouriteTextContainer: {
    flex: 1, // Allows text to take available space before button
    marginRight: 10, // Space before the remove button
  },
  favouriteWord: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EAEAEA',
    marginBottom: 5,
  },
  favouriteDefinition: {
    fontSize: 14,
    color: '#B0B0B0',
    lineHeight: 20,
  },
  removeButton: {
    padding: 8, // Make tap area larger
  },
});
