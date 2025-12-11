import API_BASE from "../../constants/apiBase";
import { RecordingDTO } from "../../models/RecordingsDTO";

/**
 * Standalone chunked audio upload to upload_audio_chunk.php
 * 
 * Uploads large audio files in chunks to bypass PHP upload limits.
 * Files are saved to /assets/recordings/{folderName}/{fileName}
 * 
 * @param file - The audio file to upload
 * @param folderName - The folder name (will be sanitized on server)
 * @param token - Optional auth token
 * @param chunkSize - Size of each chunk (default 1MB)
 * @returns Upload result with file path and size
 */

// Chunked upload for large audio files to recordings.php
export const uploadRecordingAudioInChunks = async (
  file: File,
  recordingId: string | number,
  recordingTitle: string,
  token?: string,
  chunkSize = 1024 * 1024 // 1MB
): Promise<any> => {
  const totalChunks = Math.ceil(file.size / chunkSize);
  let currentChunk = 0;
  let uploadId = null;
  let finalResponse = null;
  
  while (currentChunk < totalChunks) {
    const start = currentChunk * chunkSize;
    const end = Math.min(file.size, start + chunkSize);
    const chunk = file.slice(start, end);
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkNumber', String(currentChunk));
    formData.append('totalChunks', String(totalChunks));
    formData.append('fileName', file.name);
    formData.append('recordingId', String(recordingId));
    formData.append('recordingTitle', recordingTitle);
    if (uploadId) formData.append('uploadId', uploadId);
    const headers: Record<string, string> = {};
    if (token) headers["X-Auth-Token"] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE}/recordings.php?action=upload_chunk`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to upload chunk');
    }
    const data = await response.json();
    
    if (data.uploadId) uploadId = data.uploadId;
    finalResponse = data;
    currentChunk++;
  }
  
  return finalResponse || { success: true };
};

// Chunked upload for large audio files to save_audio.php (legacy)
export const uploadAudioInChunks = async (
  file: File,
  recordingId: string | number,
  token?: string,
  chunkSize = 1024 * 1024 // 1MB
): Promise<any> => {
  const totalChunks = Math.ceil(file.size / chunkSize);
  let currentChunk = 0;
  let uploadId = null;
  let finalResponse = null;
  
  while (currentChunk < totalChunks) {
    const start = currentChunk * chunkSize;
    const end = Math.min(file.size, start + chunkSize);
    const chunk = file.slice(start, end);
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkNumber', String(currentChunk));
    formData.append('totalChunks', String(totalChunks));
    formData.append('fileName', file.name);
    formData.append('recordingId', String(recordingId));
    if (uploadId) formData.append('uploadId', uploadId);
    const headers: Record<string, string> = {};
    if (token) headers["X-Auth-Token"] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE}/save_audio.php?action=upload_chunk`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to upload chunk');
    }
    const data = await response.json();
    if (data.uploadId) uploadId = data.uploadId;
    finalResponse = data;
    currentChunk++;
  }
  
  return finalResponse || { success: true };
};

// Create a new recording with chunked audio upload
export const submitRecording = async (recordingData: FormData, token?: string) => {
  const headers: Record<string, string> = {};
  if (token) {
    headers["X-Auth-Token"] = `Bearer ${token}`;
  }
  
  // Check if there's an audio file that needs chunked upload
  // Support single file (audioFile) or multiple files (audioFiles[0], audioFiles[1], etc.)
  const recordingId = recordingData.get('id');
  const recordingIdStr = recordingId ? String(recordingId) : 'new';
  const recordingTitle = recordingData.get('title') as string || 'untitled';
  
  // Find all audio files in FormData
  const audioFiles: { key: string; file: File }[] = [];
  Array.from(recordingData.entries()).forEach(([key, value]) => {
    if (value instanceof File && (key === 'audioFile' || key.startsWith('audioFiles['))) {
      audioFiles.push({ key, file: value });
    }
  });
  
  // Process each audio file
  for (const { key, file } of audioFiles) {
    if (file.size > 2 * 1024 * 1024) {
      // Upload file in chunks
      const uploadResult = await uploadRecordingAudioInChunks(file, recordingIdStr, recordingTitle, token);
      
      // Remove file from FormData and add the file path from upload result
      recordingData.delete(key);
      if (uploadResult.filePath) {
        // Map audioFiles[0] -> audioFilePath_0, audioFiles[1] -> audioFilePath_1, etc.
        const pathKey = key === 'audioFile' ? 'audioFilePath' : key.replace('audioFiles[', 'audioFilePath_').replace(']', '');
        recordingData.append(pathKey, uploadResult.filePath);
      }
    }
  }
  const response = await fetch(`${API_BASE}/recordings.php`, {
    method: "POST",
    headers,
    body: recordingData
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to submit recording");
  }
  
  return response.json();
};

// Get all recordings
export const getRecordings = async (): Promise<RecordingDTO[]> => {
  try {
    const response = await fetch(`${API_BASE}/recordings.php`);
    if (!response.ok) {
      throw new Error("Failed to fetch recordings");
    }
    return response.json();
  } catch (error) {
    // Old mock data for three albums (fallback when backend unavailable)
  return [
    {
      id: 1,
      image: "/assets/recordings/images/2DoBeatles.png",
      title: "2 Do Beatles",
  // yearPublished removed
      description: "2 Do Beatles is a creative tribute to the legendary band, reimagining classic Beatles songs with unique instrumental arrangements for violin and friends. A fresh take on timeless hits for fans old and new.",
      performers: ["Chelle Fulk", "Robert Raines"],
      trackCount: 9,
      link: "https://chelle-fulk.square.site/product/2-do-beatles-by-chelle-fulk-and-robert-raines/1?cp=true&sa=true&sbp=false&q=false",
      samples: [
        {
          id: 1,
          trackName: "The Fool On the Hill",
          audioUrl: "/assets/recordings/2doBeatles/1 The Fool On the Hill.mp3"
        },
        {
          id: 2,
          trackName: "If I Fell",
          audioUrl: "/assets/recordings/2doBeatles/2 If I Fell.mp3"
        },
        {
          id: 3,
          trackName: "All My Loving",
          audioUrl: "/assets/recordings/2doBeatles/3 All My Loving.mp3"
        },
        {
          id: 4,
          trackName: "I'm Looking Through You",
          audioUrl: "/assets/recordings/2doBeatles/4 I'm Looking Through You.mp3"
        },
        {
          id: 5,
          trackName: "Audio Track 5",
          audioUrl: "/assets/recordings/2doBeatles/5 Audio Track.mp3"
        },
        {
          id: 6,
          trackName: "Audio Track 6",
          audioUrl: "/assets/recordings/2doBeatles/6 Audio Track.mp3"
        },
        {
          id: 7,
          trackName: "Audio Track 7",
          audioUrl: "/assets/recordings/2doBeatles/7 Audio Track.mp3"
        }
      ]
    },
    {
      id: 2,
      image: "/assets/recordings/images/Keltish.png",
      title: "Keltish",
  // yearPublished removed
      description: "Keltish brings together the best of Celtic and folk traditions, featuring lively fiddle tunes, heartfelt ballads, and a fusion of world music influences. A musical journey across the British Isles and beyond.",
      performers: ["Chelle Fulk"],
      trackCount: 12,
      link: "https://chelle-fulk.square.site/product/keltish-by-keltish/4?cp=true&sa=true&sbp=false&q=false",
      samples: [
        {
          id: 8,
          trackName: "Dublin Lullaby",
          audioUrl: "/assets/recordings/keltish/1 Dublin Lullaby.mp3"
        },
        {
          id: 9,
          trackName: "Norwegian Wood",
          audioUrl: "/assets/recordings/keltish/2 Norwegian Wood.mp3"
        },
        {
          id: 10,
          trackName: "Redhaired Boy-Drowsy Maggie",
          audioUrl: "/assets/recordings/keltish/3 Redhaired Boy-Drowsy Maggie.mp3"
        },
        {
          id: 11,
          trackName: "Star of the County Down",
          audioUrl: "/assets/recordings/keltish/4 Star of the County Down.mp3"
        }
      ]
    },
    {
      id: 3,
      image: "/assets/recordings/images/IslandTime.png",
      title: "Island Time",
  // yearPublished removed
      description: "Island Time is a collection of original and classic tunes with a tropical flair, blending violin, steel drums, and guitar for a relaxing, beachy vibe. Perfect for unwinding or bringing the island spirit to any occasion.",
      performers: ["Chelle Fulk", "Pete Kudelich"],
      trackCount: 10,
      link: "https://chelle-fulk.square.site/product/island-time-by-chelle-fulk-and-peter-kudelich/5?cp=true&sa=true&sbp=false&q=false",
        samples: [
          { id: 12, trackName: "Yell Yell", audioUrl: "/assets/recordings/islandTime/01 Yell Yell.mp3" },
          { id: 13, trackName: "Carolina in the Morning", audioUrl: "/assets/recordings/islandTime/02 Carolina in the Morning.mp3" },
          { id: 14, trackName: "Shenandoah", audioUrl: "/assets/recordings/islandTime/03 Shenandoah.mp3" },
          { id: 15, trackName: "Songs of Island", audioUrl: "/assets/recordings/islandTime/04 Songs of Island.mp3" },
          { id: 16, trackName: "Cameron Polkas", audioUrl: "/assets/recordings/islandTime/05 Cameron Polkas.mp3" },
          { id: 17, trackName: "El Cerifo", audioUrl: "/assets/recordings/islandTime/06 El Cerifo.mp3" },
          { id: 18, trackName: "Three Ravens", audioUrl: "/assets/recordings/islandTime/07 Three Ravens.mp3" },
          { id: 19, trackName: "El Choclo", audioUrl: "/assets/recordings/islandTime/08 El Choclo.mp3" },
          { id: 20, trackName: "Beaumont Rag", audioUrl: "/assets/recordings/islandTime/09 Beaumont Rag.mp3" },
          { id: 21, trackName: "Ashokan Farewell", audioUrl: "/assets/recordings/islandTime/10 Ashokan Farewell.mp3" },
          { id: 22, trackName: "Morena-Cuba-Noche de Carnival", audioUrl: "/assets/recordings/islandTime/11 Morena-Cuba-Noche de Carnival.mp3" },
          { id: 23, trackName: "Polovetsian Dance", audioUrl: "/assets/recordings/islandTime/12 Polovetsian Dance.mp3" },
          { id: 24, trackName: "Chopinova", audioUrl: "/assets/recordings/islandTime/13 Chopinova.mp3" },
          { id: 25, trackName: "Storm in the Banks", audioUrl: "/assets/recordings/islandTime/14 Storm in the Banks.mp3" },
          { id: 26, trackName: "Island Time", audioUrl: "/assets/recordings/islandTime/15 Island Time.mp3" }
        ]
    }
  ];
  }
};

// Update a recording with chunked audio upload
export const updateRecording = async (id: number | string, recordingData: FormData, token?: string) => {
  const headers: Record<string, string> = {};
  if (token) {
    headers["X-Auth-Token"] = `Bearer ${token}`;
  }
  
  // Check if there's an audio file that needs chunked upload
  // Support single file (audioFile) or multiple files (audioFiles[0], audioFiles[1], etc.)
  const recordingTitle = recordingData.get('title') as string || 'untitled';
  
  // Find all audio files in FormData
  const audioFiles: { key: string; file: File }[] = [];
  Array.from(recordingData.entries()).forEach(([key, value]) => {
    if (value instanceof File && (key === 'audioFile' || key.startsWith('audioFiles['))) {
      audioFiles.push({ key, file: value });
    }
  });
  
  // Process each audio file
  for (const { key, file } of audioFiles) {
    if (file.size > 2 * 1024 * 1024) {
      // Upload file in chunks
      const uploadResult = await uploadRecordingAudioInChunks(file, id, recordingTitle, token);
      
      // Remove file from FormData and add the file path from upload result
      recordingData.delete(key);
      if (uploadResult.filePath) {
        // Map audioFiles[0] -> audioFilePath_0, audioFiles[1] -> audioFilePath_1, etc.
        const pathKey = key === 'audioFile' ? 'audioFilePath' : key.replace('audioFiles[', 'audioFilePath_').replace(']', '');
        recordingData.append(pathKey, uploadResult.filePath);
      }
    }
  }
  
  // Add _method override for PHP
  recordingData.append("_method", "PUT");
  const response = await fetch(`${API_BASE}/recordings.php?id=${id}`, {
    method: "POST",
    headers,
    body: recordingData
  });
  
  if (!response.ok) {
    const responseText = await response.text();
    try {
      const errorData = JSON.parse(responseText);
      throw new Error(errorData.error || "Failed to update recording");
    } catch (e) {
      throw new Error(`Server error (${response.status}): ${responseText.substring(0, 200)}`);
    }
  }
  
  const resultText = await response.text();
  return JSON.parse(resultText);
};

// Delete a recording
export const deleteRecording = async (id: number | string, token?: string) => {
  const headers: Record<string, string> = {};
  if (token) {
    headers["X-Auth-Token"] = `Bearer ${token}`; // FastCGI workaround
  }
  const response = await fetch(`${API_BASE}/recordings.php?id=${id}`, {
    method: "DELETE",
    headers
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error("Failed to delete recording: " + errorText);
  }
  if (response.status === 204) {
    return;
  }
  const text = await response.text();
  if (!text) return;
  try {
    return JSON.parse(text);
  } catch {
    return;
  }
};

// Delete a sample
export const deleteSample = async (recordingId: number, sampleId: number, token?: string) => {
  const headers: Record<string, string> = {};
  if (token) {
    headers["X-Auth-Token"] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE}/recordings.php?action=delete_sample&recording_id=${recordingId}&sample_id=${sampleId}`, {
    method: "DELETE",
    headers
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error("Failed to delete sample: " + errorText);
  }
  if (response.status === 204) {
    return;
  }
  const text = await response.text();
  if (!text) return;
  try {
    return JSON.parse(text);
  } catch {
    return;
  }
};

