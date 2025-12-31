import React, { useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

function ResetPassword() {
  const [searchParams] = useSearchParams();

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
      setMsg("✅ Password updated! You can now login.");
    } catch (err) {
      setError(err.response?.data?.detail || "Error resetting password");
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white shadow-xl border border-gray-200 rounded-xl">
      <h2 className="text-2xl font-bold text-center text-green-800 mb-6">
        Set New Password
      </h2>

      <form onSubmit={handleReset} className="space-y-5">
        {/* Email */}
        <input
          type="email"
          placeholder="Confirm Email"
          required
          value={data.email}
          onChange={(e) =>
            setData({ ...data, email: e.target.value })
          }
          className="w-full p-3 rounded-lg bg-[#ecf9ec] text-gray-800
                     placeholder-gray-500 border border-green-300
                     focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {/* Reset Code */}
        <input
          type="text"
          placeholder="Reset Code from Email"
          required
          value={data.resetId}
          onChange={(e) =>
            setData({ ...data, resetId: e.target.value })
          }
          className="w-full p-3 rounded-lg bg-[#ecf9ec] text-gray-800
                     placeholder-gray-500 border border-green-300
                     focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {/* New Password */}
        <input
          type="password"
          placeholder="New Password (min 8 characters)"
          required
          onChange={(e) =>
            setData({ ...data, new_password: e.target.value })
          }
          className="w-full p-3 rounded-lg bg-[#ecf9ec] text-gray-800
                     placeholder-gray-500 border border-green-300
                     focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {/* Button */}
        <button
          type="submit"
          className="w-full bg-green-700 hover:bg-green-800
                     text-white py-3 rounded-lg font-semibold
                     transition-colors duration-200"
        >
          Update Password
        </button>
      </form>

      {/* Messages */}
      {msg && (
        <p className="mt-5 text-center text-green-700 font-medium">
          {msg}
        </p>
      )}

      {error && (
        <p className="mt-5 text-center text-red-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

export default ResetPassword;
