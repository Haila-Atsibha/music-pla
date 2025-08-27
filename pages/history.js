import { useState, useEffect } from "react";
import { FaHistory, FaTrash } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import BottomPlayerBar from "../components/BottomPlayerBar";
import MusicCard from "./Music";
import { fetchHistory } from "../lib/music-api";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchHistory();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      if (error.message.includes('Authentication required')) {
        // User needs to log in, show empty state
        setHistory([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSongPlay = (song) => {
    setCurrentSong(song);
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your listening history?")) {
      // Note: This would require a DELETE endpoint in the API
      // For now, we'll just clear the local state
      setHistory([]);
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
                className="bg-[#3A3F5F] hover:bg-[#4A4F6F] text-[#F4F5FC] px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 border border-[#8EBBFF] hover:border-[#6FAFFF]"
              >
                <FaTrash /> Clear History
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <div className="text-[#8EBBFF] text-lg">Loading history...</div>
            </div>
          ) : history.length === 0 ? (
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
                {history.map((entry, index) => (
                  <div key={`${entry.id}-${index}`} className="relative">
                    <MusicCard
                      id={entry.song.id}
                      src={entry.song.storage_url}
                      title={entry.song.title}
                      image={entry.song.cover_url}
                      artist={entry.song.artist}
                      album={entry.song.album}
                      onPlay={() => handleSongPlay(entry.song)}
                    />
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
      <BottomPlayerBar song={currentSong} artist={currentSong?.artist} onClose={() => setCurrentSong(null)} />
    </div>
  );
}
