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

  // ⏱ Resend timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      let endpoint =
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
          text: "Account created successfully.",
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
    <div className="max-w-md mx-auto my-10 p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 capitalize">
        {mode === "forgot" ? "Forgot Password" : mode}
      </h2>

      {message.text && (
        <div
          className={`mb-4 p-3 rounded text-center ${
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
          className="w-full p-3 border rounded"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
        />

        {mode !== "forgot" && (
          <input
            type="password"
            required
            placeholder="Password"
            className="w-full p-3 border rounded"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        )}

        <button
          type="submit"
          disabled={mode === "forgot" && cooldown > 0}
          className={`w-full py-3 rounded font-bold text-white ${
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

      {/* AFTER EMAIL SENT */}
      {mode === "forgot" && emailSent && (
        <div className="mt-6 space-y-3 text-center">
          <button
            onClick={() => navigate("/reset-password")}
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700"
          >
            I have a reset code → Reset Password
          </button>
        </div>
      )}

      {/* FOOTER ACTIONS */}
      <div className="mt-6 text-center text-sm">
        {mode === "login" ? (
          <>
            <button onClick={() => setMode("register")} className="mr-3">
              Sign Up
            </button>
            <button onClick={() => setMode("forgot")}>Forgot?</button>
          </>
        ) : (
          <button onClick={() => setMode("login")}>Back to Login</button>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
