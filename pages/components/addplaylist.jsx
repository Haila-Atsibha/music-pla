import { FaPlus, FaCheck, FaList, FaTimes } from "react-icons/fa";
import { useState, useEffect } from "react";
import { fetchPlaylists, addSongToPlaylist } from "../../lib/music-api";

export default function Playlist({ songId }) {
  const [added, setAdded] = useState(false);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addedToPlaylist, setAddedToPlaylist] = useState("");

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
      
      // Find playlist name for success message
      const playlist = playlists.find(p => p.id === selectedPlaylist);
      setAddedToPlaylist(playlist?.name || 'Playlist');
      
      setAdded(true);
      setShowPlaylistSelector(false);
      setSelectedPlaylist("");
      
      // Reset after a few seconds
      setTimeout(() => {
        setAdded(false);
        setAddedToPlaylist("");
      }, 3000);
    } catch (error) {
      if (error.message.includes('Authentication required')) {
        alert('Please log in to add songs to playlists');
        setShowPlaylistSelector(false);
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

  const handlePlaylistSelect = (playlistId) => {
    setSelectedPlaylist(playlistId);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition duration-300 ${
          added ? "bg-green-600 text-white" : "bg-[#2A2F4F] text-[#F4F5FC] hover:bg-[#3A3F5F]"
        }`}
      >
        {added ? <FaCheck /> : <FaPlus />}
        {added ? `Added to ${addedToPlaylist}` : "Add to Playlist"}
      </button>

      {showPlaylistSelector && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2A2F4F] p-6 rounded-xl flex flex-col gap-4 min-w-[350px] max-w-[450px] max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#F4F5FC]">
                Add to Playlist
              </h2>
              <button
                onClick={handleCancel}
                className="text-[#8EBBFF] hover:text-[#F4F5FC] transition-colors p-1"
              >
                <FaTimes size={18} />
              </button>
            </div>
            
            {isLoading ? (
              <div className="text-center text-[#8EBBFF] py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8EBBFF] mx-auto mb-2"></div>
                Loading playlists...
              </div>
            ) : playlists.length === 0 ? (
              <div className="text-center text-[#8EBBFF] py-8">
                <FaList className="text-4xl mx-auto mb-3 opacity-50" />
                <div className="text-lg mb-2">No playlists available</div>
                <p className="text-sm text-[#CCCCCC]">Create a playlist first to add songs!</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      onClick={() => handlePlaylistSelect(playlist.id)}
                      className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200 ${
                        selectedPlaylist === playlist.id
                          ? 'bg-[#8EBBFF] text-[#23263A]'
                          : 'hover:bg-[#3A3F5F] text-[#F4F5FC]'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedPlaylist === playlist.id
                          ? 'border-[#23263A] bg-[#23263A]'
                          : 'border-[#8EBBFF]'
                      }`}>
                        {selectedPlaylist === playlist.id && (
                          <div className="w-2 h-2 rounded-full bg-[#8EBBFF]"></div>
                        )}
                      </div>
                      <FaList className={`${selectedPlaylist === playlist.id ? 'text-[#23263A]' : 'text-[#8EBBFF]'}`} />
                      <span className="flex-1 font-medium">{playlist.name}</span>
                      <span className={`text-xs ${selectedPlaylist === playlist.id ? 'text-[#23263A]' : 'text-[#8EBBFF]'}`}>
                        ({playlist.song_count})
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-3 justify-end pt-3 border-t border-[#3A3F5F]">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-[#3A3F5F] text-[#F4F5FC] rounded-lg hover:bg-[#4A4F6F] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddToPlaylist}
                    disabled={!selectedPlaylist || isAdding}
                    className="px-4 py-2 bg-[#8EBBFF] text-[#23263A] rounded-lg hover:bg-[#6FAFFF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isAdding ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#23263A]"></div>
                        Adding...
                      </>
                    ) : (
                      'Add to Playlist'
                    )}
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
