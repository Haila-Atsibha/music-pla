import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FaArrowLeft, FaPlay, FaTrash } from "react-icons/fa";
import MusicCard from "../Music";
import BottomPlayerBar from "../../components/BottomPlayerBar";
import { fetchPlaylists, deletePlaylist, removeSongFromPlaylist } from "../../lib/music-api";

export default function PlaylistDetail() {
  const router = useRouter();
  const { playlistId } = router.query;
  const [playlist, setPlaylist] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (playlistId) {
      fetchPlaylistData();
    }
  }, [playlistId]);

  const fetchPlaylistData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchPlaylists(true); // Include songs
      const foundPlaylist = data.playlists.find(p => p.id === playlistId);
      if (foundPlaylist) {
        setPlaylist(foundPlaylist);
      } else {
        router.push('/Main');
      }
    } catch (error) {
      console.error('Error fetching playlist:', error);
      if (error.message.includes('Authentication required')) {
        alert('Please log in to view playlists');
        router.push('/login');
      } else {
        router.push('/Main');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSongPlay = (song) => {
    setCurrentSong(song);
  };

  const handleRemoveSong = async (songId) => {
    if (!confirm('Remove this song from the playlist?')) return;

    try {
      await removeSongFromPlaylist(playlistId, songId);
      // Refresh the playlist
      fetchPlaylistData();
    } catch (error) {
      if (error.message.includes('Authentication required')) {
        alert('Please log in to manage playlists');
        router.push('/login');
      } else {
        alert(error.message || 'Failed to remove song');
      }
    }
  };

  const handleDeletePlaylist = async () => {
    if (!confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) return;

    try {
      setIsDeleting(true);
      await deletePlaylist(playlistId);
      router.push('/Main');
    } catch (error) {
      if (error.message.includes('Authentication required')) {
        alert('Please log in to manage playlists');
        router.push('/login');
      } else {
        alert(error.message || 'Failed to delete playlist');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#24293E] flex items-center justify-center">
        <div className="text-[#8EBBFF] text-lg">Loading playlist...</div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-[#24293E] flex items-center justify-center">
        <div className="text-[#8EBBFF] text-lg">Playlist not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#24293E] pb-28">
      {/* Header */}
      <div className="bg-[#23263A] p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/Main')}
                className="text-[#8EBBFF] hover:text-[#F4F5FC] transition-colors"
              >
                <FaArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-[#F4F5FC]">{playlist.name}</h1>
                {playlist.description && (
                  <p className="text-[#8EBBFF] mt-1">{playlist.description}</p>
                )}
                <p className="text-[#CCCCCC] text-sm mt-1">
                  {playlist.song_count || 0} song{(playlist.song_count || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={handleDeletePlaylist}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <FaTrash size={16} />
              {isDeleting ? 'Deleting...' : 'Delete Playlist'}
            </button>
          </div>
        </div>
      </div>

      {/* Songs */}
      <div className="max-w-7xl mx-auto p-6">
        {playlist.songs && playlist.songs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlist.songs.map((song) => (
              <div key={song.id} className="relative group">
                <MusicCard
                  id={song.id}
                  src={song.storage_url}
                  title={song.title}
                  image={song.cover_url}
                  artist={song.artist}
                  album={song.album}
                  onPlay={() => handleSongPlay(song)}
                />
                {/* Remove button overlay */}
                <button
                  onClick={() => handleRemoveSong(song.id)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-[#8EBBFF] text-xl mb-4">No songs in this playlist yet</div>
            <p className="text-[#CCCCCC]">Add some songs to get started!</p>
          </div>
        )}
      </div>

      {/* Bottom Player Bar */}
      <BottomPlayerBar song={currentSong} artist={currentSong?.artist} />
    </div>
  );
}
