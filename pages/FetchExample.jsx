import { useEffect, useState } from "react";
import MusicCard from "./Music";

export default function Home() {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    async function fetchSongs() {
      try {
        const res = await fetch("http://localhost:3000/api/songs");
        const data = await res.json();
        setSongs(data.songs); // backend sends { songs: [...] }
      } catch (err) {
        console.error("Error fetching songs:", err);
      }
    }
    fetchSongs();
  }, []);

  return (
    <div className="min-h-screen bg-cyan-900 p-6">
      <h1 className="text-2xl text-white mb-6">Songs</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {songs.map((song) => (
          <MusicCard
            key={song.id}
            src={song.storage_url}   // 🎵 audio file
            title={song.title}       // 📝 song title
            image={song.cover_url}   // 🎨 album cover
          />
        ))}
      </div>
    </div>
  );
}
