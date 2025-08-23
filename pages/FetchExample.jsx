import { useEffect, useState } from "react";
import MusicCard from "./Music";
import { supabase } from "../lib/supabase"; // make sure you have this

export default function MusicPage() {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const fetchSongs = async () => {
      const { data, error } = await supabase.from("songs").select("*");
      if (error) console.log(error);
      else setSongs(data);
    };
    fetchSongs();
  }, []);

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {songs.map((song) => (
        <MusicCard
          key={song.id}
          id={song.id}              // <-- pass the Supabase song ID
          src={song.storage_url}
          title={song.title}
          image={song.cover_url}
        />
      ))}
    </div>
  );
}
