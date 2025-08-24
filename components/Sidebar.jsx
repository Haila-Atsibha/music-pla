import Link from "next/link";
import { useState, useEffect } from "react";
import { FaMusic, FaHeart, FaList, FaHistory, FaPlus, FaTrash } from "react-icons/fa";
import { fetchPlaylists, createPlaylist, deletePlaylist } from "../lib/music-api";

export default function Sidebar() {
  const [playlists, setPlaylists] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlaylistsData();
  }, []);

  const fetchPlaylistsData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchPlaylists();
      setPlaylists(data.playlists || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      if (error.message.includes('Authentication required')) {
        // User needs to log in, but we'll show empty state instead of redirecting
        setPlaylists([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      setIsCreating(true);
      await createPlaylist({ name: newPlaylistName.trim() });
      setNewPlaylistName("");
      setShowCreateForm(false);
      fetchPlaylistsData(); // Refresh the list
    } catch (error) {
      if (error.message.includes('Authentication required')) {
        alert('Please log in to create playlists');
      } else {
        alert(error.message || 'Failed to create playlist');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    try {
      await deletePlaylist(playlistId);
      fetchPlaylistsData(); // Refresh the list
    } catch (error) {
      if (error.message.includes('Authentication required')) {
        alert('Please log in to manage playlists');
      } else {
        alert(error.message || 'Failed to delete playlist');
      }
    }
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-[#23263A] text-[#F4F5FC] flex flex-col py-8 px-4 shadow-xl z-40 overflow-y-auto">
      <nav className="flex flex-col gap-6">
        <Link href="/Main" className="flex items-center gap-3 text-lg hover:text-[#8EBBFF] transition">
          <FaMusic /> Music
        </Link>
        <Link href="/favorites" className="flex items-center gap-3 text-lg hover:text-[#8EBBFF] transition">
          <FaHeart /> Favorites
        </Link>
        <Link href="/history" className="flex items-center gap-3 text-lg hover:text-[#8EBBFF] transition">
          <FaHistory /> History
        </Link>
        
        {/* Playlists Section */}
        <div className="border-t border-[#3A3F5F] pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-[#8EBBFF]">Playlists</h3>
            <button
              onClick={() => setShowCreateForm(true)}
              className="text-[#8EBBFF] hover:text-[#F4F5FC] transition-colors"
            >
              <FaPlus size={16} />
            </button>
          </div>
          
          {/* Create Playlist Form */}
          {showCreateForm && (
            <div className="mb-4 p-4 bg-[#2A2F4F] rounded-lg border border-[#8EBBFF]">
              <form onSubmit={handleCreatePlaylist} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#8EBBFF] mb-1">
                    Playlist Name
                  </label>
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Enter playlist name"
                    className="w-full px-3 py-2 bg-[#24293E] border border-[#8EBBFF] rounded-lg text-sm text-[#F4F5FC] placeholder-[#8EBBFF] focus:outline-none focus:ring-2 focus:ring-[#8EBBFF] focus:ring-opacity-50 transition-all"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isCreating || !newPlaylistName.trim()}
                    className="px-3 py-2 bg-[#8EBBFF] text-[#23263A] rounded-lg text-sm hover:bg-[#6FAFFF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#23263A]"></div>
                        Creating...
                      </>
                    ) : (
                      'Create Playlist'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewPlaylistName("");
                    }}
                    className="px-3 py-2 bg-[#3A3F5F] text-[#F4F5FC] rounded-lg text-sm hover:bg-[#4A4F6F] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Playlists List */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center text-[#8EBBFF] text-sm py-2">Loading...</div>
            ) : playlists.length > 0 ? (
              playlists.map((playlist) => (
                <div key={playlist.id} className="flex items-center justify-between group">
                  <Link 
                    href={`/playlist/${playlist.id}`}
                    className="flex-1 text-sm hover:text-[#8EBBFF] transition-colors truncate"
                  >
                    <FaList className="inline mr-2" />
                    {playlist.name}
                    <span className="text-xs text-[#8EBBFF] ml-2">({playlist.song_count})</span>
                  </Link>
                  <button
                    onClick={() => handleDeletePlaylist(playlist.id)}
                    className="opacity-0 group-hover:opacity-100 text-[#8EBBFF] hover:text-[#6FAFFF] transition-all p-1 rounded hover:bg-[#3A3F5F]"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-xs text-[#8EBBFF] opacity-70 text-center py-2">
                No playlists yet
              </div>
            )}
          </div>
        </div>
      </nav>
    </aside>
  );
}
