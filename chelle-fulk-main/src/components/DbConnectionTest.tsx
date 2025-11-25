import React, { useState } from "react";
import { testDatabaseConnection } from "../services/apis/dbTestService";

const DbConnectionTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);

    try {
      const response = await testDatabaseConnection();
      setResult({
        success: response.success,
        message: response.message,
        details: {
          database: response.database,
          host: response.host,
          timestamp: response.timestamp,
        },
      });
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Connection failed",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Database Connection Test</h2>
      
      <button
        onClick={handleTest}
        disabled={testing}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: testing ? "not-allowed" : "pointer",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
        }}
      >
        {testing ? "Testing..." : "Test Connection"}
      </button>

      {result && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            borderRadius: "4px",
            backgroundColor: result.success ? "#d4edda" : "#f8d7da",
            border: `1px solid ${result.success ? "#c3e6cb" : "#f5c6cb"}`,
            color: result.success ? "#155724" : "#721c24",
          }}
        >
          <h3>{result.success ? "✓ Success" : "✗ Failed"}</h3>
          <p><strong>Message:</strong> {result.message}</p>
          
          {result.details && (
            <div style={{ marginTop: "10px", fontSize: "14px" }}>
              {result.details.database && (
                <p><strong>Database:</strong> {result.details.database}</p>
              )}
              {result.details.host && (
                <p><strong>Host:</strong> {result.details.host}</p>
              )}
              {result.details.timestamp && (
                <p><strong>Timestamp:</strong> {result.details.timestamp}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DbConnectionTest;
