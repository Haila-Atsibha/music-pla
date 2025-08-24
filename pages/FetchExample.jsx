import MusicCard from "./Music";

export default function SongsList({ songs, onSongPlay, searchQuery }) {
  if (!songs || songs.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="text-[#8EBBFF] text-lg">
          {searchQuery ? `No songs found for "${searchQuery}"` : "No songs available"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {songs.map((song) => (
        <MusicCard
          key={song.id}
          id={song.id}
          src={song.storage_url}
          title={song.title}
          image={song.cover_url}
          artist={song.artist}
          album={song.album}
          onPlay={() => onSongPlay(song)}
        />
      ))}
    </div>
  );
}
