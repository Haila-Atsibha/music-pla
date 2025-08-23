import { useRef, useState, useEffect } from "react";
import { FaPlay, FaPause, FaVolumeUp} from "react-icons/fa";
import Liked from "./components/Liked";
import Playlist from "./components/addplaylist";

export default function MusicCard({id, src, title, image }) {
  const audioRef = useRef(null);
  const volumeRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showVolume, setShowVolume] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  

  // Play/pause toggle
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(console.log);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  // Progress bar
  const handleSeekStart = () => setIsSeeking(true);
  const handleSeekEnd = () => setIsSeeking(false);
  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) audioRef.current.currentTime = newTime;
  };

  // Volume
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  // Time & duration tracking
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      if (!isSeeking) setCurrentTime(audio.currentTime);
    };
    const setAudioDuration = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", setAudioDuration);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", setAudioDuration);
      audio.removeEventListener("ended", onEnded);
    };
  }, [isSeeking]);

  // Hide volume on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (volumeRef.current && !volumeRef.current.contains(e.target)) {
        setShowVolume(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

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

      {/* Volume Slider (Above Controls) */}
      <div
        ref={volumeRef}
        className={`mb-3 transition-all duration-200 ease-in-out ${
          showVolume ? "opacity-100 h-10" : "opacity-0 h-0 overflow-hidden"
        }`}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full accent-[#8EBBFF]"
        />
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 items-center mb-3">
        <button
          onClick={togglePlay}
          className="bg-[#8EBBFF] hover:bg-[#6FAFFF] text-[#24293E] w-12 h-12 rounded-full flex items-center justify-center"
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>

        {/* Volume Button */}
        <button
          onClick={() => setShowVolume(!showVolume)}
          className="text-[#8EBBFF] hover:text-[#F4F5FC]"
        >
          <FaVolumeUp size={20} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <span className="text-sm">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.01"
          value={currentTime}
          onChange={handleSeek}
          onMouseDown={handleSeekStart}
          onMouseUp={handleSeekEnd}
          className="flex-1 accent-[#8EBBFF]"
        />
        <span className="text-sm">{formatTime(duration)}</span>
      </div>

      <audio ref={audioRef} src={src}></audio>
      <div className="flex justify-center gap-2 m-2">
        <Liked songId={id} />
        <Playlist/>
        </div>
      
    </div>
  );
}
