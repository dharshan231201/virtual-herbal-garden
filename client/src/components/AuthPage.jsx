import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AUTH_URL = import.meta.env.VITE_AUTH_API;

function AuthPage({ onLogin }) {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });
  const [emailSent, setEmailSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // ⏱ resend timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      const endpoint =
        mode === "login"
          ? "/auth/login"
          : mode === "register"
          ? "/auth/register"
          : "/auth/forgot-password";

      const res = await axios.post(`${AUTH_URL}${endpoint}`, formData);

      if (mode === "login") {
        onLogin(res.data.user, res.data.access_token);
        navigate("/");
      } else if (mode === "forgot") {
        setEmailSent(true);
        setCooldown(60);
        setMessage({
          type: "success",
          text: "If the account exists, a reset email has been sent.",
        });
      } else {
        setMessage({
          type: "success",
          text: "Account created successfully. You can now login.",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Request failed",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-xl shadow-xl border border-gray-200">
      <h2 className="text-3xl font-bold text-center text-green-800 mb-6">
        {mode === "login"
          ? "Login"
          : mode === "register"
          ? "Register"
          : "Forgot Password"}
      </h2>

      {/* MESSAGE */}
      {message.text && (
        <div
          className={`mb-5 p-3 rounded text-center font-medium ${
            message.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email address"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          className="w-full p-3 rounded-lg bg-[#ecf9ec] text-gray-800
                     placeholder-gray-500 border border-green-300
                     focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {mode !== "forgot" && (
          <input
            type="password"
            required
            placeholder="Password"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full p-3 rounded-lg bg-[#ecf9ec] text-gray-800
                       placeholder-gray-500 border border-green-300
                       focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        )}

        <button
          type="submit"
          disabled={mode === "forgot" && cooldown > 0}
          className={`w-full py-3 rounded-lg font-semibold text-white transition ${
            cooldown > 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {mode === "forgot"
            ? cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Send Reset Code"
            : mode === "login"
            ? "Sign In"
            : "Create Account"}
        </button>
      </form>

      {/* RESET BUTTON */}
      {mode === "forgot" && emailSent && (
        <div className="mt-5">
          <button
            onClick={() => navigate("/reset-password")}
            className="w-full bg-[#c2ecc2] text-green-900 py-2 rounded-lg font-semibold hover:bg-[#ecf9ec]"
          >
            I have a reset code → Reset Password
          </button>
        </div>
      )}

      {/* FOOTER LINKS */}
      <div className="mt-6 text-center text-sm text-gray-600">
        {mode === "login" && (
          <>
            <button
              onClick={() => setMode("register")}
              className="text-green-700 hover:underline mr-3"
            >
              Sign Up
            </button>
            <button
              onClick={() => setMode("forgot")}
              className="text-green-700 hover:underline"
            >
              Forgot Password?
            </button>
          </>
        )}

        {mode !== "login" && (
          <button
            onClick={() => setMode("login")}
            className="text-green-700 hover:underline"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
