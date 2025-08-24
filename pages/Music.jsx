import { useRef, useState, useEffect } from "react";
import { FaPlay, FaPause, FaVolumeUp} from "react-icons/fa";
import Liked from "./components/Liked";
import Playlist from "./components/addplaylist";


export default function MusicCard({id, src, title, image }) {

  return (
    <div className="bg-[#2A2F4F] text-[#F4F5FC] p-4 rounded-2xl shadow-lg w-full max-w-sm mx-auto">
      {/* Album Cover */}
      <div className="w-full h-48 overflow-hidden rounded-xl mb-3">
        <img
          src={image || ""}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title */}
      <div className="text-lg font-semibold text-center mb-3">{title}</div>

      {/* Like and Playlist Buttons */}
      <div className="flex justify-center gap-2 m-2">
        <Liked songId={id} />
        <Playlist/>
      </div>
    </div>
  );
}
