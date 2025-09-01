// src/services/apis/scheduleService.ts
export const getSchedule = async () => {
  const response = await fetch('/api/schedule');
  if (!response.ok) throw new Error('Failed to fetch schedule');
  return response.json();
};
