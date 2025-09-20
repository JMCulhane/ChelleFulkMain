export function convertGoogleSheetsDate(dateString: string): string {
  console.log("Start of convertgooglesheetdata")
  // Handles strings like: Date(2025,6,4)
  const match = /Date\((\d+),(\d+),(\d+)\)/.exec(dateString);
  if (!match) return "Invalid Date";

  const [, yearStr, monthStr, dayStr] = match;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const date = new Date(Date.UTC(year, month, day+1));

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}


export function convertGoogleSheetsTime(timeString: string): string {
  // Handles strings like: Date(1899,11,30,21,0,0)
  const match = /Date\(1899,11,30,(\d+),(\d+),(\d+)\)/.exec(timeString);
  if (!match) return "Invalid Time";

  let [, hourStr, minuteStr] = match;
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;

  const minuteFormatted = minute < 10 ? `0${minute}` : `${minute}`;

  return `${hour}:${minuteFormatted} ${ampm}`;
}
