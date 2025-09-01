import API_BASE from "../../constants/apiBase";

// Get all recordings
// Mocked recordings data for three albums
import { RecordingDTO } from "../../models/RecordingsDTO";

export const getRecordings = async (): Promise<RecordingDTO[]> => {
  // Mock data for three albums
  return [
    {
      image: "/assets/recordings/2DoBeatles.png",
      title: "2 Do Beatles",
  // yearPublished removed
      description: "2 Do Beatles is a creative tribute to the legendary band, reimagining classic Beatles songs with unique arrangements for violin and friends. A fresh take on timeless hits for fans old and new.",
      performers: ["Chelle Fulk", "Robert Raines"],
      trackCount: 9,
      link: "https://chellefulk.square.site/product/2-do-beatles/20?cp=true&sa=false&sbp=false&q=false&category_id=2",
      samples: [
        {
          trackName: "Yesterday (Violin Version)",
          audioUrl: "#"
        },
        {
          trackName: "Hey Jude (Instrumental)",
          audioUrl: "#"
        }
      ]
    },
    {
      image: "/assets/recordings/Keltish.png",
      title: "Keltish",
  // yearPublished removed
      description: "Keltish brings together the best of Celtic and folk traditions, featuring lively fiddle tunes, heartfelt ballads, and a fusion of world music influences. A musical journey across the British Isles and beyond.",
      performers: ["Chelle Fulk"],
      trackCount: 12,
      link: "https://chellefulk.square.site/product/keltish/1?cp=true&sa=false&sbp=false&q=false&category_id=2",
      samples: [
        {
          trackName: "Parting Glass",
          audioUrl: "https://embed.music.apple.com/us/album/parting-glass/211000452?i=211000482"
        },
        {
          trackName: "Star of the County Down",
          audioUrl: "https://embed.music.apple.com/us/album/star-of-the-county-down/211000452?i=211000458"
        }
      ]
    },
    {
      image: "/assets/recordings/IslandTime.png",
      title: "Island Time",
  // yearPublished removed
      description: "Island Time is a collection of original and classic tunes with a tropical flair, blending violin, steel drums, and guitar for a relaxing, beachy vibe. Perfect for unwinding or bringing the island spirit to any occasion.",
      performers: ["Chelle Fulk", "Pete Kudelich"],
      trackCount: 10,
      link: "https://chellefulk.square.site/product/island-time/19?cp=true&sa=false&sbp=false&q=false&category_id=2",
      samples: [
        {
          trackName: "Island Breeze",
          audioUrl: "#"
        },
        {
          trackName: "Tropical Dreams",
          audioUrl: "#"
        }
      ]
    }
  ];
};

// Get a single recording by ID
export const getRecordingById = async (id: number | string) => {
  const response = await fetch(`${API_BASE}/recordings/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch recording");
  }
  return response.json();
};

// Update a recording
export const updateRecording = async (id: number | string, recordingData: any, token?: string) => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}/recordings/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(recordingData)
  });
  if (!response.ok) {
    throw new Error("Failed to update recording");
  }
  return response.json();
};

// Delete a recording
export const deleteRecording = async (id: number | string, token?: string) => {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}/recordings/${id}`, {
    method: "DELETE",
    headers
  });
  if (!response.ok) {
    throw new Error("Failed to delete recording");
  }
  return response.json();
};

export const submitRecording = async (recordingData: any, isMultipart = false, token?: string) => {
  let options: RequestInit;
  if (isMultipart) {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    options = {
      method: "POST",
      body: recordingData, // FormData
      headers
    };
  } else {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    options = {
      method: "POST",
      headers,
      body: JSON.stringify(recordingData)
    };
  }
  try {
    const response = await fetch(`${API_BASE}/recordings`, options);
    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}`;
      try {
        const text = await response.text();
        errorMsg += text ? `: ${text}` : '';
      } catch {}
      throw new Error(errorMsg);
    }
    return response.json();
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message && err.message.includes('fetch')) {
      throw new Error('Network error: Could not connect to server.');
    }
    throw err;
  }
};
