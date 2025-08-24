import { useState, useEffect } from "react";
import { FaList, FaPlus } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import BottomPlayerBar from "../components/BottomPlayerBar";
import MusicCard from "./Music";

export default function PlaylistPage() {
  const [playlists, setPlaylists] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);

  useEffect(() => {
    // Load playlists from localStorage (you can replace this with API call)
    const savedPlaylists = localStorage.getItem("playlists");
    if (savedPlaylists) {
      setPlaylists(JSON.parse(savedPlaylists));
    }
  }, []);

  const handleSongPlay = (song) => {
    setCurrentSong(song);
  };

  return (
    <div className="flex min-h-screen bg-[#24293E]">
      <Sidebar />
      <main className="flex-1 pl-56 bg-cover min-h-screen pb-28">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-[#F4F5FC] flex items-center gap-3">
              <FaList className="text-[#8EBBFF]" />
              My Playlists
            </h1>
            <button className="bg-[#8EBBFF] hover:bg-[#6FAFFF] text-[#23263A] px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2">
              <FaPlus /> Create Playlist
            </button>
          </div>

          {playlists.length === 0 ? (
            <div className="text-center py-16">
              <FaList className="text-6xl text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-[#F4F5FC] mb-2">No playlists yet</p>
              <p className="text-[#8EBBFF]">Create your first playlist!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playlists.map((playlist) => (
                <div key={playlist.id} className="bg-[#2A2F4F] p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-[#F4F5FC] mb-2">{playlist.name}</h3>
                  <p className="text-[#8EBBFF] mb-4">{playlist.songs?.length || 0} songs</p>
                  <div className="grid grid-cols-2 gap-2">
                    {playlist.songs?.slice(0, 4).map((song) => (
                      <div key={song.id} onClick={() => handleSongPlay(song)}>
                        <MusicCard
                          id={song.id}
                          src={song.storage_url}
                          title={song.title}
                          image={song.cover_url}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomPlayerBar song={currentSong} artist={currentSong?.artist} />
    </div>
  );
}
