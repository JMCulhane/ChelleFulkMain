import {
  convertGoogleSheetsDate,
  convertGoogleSheetsTime,
} from "../formatting/googleSheetsDataConverter";
import normalizeKeys from "../formatting/normalizeKeys";

export async function retrieveGigData(): Promise<any[]> {
  const sheetId = '1Pmz9yYFHda8BEStgbcoXwOYA30k5T9rQ-F6608O6id4';
  const gid = '0'; // First tab
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    // Strip JSON wrapper
    const json = JSON.parse(text.substring(47, text.length - 2));

    // Convert to array of objects
    const cols = json.table.cols.map((col: any) => col.label);
    const rows = json.table.rows.map((row: any) => {
      const obj: Record<string, string> = {};
      row.c.forEach((cell: any, i: number) => {
        obj[cols[i]] = cell?.v || '';
      });
      return obj;
    });

    const normalizedRows = normalizeKeys(rows);

    const formattedRows = normalizedRows.map(row => ({
      ...row,
      date: row.date ? convertGoogleSheetsDate(row.date) : '',
      times: row.times ? convertGoogleSheetsTime(row.times) : '',
    }));

    return formattedRows;
  } catch (error) {
    console.error('Error retrieving gig data:', error);
    return [];
  }
}
// Removed duplicate/erroneous code block
