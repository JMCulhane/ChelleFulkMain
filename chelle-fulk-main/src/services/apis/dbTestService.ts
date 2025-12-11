import API_BASE from "../../constants/apiBase";

interface DbTestResponse {
  success: boolean;
  message: string;
  database?: string;
  host?: string;
  timestamp?: string;
  error?: string;
}

export const testDatabaseConnection = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/test_connection.php`);
    const text = await response.text();
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: DbTestResponse = JSON.parse(text);
    return data;
  } catch (error) {
    console.error("Database connection test failed:", error);
    throw error;
  }
};
