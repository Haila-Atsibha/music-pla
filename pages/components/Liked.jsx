import { useState } from "react";
import { FaHeart } from "react-icons/fa";


export default function Liked(){
  const [Liked,setLiked]=useState(false);
          return(
            <button
      onClick={() => setLiked(!Liked)}
      className="p-3 rounded-full transition duration-300">
      <FaHeart
        className={`text-3xl transition duration-300 ${
          Liked ? "text-red-500 scale-110" : "text-gray-400"
        }`}
      />
    </button>
          );
         
}