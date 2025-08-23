// pages/context/FavoritesContext.jsx
import { createContext, useContext, useState } from "react";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (song) => {
    setFavorites((prev) => {
      const exists = prev.find((s) => s.id === song.id);
      if (exists) {
        return prev.filter((s) => s.id !== song.id); // remove
      } else {
        return [...prev, song]; // add
      }
    });
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
