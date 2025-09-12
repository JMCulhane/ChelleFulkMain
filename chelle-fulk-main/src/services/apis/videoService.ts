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
  // Backend logic commented out for static hosting:
  // const response = await fetch(`${API_BASE}/videos`);
  // if (!response.ok) {
  //   throw new Error("Failed to fetch videos");
  // }
  // return response.json();

  // Return mocked video data from data.sql
  return [
    {
      id: 1,
      title: "Two Fiddle Tunes",
      thumbnail: "https://img.youtube.com/vi/fOxnJQsSRaA/hqdefault.jpg",
      embedId: "fOxnJQsSRaA"
    },
    {
      id: 2,
      title: "Im a Believer",
      thumbnail: "https://img.youtube.com/vi/XMJJsnUIxQM/hqdefault.jpg",
      embedId: "XMJJsnUIxQM"
    },
    {
      id: 3,
      title: "Anthem Electric Violin and Cello",
      thumbnail: "https://img.youtube.com/vi/C-OkCsUhpE4/hqdefault.jpg",
      embedId: "C-OkCsUhpE4"
    },
    {
      id: 4,
      title: "Tom Teasley Percussion, Chelle Fulk Violin",
      thumbnail: "https://img.youtube.com/vi/609TvV1iT0A/hqdefault.jpg",
      embedId: "609TvV1iT0A"
    },
    {
      id: 5,
      title: "The Kiss from Last of the Mohicans",
      thumbnail: "https://img.youtube.com/vi/4zvSnvMHMio/hqdefault.jpg",
      embedId: "4zvSnvMHMio"
    },
    {
      id: 6,
      title: "Catnip Fling Sampler",
      thumbnail: "https://img.youtube.com/vi/Lo1s3xsWiu8/hqdefault.jpg",
      embedId: "Lo1s3xsWiu8"
    },
    {
      id: 7,
      title: "Red Haired Boy",
      thumbnail: "https://img.youtube.com/vi/BRLZ1PbJegk/hqdefault.jpg",
      embedId: "BRLZ1PbJegk"
    },
    {
      id: 8,
      title: "Here Comes the Sun",
      thumbnail: "https://img.youtube.com/vi/JN_iBLdzju8/hqdefault.jpg",
      embedId: "JN_iBLdzju8"
    }
  ];
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
