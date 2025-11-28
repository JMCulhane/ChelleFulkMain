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
    console.log('Calling:', `${API_BASE}/test_connection.php`);
    const response = await fetch(`${API_BASE}/test_connection.php`);
    
    console.log('Response status:', response.status);
    console.log('Response content-type:', response.headers.get('content-type'));
    
    const text = await response.text();
    console.log('Raw response:', text.substring(0, 200));
    
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
