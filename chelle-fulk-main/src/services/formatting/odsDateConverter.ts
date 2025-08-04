export function odsDateToJSDate(odsSerial: number): string {
  const excelEpoch: Date = new Date(Date.UTC(1899, 11, 30)); // Dec 30, 1899
  const msPerDay: number = 86400000;

  const days: number = Math.floor(odsSerial);
  const fraction: number = odsSerial - days;

  const date: Date = new Date(excelEpoch.getTime() + days * msPerDay);
  date.setTime(date.getTime() + Math.round(fraction * msPerDay));

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric"
  });
}