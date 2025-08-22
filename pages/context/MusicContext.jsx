"use client";
import { createContext, useContext, useState, useEffect } from "react";

const MusicContext = createContext();

export function MusicProvider({ children }) {
  const [likedSongs, setLikedSongs] = useState([]);
  const [playlistSongs, setPlaylistSongs] = useState([]);

  // load from localStorage
  useEffect(() => {
    const storedLiked = localStorage.getItem("likedSongs");
    const storedPlaylist = localStorage.getItem("playlistSongs");
    if (storedLiked) setLikedSongs(JSON.parse(storedLiked));
    if (storedPlaylist) setPlaylistSongs(JSON.parse(storedPlaylist));
  }, []);

  // save to localStorage whenever changed
  useEffect(() => {
    localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
  }, [likedSongs]);

  useEffect(() => {
    localStorage.setItem("playlistSongs", JSON.stringify(playlistSongs));
  }, [playlistSongs]);

  // toggle liked
  const toggleLike = (song) => {
    setLikedSongs((prev) =>
      prev.some((s) => s.id === song.id)
        ? prev.filter((s) => s.id !== song.id)
        : [...prev, song]
    );
  };

  const isLiked = (id) => likedSongs.some((s) => s.id === id);

  // toggle playlist
  const togglePlaylist = (song) => {
    setPlaylistSongs((prev) =>
      prev.some((s) => s.id === song.id)
        ? prev.filter((s) => s.id !== song.id)
        : [...prev, song]
    );
  };

  const isInPlaylist = (id) => playlistSongs.some((s) => s.id === id);

  return (
    <MusicContext.Provider
      value={{
        likedSongs,
        toggleLike,
        isLiked,
        playlistSongs,
        togglePlaylist,
        isInPlaylist,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  return useContext(MusicContext);
}
