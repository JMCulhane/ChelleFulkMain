import API_BASE from "../../constants/apiBase";

// Get all recordings
export const getRecordings = async () => {
  const response = await fetch(`${API_BASE}/recordings`);
  if (!response.ok) {
    throw new Error("Failed to fetch recordings");
  }
  return response.json();
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
  const response = await fetch(`${API_BASE}/recordings`, options);
  if (!response.ok) {
    throw new Error("Failed to submit recording");
  }
  return response.json();
};
