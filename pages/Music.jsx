import { FaPlay } from "react-icons/fa";
import Liked from "./components/Liked";
import Playlist from "./components/addplaylist";


export default function MusicCard({id, src, title, image, artist, album }) {

  return (
    <div className="bg-[#2A2F4F] text-[#F4F5FC] p-4 rounded-2xl shadow-lg w-full max-w-sm mx-auto cursor-pointer hover:bg-[#3A3F5F] transition-colors">
      {/* Album Cover */}
      <div className="w-full h-48 overflow-hidden rounded-xl mb-3 relative group">
        <img
          src={image || "/file.svg"}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-[#8EBBFF] hover:bg-[#6FAFFF] text-[#23263A] w-16 h-16 rounded-full flex items-center justify-center">
            <FaPlay size={24} />
          </div>
        </div>
      </div>

      {/* Title and Artist */}
      <div className="text-lg font-semibold text-center mb-1">{title}</div>
      {artist && <div className="text-sm text-[#8EBBFF] text-center mb-3">{artist}</div>}

      {/* Like and Playlist Buttons */}
      <div className="flex justify-center gap-2 m-2">
        <Liked songId={id} />
        <Playlist/>
      </div>
    </div>
  );
}
