import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VocabularyItem } from '../app/VocabularyCard'; // Adjust path as necessary

interface FavouritesContextType {
  favourites: VocabularyItem[];
  addFavourite: (item: VocabularyItem) => void;
  removeFavourite: (itemId: string) => void;
  isFavourite: (itemId: string) => boolean;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

const FAVOURITES_STORAGE_KEY = '@vocabAI_favourites';

export const FavouritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favourites, setFavourites] = useState<VocabularyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favourites from AsyncStorage on mount
  useEffect(() => {
    const loadFavourites = async () => {
      try {
        const storedFavourites = await AsyncStorage.getItem(FAVOURITES_STORAGE_KEY);
        if (storedFavourites) {
          setFavourites(JSON.parse(storedFavourites));
        }
      } catch (error) {
        console.error('Failed to load favourites from storage:', error);
      }
      setIsLoading(false);
    };
    loadFavourites();
  }, []);

  // Save favourites to AsyncStorage whenever they change
  useEffect(() => {
    if (!isLoading) { // Only save after initial load is complete
      const saveFavourites = async () => {
        try {
          await AsyncStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify(favourites));
        } catch (error) {
          console.error('Failed to save favourites to storage:', error);
        }
      };
      saveFavourites();
    }
  }, [favourites, isLoading]);

  const addFavourite = (item: VocabularyItem) => {
    setFavourites((prevFavourites) => {
      if (prevFavourites.find(fav => fav.id === item.id)) {
        return prevFavourites; // Already a favourite
      }
      return [...prevFavourites, item];
    });
  };

  const removeFavourite = (itemId: string) => {
    setFavourites((prevFavourites) => prevFavourites.filter(fav => fav.id !== itemId));
  };

  const isFavourite = (itemId: string): boolean => {
    return favourites.some(fav => fav.id === itemId);
  };

  if (isLoading) {
    return null; // Or a loading spinner, but null is fine for context loading
  }

  return (
    <FavouritesContext.Provider value={{ favourites, addFavourite, removeFavourite, isFavourite }}>
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = (): FavouritesContextType => {
  const context = useContext(FavouritesContext);
  if (context === undefined) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
};
