
import React, { useState, FormEvent } from "react";
import PaddingWrapper from "../styling/PaddingWrapper";
import Spinner from "../errors/Spinner";
import { loginAdmin } from '../../services/apis/adminService';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminCredentialForm: React.FC = () => {
  const { setCredentials } = useAdminAuth();
  const [form, setForm] = useState({
    username: "",
    password: ""
  });
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
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
    setStatus(null);
    setLoading(true);
    try {
      const credentials = await loginAdmin(form.username, form.password);
      setCredentials(credentials);
      setStatus({ success: true, message: "Login successful!" });
    } catch (err: any) {
      setStatus({ success: false, message: err.message || "Unknown error" });
      setCredentials(null);
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
            <div className="flex items-center gap-4">
              <button
                type="submit"
                className="text-neutral-50 bg-yellow-400 hover:bg-yellow-400/80 rounded-md px-3 py-2 text-sm font-medium font-fell text-xl transition"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
              {loading && <Spinner size={28} />}
            </div>
            {status && (
              <div className={`mt-4 text-lg font-semibold ${status.success ? 'text-green-400' : 'text-red-400'}`}
                   role="alert">
                {status.message}
              </div>
            )}
          </form>
        </div>
      </PaddingWrapper>
  );
};

export default AdminCredentialForm;
