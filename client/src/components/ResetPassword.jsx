import React, { useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [data, setData] = useState({
    email: "",
    resetId: searchParams.get("code") || "",
    new_password: "",
  });

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    try {
      await axios.post(
        `${import.meta.env.VITE_AUTH_API}/auth/reset-password`,
        data
      );
      setMsg("Password updated successfully! Redirecting to login...");
      // Auto redirect to login after 3 seconds
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Reset failed. Please check your code.");
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-xl border border-green-300 shadow-lg bg-white">
      <h2 className="text-3xl font-bold text-center text-green-900 mb-8">
        Set New Password
      </h2>

      {/* Success/Error Messages */}
      {(msg || error) && (
        <div className={`mb-6 p-3 rounded text-center font-medium border ${
          error ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-900 border-green-200"
        }`}>
          {msg || error}
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-4">
        {/* Email Verification */}
        <input
          type="email"
          required
          placeholder="Confirm your email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          className="w-full px-4 py-3 rounded-lg bg-[#ecf9ec] text-green-900 border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-600"
        />

        {/* Reset Code Field (Auto-filled if in URL) */}
        <input
          type="text"
          required
          placeholder="Reset Code from Email"
          value={data.resetId}
          onChange={(e) => setData({ ...data, resetId: e.target.value })}
          className="w-full px-4 py-3 rounded-lg bg-[#ecf9ec] text-green-900 border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-600"
        />

        {/* New Password with Transparent Eye Button */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="New Password (min 8 characters)"
            className="w-full px-4 py-3 pr-12 rounded-lg bg-[#ecf9ec] text-green-900 border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-600"
            onChange={(e) => setData({ ...data, new_password: e.target.value })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 text-green-600 hover:text-green-800 focus:outline-none"
            style={{ background: 'none', border: 'none' }}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Primary Action Button */}
        <button
          type="submit"
          className="w-full py-3 rounded-lg font-bold text-white bg-green-700 hover:bg-green-800 shadow-md transition-all active:scale-[0.98]"
        >
          Update Password
        </button>
      </form>

      {/* Back to Login Option */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center justify-center w-full py-2 text-green-800 font-semibold hover:underline gap-2"
        >
          <ArrowLeft size={18} /> Back to Login
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;