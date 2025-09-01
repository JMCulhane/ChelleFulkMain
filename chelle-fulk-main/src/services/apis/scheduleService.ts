// src/services/apis/scheduleService.ts

import API_BASE from '../../constants/apiBase';

// Get all schedule data
export const getSchedule = async () => {
  const response = await fetch(`${API_BASE}/schedule`);
  if (!response.ok) {
    throw new Error('Failed to fetch schedule');
  }
  return response.json();
};
