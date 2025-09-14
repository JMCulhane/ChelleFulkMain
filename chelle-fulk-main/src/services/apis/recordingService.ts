import API_BASE from "../../constants/apiBase";

// Get all recordings
// Mocked recordings data for three albums
import { RecordingDTO } from "../../models/RecordingsDTO";

export const getRecordings = async (): Promise<RecordingDTO[]> => {
  // Mock data for three albums
  return [
    {
      image: "/assets/recordings/images/2DoBeatles.png",
      title: "2 Do Beatles",
  // yearPublished removed
      description: "2 Do Beatles is a creative tribute to the legendary band, reimagining classic Beatles songs with unique instrumental arrangements for violin and friends. A fresh take on timeless hits for fans old and new.",
      performers: ["Chelle Fulk", "Robert Raines"],
      trackCount: 9,
      link: "https://chelle-fulk.square.site/product/2-do-beatles-by-chelle-fulk-and-robert-raines/1?cp=true&sa=true&sbp=false&q=false",
      samples: [
        {
          trackName: "The Fool On the Hill",
          audioUrl: "/assets/recordings/2doBeatles/1 The Fool On the Hill.mp3"
        },
        {
          trackName: "If I Fell",
          audioUrl: "/assets/recordings/2doBeatles/2 If I Fell.mp3"
        },
        {
          trackName: "All My Loving",
          audioUrl: "/assets/recordings/2doBeatles/3 All My Loving.mp3"
        },
        {
          trackName: "I'm Looking Through You",
          audioUrl: "/assets/recordings/2doBeatles/4 I'm Looking Through You.mp3"
        },
        {
          trackName: "Audio Track 5",
          audioUrl: "/assets/recordings/2doBeatles/5 Audio Track.mp3"
        },
        {
          trackName: "Audio Track 6",
          audioUrl: "/assets/recordings/2doBeatles/6 Audio Track.mp3"
        },
        {
          trackName: "Audio Track 7",
          audioUrl: "/assets/recordings/2doBeatles/7 Audio Track.mp3"
        }
      ]
    },
    {
      image: "/assets/recordings/images/Keltish.png",
      title: "Keltish",
  // yearPublished removed
      description: "Keltish brings together the best of Celtic and folk traditions, featuring lively fiddle tunes, heartfelt ballads, and a fusion of world music influences. A musical journey across the British Isles and beyond.",
      performers: ["Chelle Fulk"],
      trackCount: 12,
      link: "https://chelle-fulk.square.site/product/keltish-by-keltish/4?cp=true&sa=true&sbp=false&q=false",
      samples: [
        {
          trackName: "Dublin Lullaby",
          audioUrl: "/assets/recordings/keltish/1 Dublin Lullaby.mp3"
        },
        {
          trackName: "Norwegian Wood",
          audioUrl: "/assets/recordings/keltish/2 Norwegian Wood.mp3"
        },
        {
          trackName: "Redhaired Boy-Drowsy Maggie",
          audioUrl: "/assets/recordings/keltish/3 Redhaired Boy-Drowsy Maggie.mp3"
        },
        {
          trackName: "Star of the County Down",
          audioUrl: "/assets/recordings/keltish/4 Star of the County Down.mp3"
        }
      ]
    },
    {
      image: "/assets/recordings/images/IslandTime.png",
      title: "Island Time",
  // yearPublished removed
      description: "Island Time is a collection of original and classic tunes with a tropical flair, blending violin, steel drums, and guitar for a relaxing, beachy vibe. Perfect for unwinding or bringing the island spirit to any occasion.",
      performers: ["Chelle Fulk", "Pete Kudelich"],
      trackCount: 10,
      link: "https://chelle-fulk.square.site/product/island-time-by-chelle-fulk-and-peter-kudelich/5?cp=true&sa=true&sbp=false&q=false",
        samples: [
          { trackName: "Yell Yell", audioUrl: "/assets/recordings/islandTime/01 Yell Yell.mp3" },
          { trackName: "Carolina in the Morning", audioUrl: "/assets/recordings/islandTime/02 Carolina in the Morning.mp3" },
          { trackName: "Shenandoah", audioUrl: "/assets/recordings/islandTime/03 Shenandoah.mp3" },
          { trackName: "Songs of Island", audioUrl: "/assets/recordings/islandTime/04 Songs of Island.mp3" },
          { trackName: "Cameron Polkas", audioUrl: "/assets/recordings/islandTime/05 Cameron Polkas.mp3" },
          { trackName: "El Cerifo", audioUrl: "/assets/recordings/islandTime/06 El Cerifo.mp3" },
          { trackName: "Three Ravens", audioUrl: "/assets/recordings/islandTime/07 Three Ravens.mp3" },
          { trackName: "El Choclo", audioUrl: "/assets/recordings/islandTime/08 El Choclo.mp3" },
          { trackName: "Beaumont Rag", audioUrl: "/assets/recordings/islandTime/09 Beaumont Rag.mp3" },
          { trackName: "Ashokan Farewell", audioUrl: "/assets/recordings/islandTime/10 Ashokan Farewell.mp3" },
          { trackName: "Morena-Cuba-Noche de Carnival", audioUrl: "/assets/recordings/islandTime/11 Morena-Cuba-Noche de Carnival.mp3" },
          { trackName: "Polovetsian Dance", audioUrl: "/assets/recordings/islandTime/12 Polovetsian Dance.mp3" },
          { trackName: "Chopinova", audioUrl: "/assets/recordings/islandTime/13 Chopinova.mp3" },
          { trackName: "Storm in the Banks", audioUrl: "/assets/recordings/islandTime/14 Storm in the Banks.mp3" },
          { trackName: "Island Time", audioUrl: "/assets/recordings/islandTime/15 Island Time.mp3" }
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
