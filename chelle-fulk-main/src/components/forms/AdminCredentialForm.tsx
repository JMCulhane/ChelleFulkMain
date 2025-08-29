
import React, { useState, FormEvent } from "react";
import PaddingWrapper from "../styling/PaddingWrapper";

const AdminCredentialForm: React.FC = () => {
  const [form, setForm] = useState({
    username: "",
    password: ""
  });
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  setLoginSuccess(false);
    try {
      // Replace with your actual backend endpoint for login
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password
        }),
      });
      if (!response.ok) {
        throw new Error("Invalid credentials or failed to retrieve credentials");
      }
      const data = await response.json();
  setLoginSuccess(true);
    } catch (err: any) {
  setError(err.message || "Unknown error");
  setLoginSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
      <PaddingWrapper basePadding="pt-32 p-4" smPadding="sm:pt-36 sm:p-6" mdPadding="md:pt-28 md:p-8">
        <div className="max-w-3xl mx-auto p-8 bg-black rounded-lg shadow-lg font-serif text-yellow-300">
          <h1 className="text-4xl font-fell mb-6 border-b border-yellow-600 pb-2 tracking-wider">
            Admin Login
          </h1>
          <form
            onSubmit={handleSubmit}
            className="space-y-8 bg-gray-900 p-8 rounded-lg border border-yellow-700 shadow-inner"
          >
            <div>
              <label
                htmlFor="username"
                className="block mb-1 font-fell tracking-wide text-yellow-300"
              >
                Username <span className="text-yellow-600">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleInputChange}
                required
                className="w-full border border-yellow-700 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-600 bg-black text-yellow-300 placeholder-yellow-600"
                placeholder="Admin username"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-1 font-fell tracking-wide text-yellow-300"
              >
                Password <span className="text-yellow-600">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleInputChange}
                required
                className="w-full border border-yellow-700 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-600 bg-black text-yellow-300 placeholder-yellow-600"
                placeholder="Admin password"
              />
            </div>
            <button
              type="submit"
              className="text-neutral-50 bg-yellow-400 hover:bg-yellow-400/80 rounded-md px-3 py-2 text-sm font-medium font-fell text-xl transition"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            {error && <div className="text-red-600 mt-4">{error}</div>}
            {loginSuccess && (
              <div className="text-green-500 mt-4">Login successful!</div>
            )}
          </form>
        </div>
      </PaddingWrapper>
  );
};

export default AdminCredentialForm;
