import API_BASE from "../../constants/apiBase";

export const loginAdmin = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE}/session_handler.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", username, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Invalid credentials or failed to retrieve credentials");
  }
  return response.json();
};

export const logoutAdmin = async (token: string) => {
  const response = await fetch(`${API_BASE}/session_handler.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "X-Auth-Token": `Bearer ${token}` // FastCGI workaround
    },
    body: JSON.stringify({ action: "logout" })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to logout");
  }
  return response.json();
};
