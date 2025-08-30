// pages/api/favorites.js
import { requireAuth } from "../../lib/auth-utils";
import prisma from "../../lib/prisma";

async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed", code: "METHOD_NOT_ALLOWED" });
  }

  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized", code: "UNAUTHORIZED" });
    }

    const favorites = await prisma.userLike.findMany({
      where: { user_id: userId },
      include: {
        song: {
          select: {
            id: true,
            title: true,
            artist: true,
            album: true,
            cover_url: true,
            storage_url: true,
          },
        },
      },
      orderBy: { liked_at: "desc" },
    });

    const favoriteSongs = favorites.map((like) => like.song);

    return res.status(200).json(favoriteSongs);
  } catch (error) {
    console.error("Favorites API error:", error);
    return res.status(500).json({ error: "Server error", code: "SERVER_ERROR" });
  }
}

export default requireAuth(handler);
