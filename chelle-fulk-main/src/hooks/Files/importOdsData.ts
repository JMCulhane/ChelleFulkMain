import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { GigsDTO } from "../../models/GigsDTO";
import { odsDateToJSDate } from "../../services/formatting/odsDateConverter";
import normalizeKeys from "../../services/formatting/normalizeKeys";

const useImportOdsData = (path: string): GigsDTO[] | null => {
  const [data, setData] = useState<GigsDTO[] | null>(null);

  useEffect(() => {
    const fetchODS = async (): Promise<void> => {
      try {
        const res: Response = await fetch(path);
        const buffer: ArrayBuffer = await res.arrayBuffer();
        const workbook: XLSX.WorkBook = XLSX.read(buffer, { type: "array" });
        const sheet: XLSX.WorkSheet = workbook.Sheets[workbook.SheetNames[0]];
        let gigData = XLSX.utils.sheet_to_json<GigsDTO>(sheet);
        // First, normalize the keys on the data, so that any spaces are removed and any capitalized keys to set to lowercase.
        gigData = normalizeKeys(gigData);
        // Now format the Date data in the object so that it's more readable. When imported, ODS dates are converted to a number.
        gigData = gigData.map((item) => ({
          ...item,
          date: typeof item.date === "number" ? odsDateToJSDate(item.date) : item.date,
        })) as GigsDTO[];
        setData(gigData);
      } catch (error) {
        console.error("Failed to load or parse ODS file:", error);
        setData(null);
      }
    };

    fetchODS();
  }, [path]);

  return data;
};

export default useImportOdsData;
