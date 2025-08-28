import { useState, useEffect, useRef } from "react";
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaStepBackward,
  FaVolumeUp,
  FaRandom,
  FaRedo,
} from "react-icons/fa";
import { trackSongPlay } from "../lib/music-api";

export default function BottomPlayerBar({
  playlist,
  currentIndex,
  setCurrentIndex,
  artist,
  onClose,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [hasTrackedPlay, setHasTrackedPlay] = useState(false);
  const [history, setHistory] = useState([]);
  const audioRef = useRef(null);

  const currentSong = playlist?.[currentIndex] || null;

  // Handle song changes and autoplay
  useEffect(() => {
    if (!currentSong?.storage_url || !audioRef.current) return;

    const audio = audioRef.current;

    // Add to history (for previous button)
    setHistory((prev) => [...prev, currentIndex]);

    audio.pause();
    audio.currentTime = 0;
    audio.src = currentSong.storage_url;
    audio.load();

    setCurrentTime(0);
    setHasTrackedPlay(false);
    setIsPlaying(true);

    audio
      .play()
      .catch((err) => console.error("Auto-play failed:", err));
  }, [currentIndex, currentSong]);

  // Play/pause effect
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(console.error);
    else audioRef.current.pause();
  }, [isPlaying]);

  // Track play history
  useEffect(() => {
    if (isPlaying && currentSong && !hasTrackedPlay) {
      trackSongPlay(currentSong.id);
      setHasTrackedPlay(true);
    }
  }, [isPlaying, currentSong, hasTrackedPlay]);

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (isRepeating) {
        audio.currentTime = 0;
        audio.play();
      } else {
        handleNext();
      }
    };
    const handleError = (e) => {
      console.error("Audio error:", e);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [currentSong, isRepeating]);

  // Seek & volume
  const handleSeek = (e) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) audioRef.current.currentTime = newTime;
  };

  const handleVolumeChange = (e) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  // Next / Previous
  const handleNext = () => {
    if (!playlist || playlist.length === 0) return;

    if (isShuffling && !isRepeating) {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } while (nextIndex === currentIndex && playlist.length > 1);
      setCurrentIndex(nextIndex);
    } else {
      setCurrentIndex((prev) => (prev + 1) % playlist.length);
    }
  };

 const handlePrevious = () => {
  if (history.length > 1) {
    // Normal history back
    const newHistory = [...history];
    newHistory.pop(); // remove current
    const prevIndex = newHistory.pop(); // get previous
    if (prevIndex != null) {
      setCurrentIndex(prevIndex);
      setHistory([...newHistory, prevIndex]);
    }
  } else {
    // History empty or first song: pick a random one
    if (!playlist || playlist.length === 0) return;
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * playlist.length);
    } while (randomIndex === currentIndex && playlist.length > 1);
    setCurrentIndex(randomIndex);
    setHistory([randomIndex]); // start a new history
  }
};


  // Toggle buttons (mutually exclusive)
  const toggleShuffle = () => {
    setIsShuffling((prev) => {
      if (!prev) setIsRepeating(false);
      return !prev;
    });
  };

  const toggleRepeat = () => {
    setIsRepeating((prev) => {
      if (!prev) setIsShuffling(false);
      return !prev;
    });
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (onClose) onClose();
  };

  if (!currentSong) return null;

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#23263A] text-[#F4F5FC] shadow-2xl z-50 flex items-center justify-between px-8 py-3">
      {/* Song Info */}
      <div className="flex items-center gap-4 min-w-[200px]">
        <div className="w-14 h-14 bg-[#2A2F4F] rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={currentSong?.cover_url || currentSong?.image || "/file.svg"}
            alt={currentSong?.title || "Song"}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <div className="font-semibold text-base truncate max-w-[120px]">
            {currentSong?.title || "Song Title"}
          </div>
          <div className="text-xs text-[#8EBBFF] truncate max-w-[120px]">
            {artist || currentSong?.artist || "Artist Name"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center flex-1 max-w-xl">
        <div className="flex items-center gap-6 mb-1">
          <button onClick={toggleShuffle} className={` cursor-pointer ${isShuffling ? "text-[#8EBBFF]" : ""}`}>
            <FaRandom size={18} />
          </button>
          <button onClick={handlePrevious} className="cursor-pointer">
            <FaStepBackward size={22} />
          </button>
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="bg-[#8EBBFF] cursor-pointer hover:bg-[#6FAFFF] text-[#23263A] w-12 h-12 rounded-full flex items-center justify-center"
          >
            {isPlaying ? <FaPause size={24} /> : <FaPlay size={24} />}
          </button>
          <button onClick={handleNext} className="cursor-pointer">
            <FaStepForward size={22} />
          </button>
          <button onClick={toggleRepeat} className={`cursor-pointer ${isRepeating ? "text-[#8EBBFF]" : ""}`}>
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
            onChange={handleSeek}
            className="flex-1 cursor-pointer accent-[#8EBBFF] h-1"
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
          onChange={handleVolumeChange}
          className="accent-[#8EBBFF] w-24 cursor-pointer"
        />
      </div>

      <button
        onClick={handleClose}
        className="ml-4 cursor-pointer text-[#8EBBFF] hover:text-red-400 text-xl font-bold"
        title="Close Player"
      >
        ✕
      </button>

      <audio ref={audioRef} preload="metadata" />
    </div>
  );
}
