# Music Platform API Documentation

## 🎵 **Complete API Reference**

This document provides comprehensive documentation for all Music Platform API endpoints with authentication, authorization, and usage examples.

## 🔐 **Authentication**

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

Get access tokens from the login endpoint: `POST /api/auth/login`

## 📋 **API Endpoints Overview**

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### **Songs (Admin Upload)**
- `POST /api/songs/upload` - Upload song (Admin only)

### **Songs (Streaming)**
- `GET /api/songs` - Get all songs with pagination/filtering
- `GET /api/songs/[id]` - Get specific song details

### **Playlists**
- `POST /api/playlists` - Create playlist
- `GET /api/playlists` - Get user's playlists
- `POST /api/playlists/[id]/songs` - Add song to playlist
- `DELETE /api/playlists/[id]/songs/[songId]` - Remove song from playlist

### **Likes**
- `POST /api/songs/[id]/like` - Like/unlike song
- `GET /api/songs/[id]/likes` - Get song likes count

### **Play History**
- `POST /api/songs/[id]/play` - Record song play
- `GET /api/users/[userId]/history` - Get user play history

---

## 📖 **Detailed Endpoint Documentation**

### **1. Admin Song Upload**

#### `POST /api/songs/upload`
**Description:** Upload a new song (Admin only)

**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "title": "Song Title",
  "artist": "Artist Name", 
  "album": "Album Name",
  "cover_url": "https://example.com/cover.jpg",
  "storage_url": "https://example.com/song.mp3"
}
```

**Response (201):**
```json
{
  "message": "Song uploaded successfully",
  "song": {
    "id": "uuid",
    "title": "Song Title",
    "artist": "Artist Name",
    "album": "Album Name",
    "cover_url": "https://example.com/cover.jpg",
    "storage_url": "https://example.com/song.mp3",
    "uploaded_at": "2024-01-01T00:00:00Z",
    "uploaded_by": {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@example.com"
    }
  }
}
```

### **2. Song Streaming**

#### `GET /api/songs`
**Description:** Get all songs with pagination and filtering

**Authentication:** None required

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 20, max: 100) - Items per page
- `search` - Search in title, artist, album
- `artist` - Filter by artist
- `album` - Filter by album
- `sortBy` (default: uploaded_at) - Sort field
- `sortOrder` (default: desc) - Sort direction

**Response (200):**
```json
{
  "songs": [
    {
      "id": "uuid",
      "title": "Song Title",
      "artist": "Artist Name",
      "album": "Album Name",
      "cover_url": "https://example.com/cover.jpg",
      "storage_url": "https://example.com/song.mp3",
      "uploaded_at": "2024-01-01T00:00:00Z",
      "uploaded_by": {
        "id": "uuid",
        "name": "Admin User"
      },
      "stats": {
        "likes": 10,
        "plays": 100
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 100,
    "limit": 20,
    "has_next": true,
    "has_prev": false
  }
}
```

#### `GET /api/songs/[id]`
**Description:** Get specific song with detailed information

**Authentication:** None required

**Response (200):**
```json
{
  "song": {
    "id": "uuid",
    "title": "Song Title",
    "artist": "Artist Name",
    "album": "Album Name",
    "cover_url": "https://example.com/cover.jpg",
    "storage_url": "https://example.com/song.mp3",
    "uploaded_at": "2024-01-01T00:00:00Z",
    "uploaded_by": {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "stats": {
      "total_likes": 10,
      "total_plays": 100,
      "in_playlists": 5
    },
    "recent_activity": {
      "recent_likes": [...],
      "recent_plays": [...]
    }
  }
}
```

### **3. Playlists**

#### `POST /api/playlists`
**Description:** Create a new playlist

**Authentication:** Required

**Request Body:**
```json
{
  "name": "My Playlist",
  "description": "Optional description"
}
```

**Response (201):**
```json
{
  "message": "Playlist created successfully",
  "playlist": {
    "id": "uuid",
    "name": "My Playlist",
    "description": "Optional description",
    "created_at": "2024-01-01T00:00:00Z",
    "owner": {
      "id": "uuid",
      "name": "User Name"
    },
    "song_count": 0
  }
}
```

#### `GET /api/playlists`
**Description:** Get user's playlists

**Authentication:** Required

**Query Parameters:**
- `include_songs` (default: true) - Include songs in response

**Response (200):**
```json
{
  "playlists": [
    {
      "id": "uuid",
      "name": "My Playlist",
      "description": "Optional description",
      "created_at": "2024-01-01T00:00:00Z",
      "owner": {
        "id": "uuid",
        "name": "User Name"
      },
      "song_count": 5,
      "songs": [...]
    }
  ],
  "total_count": 3
}
```

### **4. Likes**

#### `POST /api/songs/[id]/like`
**Description:** Like or unlike a song (toggle)

**Authentication:** Required

**Response (200):**
```json
{
  "message": "Song liked successfully",
  "action": "liked",
  "song": {
    "id": "uuid",
    "title": "Song Title",
    "artist": "Artist Name",
    "album": "Album Name"
  },
  "like_count": 11,
  "user_liked": true
}
```

#### `GET /api/songs/[id]/likes`
**Description:** Get song likes information

**Authentication:** Optional (shows user_liked if authenticated)

**Response (200):**
```json
{
  "song": {
    "id": "uuid",
    "title": "Song Title",
    "artist": "Artist Name",
    "album": "Album Name"
  },
  "likes": {
    "total_count": 10,
    "user_liked": true,
    "recent_likes": [
      {
        "id": "uuid",
        "user": {
          "id": "uuid",
          "name": "User Name"
        },
        "liked_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### **5. Play History**

#### `POST /api/songs/[id]/play`
**Description:** Record that user played a song

**Authentication:** Required

**Response (201):**
```json
{
  "message": "Play recorded successfully",
  "play_history": {
    "id": "uuid",
    "played_at": "2024-01-01T00:00:00Z",
    "song": {
      "id": "uuid",
      "title": "Song Title",
      "artist": "Artist Name",
      "album": "Album Name",
      "cover_url": "https://example.com/cover.jpg"
    },
    "user": {
      "id": "uuid",
      "name": "User Name"
    }
  },
  "song_stats": {
    "total_plays": 101
  },
  "duplicate": false
}
```

## 🔒 **Authorization Rules**

1. **Admin Song Upload**: Only users with `role = 'admin'` can upload songs
2. **Playlist Management**: Users can only create/modify their own playlists
3. **Play History**: Users can only view their own play history
4. **Likes**: Any authenticated user can like songs
5. **Song Streaming**: Public access (no authentication required)

## 📊 **Error Responses**

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Common Error Codes:**
- `UNAUTHORIZED` (401) - Authentication required
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `VALIDATION_ERROR` (400) - Invalid input data
- `CONFLICT` (409) - Resource already exists
- `METHOD_NOT_ALLOWED` (405) - HTTP method not supported

## 🧪 **Testing**

Run the comprehensive test suite:
```bash
node test-music-apis.js
```

This will test all endpoints with proper authentication and authorization.
