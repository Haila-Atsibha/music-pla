import { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";

export default function Liked({ songId }) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
    setLiked(stored.includes(songId));
  }, [songId]);

  const toggleLike = () => {
    const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
    let updated;

    if (liked) {
      updated = stored.filter((id) => id !== songId);
    } else {
      updated = [...stored, songId];
    }

    localStorage.setItem("favorites", JSON.stringify(updated));
    setLiked(!liked);
  };

  return (
    <button onClick={toggleLike} className="p-3 rounded-full transition duration-300">
      <FaHeart
        className={`text-3xl transition duration-300 ${
          liked ? "text-red-500 scale-110" : "text-gray-400"
        }`}
      />
    </button>
  );
}
