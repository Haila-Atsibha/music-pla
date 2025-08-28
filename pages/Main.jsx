
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { FaSearch } from "react-icons/fa";
import SongsList from "./FetchExample.jsx";
import BottomPlayerBar from "../components/BottomPlayerBar";
import { fetchSongs } from "../lib/music-api";

export default function Homemain() {
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
  const index = songs.findIndex(s => s.id === song.id);
  if (index !== -1) setCurrentIndex(index);
};


  return (
    <div className="flex min-h-screen bg-[#24293E]">
      <Sidebar />
      <main className="flex-1 pl-56 bg-cover min-h-screen pb-28">
        <div className="p-6">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="w-full h-10 sm:h-12 rounded-2xl border-2 border-[#8EBBFF] bg-[#24293E] text-[#F4F5FC] pl-4 pr-10 placeholder-[#CCCCCC] focus:outline-none focus:ring-2 focus:ring-[#8EBBFF] focus:ring-offset-1 transition-all duration-300"
              placeholder="Search songs, artists, albums..."
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8EBBFF] hover:text-[#F4F5FC] transition-colors duration-300">
              <FaSearch />
            </button>
          </form>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-[#8EBBFF] text-lg">Loading songs...</div>
            </div>
          ) : (
            <SongsList 
              songs={filteredSongs} 
              onSongPlay={handleSongPlay}
              searchQuery={searchQuery}
            />
          )}
        </div>
      </main>
{currentIndex !== null && (
  <BottomPlayerBar
    playlist={songs}                // <-- your fetched songs
    currentIndex={currentIndex}     // <-- current song index
    setCurrentIndex={setCurrentIndex}
    artist={songs[currentIndex]?.artist}
    onClose={() => setCurrentIndex(null)}
  />
)}
    </div>
  );
}