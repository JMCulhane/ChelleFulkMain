import API_BASE from "../../constants/apiBase";

export const loginAdmin = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    throw new Error("Invalid credentials or failed to retrieve credentials");
  }
  return response.json();
};
