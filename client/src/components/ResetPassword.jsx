import React, { useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

function ResetPassword() {
  const [searchParams] = useSearchParams();

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
      setMsg("Password updated successfully. You can now login.");
    } catch (err) {
      setError(err.response?.data?.detail || "Reset failed");
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-xl shadow-xl border border-green-200">
      <h2 className="text-2xl font-bold text-center text-green-800 mb-6">
        Set New Password
      </h2>

      <form onSubmit={handleReset} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Confirm Email"
          value={data.email}
          onChange={(e) =>
            setData({ ...data, email: e.target.value })
          }
          className="w-full p-3 rounded-lg bg-[#ecf9ec] text-green-900
                     placeholder-green-700 border border-green-300
                     focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <input
          type="text"
          required
          placeholder="Reset Code from Email"
          value={data.resetId}
          onChange={(e) =>
            setData({ ...data, resetId: e.target.value })
          }
          className="w-full p-3 rounded-lg bg-[#ecf9ec] text-green-900
                     placeholder-green-700 border border-green-300
                     focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="New Password (min 8 characters)"
            onChange={(e) =>
              setData({ ...data, new_password: e.target.value })
            }
            className="w-full p-3 pr-12 rounded-lg bg-[#ecf9ec] text-green-900
                       placeholder-green-700 border border-green-300
                       focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-green-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-semibold transition"
        >
          Update Password
        </button>
      </form>

      {msg && (
        <p className="mt-5 text-center text-green-700 font-medium">{msg}</p>
      )}

      {error && (
        <p className="mt-5 text-center text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}

export default ResetPassword;
