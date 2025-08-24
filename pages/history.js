import { useState, useEffect } from "react";
import { FaHistory, FaTrash } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import BottomPlayerBar from "../components/BottomPlayerBar";
import MusicCard from "./Music";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem("playHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleSongPlay = (song) => {
    setCurrentSong(song);
    
    // Add to history
    const newHistory = [song, ...history.filter(h => h.id !== song.id)].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem("playHistory", JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your listening history?")) {
      setHistory([]);
      localStorage.removeItem("playHistory");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#24293E]">
      <Sidebar />
      <main className="flex-1 pl-56 bg-cover min-h-screen pb-28">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-[#F4F5FC] flex items-center gap-3">
              <FaHistory className="text-[#8EBBFF]" />
              Listening History
            </h1>
            {history.length > 0 && (
              <button 
                onClick={clearHistory}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <FaTrash /> Clear History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-16">
              <FaHistory className="text-6xl text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-[#F4F5FC] mb-2">No listening history yet</p>
              <p className="text-[#8EBBFF]">Start playing some songs to build your history!</p>
            </div>
          ) : (
            <div>
              <div className="mb-4 text-[#8EBBFF]">
                {history.length} song{history.length !== 1 ? 's' : ''} in your history
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {history.map((song, index) => (
                  <div key={`${song.id}-${index}`} className="relative">
                    <div onClick={() => handleSongPlay(song)}>
                      <MusicCard
                        id={song.id}
                        src={song.storage_url}
                        title={song.title}
                        image={song.image || song.cover_url}
                        artist={song.artist}
                        album={song.album}
                      />
                    </div>
                    <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <BottomPlayerBar song={currentSong} artist={currentSong?.artist} />
    </div>
  );
}
