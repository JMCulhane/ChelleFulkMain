import React, { useState } from "react";
import { testDatabaseConnection } from "../services/apis/dbTestService";
import { useAdminAuth } from "../context/AdminAuthContext";

const DbConnectionTest: React.FC = () => {
  const { credentials } = useAdminAuth();
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
      console.log('Details are:', response);
      setResult({
        success: response.success,
        message: response.message,
        details: response,
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

  // Check if user is admin
  if (!credentials?.token) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "60vh",
        padding: "20px" 
      }}>
        <div style={{
          padding: "40px",
          borderRadius: "8px",
          backgroundColor: "#f8d7da",
          border: "1px solid #f5c6cb",
          color: "#721c24",
          maxWidth: "500px",
          textAlign: "center"
        }}>
          <h2 style={{ marginBottom: "10px" }}>Access Denied</h2>
          <p>You must be logged in as an administrator to access the database connection test.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      paddingTop: "120px",
      paddingBottom: "40px",
      minHeight: "100vh"
    }}>
      <div style={{ maxWidth: "800px", width: "100%", padding: "20px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "30px", fontSize: "2rem" }}>Database Connection Test</h2>
        
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px" }}>
          <button
            onClick={handleTest}
            disabled={testing}
            style={{
              padding: "12px 32px",
              fontSize: "18px",
              cursor: testing ? "not-allowed" : "pointer",
              backgroundColor: testing ? "#6c757d" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              transition: "all 0.3s ease"
            }}
          >
            {testing ? "Testing..." : "Test Connection"}
          </button>
        </div>

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
              
              {/* All Tables Section */}
              {result.details.all_tables && result.details.all_tables.length > 0 && (
                <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #ccc" }}>
                  <p><strong>Database Tables ({result.details.all_tables.length}):</strong></p>
                  <table style={{ 
                    width: "100%", 
                    marginTop: "10px", 
                    borderCollapse: "collapse",
                    fontSize: "13px"
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f0f0f0", textAlign: "left" }}>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>Table Name</th>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>Row Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.details.all_tables.map((table: any, index: number) => (
                        <tr key={index}>
                          <td style={{ padding: "8px", border: "1px solid #ddd" }}>{table.name}</td>
                          <td style={{ padding: "8px", border: "1px solid #ddd" }}>{table.row_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Admin table/user details removed as requested */}
              {result.details.php_version && (
                <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #ccc" }}>
                  <p><strong>PHP Version:</strong> {result.details.php_version}</p>
                  {result.details.features && (
                    <div style={{ marginLeft: "20px", marginTop: "5px" }}>
                      <p><strong>Features:</strong></p>
                      <p>password_hash: {result.details.features.password_hash ? '✓ Available' : '✗ Not Available'}</p>
                      <p>random_bytes: {result.details.features.random_bytes ? '✓ Available' : '✗ Not Available'}</p>
                      <p>openssl: {result.details.features.openssl ? '✓ Available' : '✗ Not Available'}</p>
                      <p>mysqli: {result.details.features.mysqli ? '✓ Available' : '✗ Not Available'}</p>
                      <p>session: {result.details.features.session ? '✓ Available' : '✗ Not Available'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default DbConnectionTest;
