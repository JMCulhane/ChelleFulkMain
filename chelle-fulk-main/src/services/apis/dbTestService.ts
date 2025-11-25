import API_BASE from "../../constants/apiBase";

interface DbTestResponse {
  success: boolean;
  message: string;
  database?: string;
  host?: string;
  timestamp?: string;
  error?: string;
}

export const testDatabaseConnection = async (): Promise<DbTestResponse> => {
  try {
    const response = await fetch(`${API_BASE}/test_connection.php`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: DbTestResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Database connection test failed:", error);
    throw error;
  }
};
