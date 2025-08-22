// pages/api/songs/index.js

export default function handler(req, res) {
  // Simple array of songs stored in public folder
  const songs = [
    {
      id: "1",
      title: "Believer",
      artist: "Imagine Dragons",
      album: "Evolve",
      cover: "/ac.jpg", // put cover image in public/covers
      url: "/be.mp3"      // put mp3 in public/songs
    },
    {
      id: "2",
      title: "Stereo Hearts",
      artist: "maroon 5",
      album: "After Hours",
      cover: "/ac.jpg",
      url: "/song1.mp3"
    }
  ];

  res.status(200).json(songs);
}
