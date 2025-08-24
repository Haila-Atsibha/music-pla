import { useState } from "react";
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp, FaRandom, FaRedo } from "react-icons/fa";

export default function BottomPlayerBar({ song, artist }) {
  // Dummy state for demonstration; replace with context or props in real app
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // 3 min default
  const [volume, setVolume] = useState(1);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#23263A] text-[#F4F5FC] shadow-2xl z-50 flex items-center justify-between px-8 py-3">
      {/* Song Info */}
      <div className="flex items-center gap-4 min-w-[200px]">
        <div className="w-14 h-14 bg-[#2A2F4F] rounded-lg overflow-hidden flex-shrink-0">
          {/* Album art placeholder */}
          <img src={song?.image || "/file.svg"} alt={song?.title || "Song"} className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="font-semibold text-base truncate max-w-[120px]">{song?.title || "Song Title"}</div>
          <div className="text-xs text-[#8EBBFF] truncate max-w-[120px]">{artist || "Artist Name"}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center flex-1 max-w-xl">
        <div className="flex items-center gap-6 mb-1">
          <button onClick={() => setIsShuffling((s) => !s)} className={isShuffling ? "text-[#8EBBFF]" : ""}>
            <FaRandom size={18} />
          </button>
          <button>
            <FaStepBackward size={22} />
          </button>
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="bg-[#8EBBFF] hover:bg-[#6FAFFF] text-[#23263A] w-12 h-12 rounded-full flex items-center justify-center"
          >
            {isPlaying ? <FaPause size={24} /> : <FaPlay size={24} />}
          </button>
          <button>
            <FaStepForward size={22} />
          </button>
          <button onClick={() => setIsRepeating((r) => !r)} className={isRepeating ? "text-[#8EBBFF]" : ""}>
            <FaRedo size={18} />
          </button>
        </div>
        {/* Seek Bar */}
        <div className="flex items-center gap-2 w-full max-w-md">
          <span className="text-xs w-10 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration}
            step="0.1"
            value={currentTime}
            onChange={e => setCurrentTime(Number(e.target.value))}
            className="flex-1 accent-[#8EBBFF] h-1"
          />
          <span className="text-xs w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 min-w-[120px] justify-end">
        <FaVolumeUp />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={e => setVolume(Number(e.target.value))}
          className="accent-[#8EBBFF] w-24"
        />
      </div>
    </div>
  );
}
