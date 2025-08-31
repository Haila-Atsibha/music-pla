import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import Homepage from "./homepage"
import { fetchSongs } from "../lib/music-api";
import { useState, useEffect } from "react";
import BottomPlayerBar from "../components/BottomPlayerBar";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(null);
    const [songs, setSongs] = useState([]);
    const [filteredSongs, setFilteredSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
  
    // Fetch songs on component mount
    useEffect(() => {
      fetchSongsData();
    }, []);
  
    // Filter songs based on search query
    useEffect(() => {
      if (!searchQuery.trim()) {
        setFilteredSongs(songs);
      } else {
        const filtered = songs.filter(song => 
          song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.album?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredSongs(filtered);
      }
    }, [searchQuery, songs]);
  
    const fetchSongsData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchSongs();
        setSongs(data.songs || []);
        setFilteredSongs(data.songs || []);
      } catch (error) {
        console.error('Error fetching songs:', error);
        // You could show a user-friendly error message here
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleSearch = (e) => {
      e.preventDefault();
      // Search is handled by the useEffect above
    };
  
   const handleSongPlay = (song) => {
  const index = filteredSongs.findIndex(s => s.id === song.id);
  if (index !== -1) setCurrentIndex(index);
};

  return (
    <>
<Homepage songs={filteredSongs.slice(0,3)} onSongPlay={handleSongPlay} searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> 
    {currentIndex !== null && (
  <BottomPlayerBar
    playlist={filteredSongs}
    currentIndex={currentIndex}
    setCurrentIndex={setCurrentIndex}
    artist={filteredSongs[currentIndex]?.artist}
    onClose={() => setCurrentIndex(null)}
  />
)}
</>
 );

}
