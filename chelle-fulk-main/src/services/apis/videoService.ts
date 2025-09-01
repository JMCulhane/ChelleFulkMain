import API_BASE from "../../constants/apiBase"

// Create a new video
export const submitVideo = async (videoData: any, token?: string) => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}/videos`, {
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
  const response = await fetch(`${API_BASE}/videos`);
  if (!response.ok) {
    throw new Error("Failed to fetch videos");
  }
  return response.json();
};

// Get a single video by ID
export const getVideoById = async (id: number | string) => {
  const response = await fetch(`${API_BASE}/videos/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch video");
  }
  return response.json();
};

// Update a video
export const updateVideo = async (id: number | string, videoData: any, token?: string) => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}/videos/${id}`, {
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
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}/videos/${id}`, {
    method: "DELETE",
    headers
  });
  if (!response.ok) {
    throw new Error("Failed to delete video");
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
