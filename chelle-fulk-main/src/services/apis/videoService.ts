import API_BASE from "../../constants/apiBase"

// Create a new video
export const submitVideo = async (videoData: any, token?: string) => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["X-Auth-Token"] = `Bearer ${token}`; // FastCGI workaround
  }
  const response = await fetch(`${API_BASE}/videos.php`, {
    method: "POST",
    headers,
    body: JSON.stringify(videoData)
  });
  if (!response.ok) {
    throw new Error("Failed to submit video");
  }
  return response.json();
};

// Get all videos
export const getVideos = async () => {
  try {
    const response = await fetch(`${API_BASE}/videos.php`);
    if (!response.ok) {
      throw new Error("Failed to fetch videos");
    }
    return response.json();
  } catch (error) {
    console.warn("API call failed, falling back to mock data:", error);
    // Return mocked video data
    return [
      {
        id: 1,
        title: "Percussion and Violin - Sampler reel; Tom Teasley, Chelle Fulk",
        thumbnail: "https://img.youtube.com/vi/kNK10pnNKUY/hqdefault.jpg",
        embedId: "kNK10pnNKUY"
      },
      {
        id: 2,
        title: "Solo fiddle - two Celtic tunes; Chelle Fulk",
        thumbnail: "https://img.youtube.com/vi/fOxnJQsSRaA/hqdefault.jpg",
        embedId: "fOxnJQsSRaA"
      },
      {
        id: 3,
        title: "Anthem String Trio - I'm a Believer; Janet Greene, Kristen Jones, Chelle Fulk",
        thumbnail: "https://img.youtube.com/vi/XMJJsnUIxQM/hqdefault.jpg",
        embedId: "XMJJsnUIxQM"
      },
      {
        id: 4,
        title: "Electric Violin & Cello - sampler reel; Kristen Jones, Chelle Fulk",
        thumbnail: "https://img.youtube.com/vi/C-OkCsUhpE4/hqdefault.jpg",
        embedId: "C-OkCsUhpE4"
      },
      {
        id: 5,
        title: "Anthem String Trio - The Kiss; Janet Greene, Kristen Jones, Chelle Fulk",
        thumbnail: "https://img.youtube.com/vi/4zvSnvMHMio/hqdefault.jpg",
        embedId: "4zvSnvMHMio"
      },
      {
        id: 6,
        title: "Catnip Fling Celtic Trio - sampler reel; Jody Marshall, Kristen Jones, Chelle Fulk",
        thumbnail: "https://img.youtube.com/vi/Lo1s3xsWiu8/hqdefault.jpg",
        embedId: "Lo1s3xsWiu8"
      },
      {
        id: 7,
        title: "Anthem Electric Quartet - Here Comes the Sun; Janet Greene, Kristen Jones, Caroline Little, Chelle Fulk",
        thumbnail: "https://img.youtube.com/vi/JN_iBLdzju8/hqdefault.jpg",
        embedId: "JN_iBLdzju8"
      },
      {
        id: 8,
        title: "Hardanger d'Amore and Cicadas - Emergence; Chelle Fulk, Cicada choir",
        thumbnail: "https://img.youtube.com/vi/7qopMvCLVpw/hqdefault.jpg",
        embedId: "7qopMvCLVpw"
      }
    ];
  }
};

// Get a single video by ID
export const getVideoById = async (id: number | string) => {
  const response = await fetch(`${API_BASE}/videos.php?id=${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch video");
  }
  return response.json();
};

// Update a video
export const updateVideo = async (id: number | string, videoData: any, token?: string) => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["X-Auth-Token"] = `Bearer ${token}`; // FastCGI workaround
  }
  const response = await fetch(`${API_BASE}/videos.php?id=${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(videoData)
  });
  if (!response.ok) {
    throw new Error("Failed to update video");
  }
  return response.json();
};

// Delete a video
export const deleteVideo = async (id: number | string, token?: string) => {
  const headers: Record<string, string> = {};
  console.log("Delete - token:", token);
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["X-Auth-Token"] = `Bearer ${token}`; // FastCGI workaround
  }
  console.log("Delete - headers:", headers);
  const response = await fetch(`${API_BASE}/videos.php?id=${id}`, {
    method: "DELETE",
    headers
  });
  console.log("Delete - response status:", response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.log("Delete - error response:", errorText);
    throw new Error("Failed to delete video: " + errorText);
  }
  // If the response is 204 No Content, do not try to parse JSON
  if (response.status === 204) {
    return;
  }
  const text = await response.text();
  if (!text) return;
  try {
    return JSON.parse(text);
  } catch {
    // Ignore parse error if response is empty or not JSON
    return;
  }
};
