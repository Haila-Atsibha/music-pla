import { FaPlus, FaCheck, FaList } from "react-icons/fa";
import { useState, useEffect } from "react";
import { fetchPlaylists, addSongToPlaylist } from "../../lib/music-api";

export default function Playlist({ songId }) {
  const [added, setAdded] = useState(false);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchPlaylistsData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchPlaylists();
      setPlaylists(data.playlists || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      if (error.message.includes('Authentication required')) {
        alert('Please log in to manage playlists');
      } else {
        alert('Failed to load playlists');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    setShowPlaylistSelector(true);
    fetchPlaylistsData();
  };

  const handleAddToPlaylist = async () => {
    if (!selectedPlaylist || !songId) return;

    try {
      setIsAdding(true);
      await addSongToPlaylist(selectedPlaylist, songId);
      setAdded(true);
      setShowPlaylistSelector(false);
      setSelectedPlaylist("");
      // Reset after a few seconds
      setTimeout(() => setAdded(false), 3000);
    } catch (error) {
      if (error.message.includes('Authentication required')) {
        alert('Please log in to add songs to playlists');
      } else {
        alert(error.message || 'Failed to add song to playlist');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setShowPlaylistSelector(false);
    setSelectedPlaylist("");
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition duration-300 ${
          added ? "bg-green-600 text-white" : "bg-gray-800 text-gray-200 hover:bg-gray-700"
        }`}
      >
        {added ? <FaCheck /> : <FaPlus />}
        {added ? "Added" : "Add to Playlist"}
      </button>

      {showPlaylistSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2A2F4F] p-6 rounded-xl flex flex-col gap-4 min-w-[300px] max-w-[400px]">
            <h2 className="text-lg font-bold text-[#F4F5FC] text-center">
              Add to Playlist
            </h2>
            
            {isLoading ? (
              <div className="text-center text-[#8EBBFF] py-4">Loading playlists...</div>
            ) : playlists.length === 0 ? (
              <div className="text-center text-[#8EBBFF] py-4">
                No playlists available. Create one first!
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {playlists.map((playlist) => (
                    <label key={playlist.id} className="flex items-center gap-3 cursor-pointer hover:bg-[#3A3F5F] p-2 rounded transition-colors">
                      <input
                        type="radio"
                        name="playlist"
                        value={playlist.id}
                        checked={selectedPlaylist === playlist.id}
                        onChange={(e) => setSelectedPlaylist(e.target.value)}
                        className="text-[#8EBBFF]"
                      />
                      <FaList className="text-[#8EBBFF]" />
                      <span className="text-[#F4F5FC]">{playlist.name}</span>
                      <span className="text-xs text-[#8EBBFF] ml-auto">({playlist.song_count})</span>
                    </label>
                  ))}
                </div>
                
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-[#3A3F5F] text-[#F4F5FC] rounded hover:bg-[#4A4F6F] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddToPlaylist}
                    disabled={!selectedPlaylist || isAdding}
                    className="px-4 py-2 bg-[#8EBBFF] text-[#23263A] rounded hover:bg-[#6FAFFF] transition-colors disabled:opacity-50"
                  >
                    {isAdding ? "Adding..." : "Add to Playlist"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
