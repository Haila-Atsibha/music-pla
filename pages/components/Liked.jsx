// components/Liked.js
import { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";
import { supabase } from "../../lib/supabase";

export default function Liked({ songId, onChange }) {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch initial like status (GET)
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch(`/api/songs/${songId}/like-status`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch like status");
        const data = await res.json();
        setLiked(data.user_liked);
      } catch (err) {
        console.error("Error fetching like status:", err);
      }
    };

    if (songId) fetchLikeStatus();
  }, [songId]);

  // Toggle like/unlike
  const toggleLike = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("You must be logged in");

      const res = await fetch(`/api/songs/${songId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to toggle like");

      const data = await res.json();
      setLiked(data.user_liked);

      // ✅ Notify parent (FavoritesPage)
      if (onChange) onChange(data.user_liked, songId);
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className="p-3 rounded-full transition duration-300"
    >
      <FaHeart
        className={`text-3xl transition duration-300 ${
          liked ? "text-red-500 scale-110" : "text-gray-400"
        }`}
      />
    </button>
  );
}
