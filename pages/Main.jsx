
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { FaSearch } from "react-icons/fa";
import SongsList from "./FetchExample.jsx";
import BottomPlayerBar from "../components/BottomPlayerBar";

export default function Homemain() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSong, setCurrentSong] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
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
                console.log('Search query changed:', e.target.value); // Debug
                setSearchQuery(e.target.value);
              }}
              className="w-full h-10 sm:h-12 rounded-2xl border-2 border-[#8EBBFF] bg-[#24293E] text-[#F4F5FC] pl-4 pr-10 placeholder-[#CCCCCC] focus:outline-none focus:ring-2 focus:ring-[#8EBBFF] focus:ring-offset-1 transition-all duration-300"
              placeholder="Search songs, artists, albums..."
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8EBBFF] hover:text-[#F4F5FC] transition-colors duration-300">
              <FaSearch />
            </button>
          </form>
          <SongsList searchQuery={searchQuery} onSongPlay={setCurrentSong} />
        </div>
      </main>
      <BottomPlayerBar song={currentSong} artist={currentSong?.artist} />
    </div>
  );
}