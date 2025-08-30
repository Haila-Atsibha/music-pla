// pages/favorites.js
import { useState, useEffect } from "react";
import MusicCard from "./Music";
import Sidebar from "../components/Sidebar";
import BottomPlayerBar from "../components/BottomPlayerBar";
import { FaHeart } from "react-icons/fa";
import Liked from "./components/Liked";
import { supabase } from "../lib/supabase";

export default function FavoritesPage() {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch all liked songs
  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("You must be logged in");

      const res = await fetch("/api/favorites", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`, // 👈 required for auth
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      setSongs(data);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setError("Failed to load favorites. Make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleSongPlay = (song) => setCurrentSong(song);

  // Refresh favorites when a song is liked/unliked

const handleLikeChange = () => {
  fetchFavorites(); // re-fetch favorites list
};


  return (
    <div className="flex min-h-screen bg-[#24293E]">
      <Sidebar />
      <main className="flex-1 pl-56 bg-cover min-h-screen pb-28">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-[#F4F5FC] flex items-center gap-3">
              <FaHeart className="text-red-500" />
              My Favorites
            </h1>
            {songs.length > 0 && (
              <div className="text-[#8EBBFF]">
                {songs.length} favorite{songs.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {loading ? (
            <p className="text-[#F4F5FC]">Loading favorites...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : songs.length === 0 ? (
            <div className="text-center py-16">
              <FaHeart className="text-6xl text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-[#F4F5FC] mb-2">No favorite songs yet</p>
              <p className="text-[#8EBBFF]">Start adding songs to your favorites!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {songs.map((song) => (
                <MusicCard
                  key={song.id}
                  id={song.id}
                  src={song.storage_url}
                  title={song.title}
                  image={song.cover_url}
                  artist={song.artist}
                  album={song.album}
                  onPlay={() => handleSongPlay(song)}
                >
                  <Liked songId={song.id} onChange={handleLikeChange} />
                </MusicCard>
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomPlayerBar
        song={currentSong}
        artist={currentSong?.artist}
        onClose={() => setCurrentSong(null)}
      />
    </div>
  );
}
