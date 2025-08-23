import { useState, useEffect } from "react";
import MusicCard from "./Music";
import { supabase } from "../lib/supabase";
import Drawer from "./drawer";
import { FaBars, FaSearch } from "react-icons/fa";
import Link from "next/link"; 

export default function FavoritesPage() {
  const [songs, setSongs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  function displayDrawer() {
    setIsOpen(prev => {
      const newState = !prev;
      console.log(newState ? "opened" : "closed");
      return newState;
    });
  }

  useEffect(() => {
    const fetchFavorites = async () => {
      const favoriteIds = JSON.parse(localStorage.getItem("favorites") || "[]");
      if (favoriteIds.length === 0) return setSongs([]);

      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .in("id", favoriteIds);

      if (error) console.log(error);
      else setSongs(data);
    };

    fetchFavorites();
  }, []);

  return (
    <>
      <header className="bg-[#24293E] text-[#F4F5FC] w-full h-20 flex items-center px-4 sm:px-6 lg:px-8">
        {/* Left Menu */}
        <button
          className="px-3 py-2 bg-[hsl(216,93%,50%)] text-[#24293E] rounded-lg hover:bg-[#6FAFFF] transition mr-4 flex items-center gap-2"
          onClick={displayDrawer}
        >
          <FaBars />Menu
        </button>

        {/* Center area */}
        <div className="flex flex-1 items-center gap-4">
          <Link href={"/"} className="whitespace-nowrap hover:text-[#8EBBFF] transition">
            Music
          </Link>

          <div className="relative flex-1">
            <input
              type="text"
              className="w-full h-10 sm:h-12 rounded-2xl border-2 border-[#8EBBFF] bg-[#24293E] text-[#F4F5FC] pl-4 pr-10 placeholder-[#CCCCCC] focus:outline-none focus:ring-2 focus:ring-[#8EBBFF] focus:ring-offset-1 transition-all duration-300"
              placeholder="Search..."
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8EBBFF] hover:text-[#F4F5FC] transition-colors duration-300">
              <FaSearch />
            </button>
          </div>

          <Link href={"/favorites"} className="whitespace-nowrap hover:text-[#8EBBFF] transition">
            Favorites
          </Link>
        </div>
      </header>
<div className="bg-[#24293E] bg-cover w-full min-h-[calc(100vh-5rem)] p-4 flex flex-col">
  {songs.length === 0 ? (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-[#F4F5FC] text-xl">No favorites yet</p>
    </div>
  ) : (
    <div className="flex flex-wrap gap-4 justify-start">
      {songs.map((song) => (
        <MusicCard
          key={song.id}
          id={song.id}
          src={song.storage_url}
          title={song.title}
          image={song.cover_url}
        />
      ))}
    </div>
  )}
</div>


      <Drawer isOpen={isOpen} displayDrawer={displayDrawer} />
    </>
  );
}
