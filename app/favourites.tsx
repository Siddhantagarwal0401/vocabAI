import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useFavourites } from '../context/FavouritesContext';
import { VocabularyItem } from './VocabularyCard';

// Component to render each favourite item (visible part)
const FavouriteListItem: React.FC<{ item: VocabularyItem }> = ({ item }) => {
  return (
    <View style={styles.favouriteItemContainer}>
      <View style={styles.favouriteTextContainer}>
        <Text style={styles.favouriteWord}>{item.word}</Text>
        <Text style={styles.favouriteDefinition}>{item.definition}</Text>
      </View>
    </View>
  );
};

export default function FavouritesScreen() {
  const { favourites, removeFavourite } = useFavourites();
  const insets = useSafeAreaInsets();

  const renderItem = (data: { item: VocabularyItem }) => (
    <FavouriteListItem item={data.item} />
  );

  const renderHiddenItem = (data: { item: VocabularyItem }, rowMap: any) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => {
          removeFavourite(data.item.id);
          rowMap[data.item.id]?.closeRow(); // Close the row after deleting
        }}
      >
        <Ionicons name="trash-outline" size={28} color="#FFF" style={styles.trashIcon} />
        <Text style={styles.backTextWhite}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

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
        <SwipeListView
          data={favourites}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-100} // How much the row opens to the right (revealing left-side button)
          previewRowKey={'0'} // Optional: Animate a row on first load
          previewOpenValue={-40}
          previewOpenDelay={3000}
          disableRightSwipe // Can be true if you only want left swipes
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          useNativeDriver={false} // Recommended for SwipeListView
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
    fontSize: 26,
    fontWeight: '600',
    color: '#EAEAEA',
    marginBottom: 25,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#E0E0E0',
    marginTop: 25,
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 16,
    color: '#A0A0A0',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 24,
  },
  favouriteItemContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 1,
  },
  favouriteTextContainer: {
    flex: 1,
    marginRight: 0,
  },
  favouriteWord: {
    fontSize: 20,
    fontWeight: '600',
    color: '#EAEAEA',
    marginBottom: 8,
  },
  favouriteDefinition: {
    fontSize: 15,
    color: '#B0B0B0',
    lineHeight: 22,
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#121212',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
    marginVertical: 10,
    marginHorizontal: 16,
    borderRadius: 15,
    overflow: 'hidden',
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 100,
  },
  backRightBtnRight: {
    backgroundColor: '#D9534F',
    right: 0,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  trashIcon: {
    marginBottom: 5,
  },
  backTextWhite: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
