import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const AUTH_URL = import.meta.env.VITE_AUTH_API;

function AuthPage({ onLogin }) {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [emailSent, setEmailSent] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });

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
          text: "Account created successfully. Please login.",
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
    <div className="max-w-md mx-auto my-12 p-8 rounded-xl border border-green-300">
      <h2 className="text-3xl font-bold text-center text-green-900 mb-6">
        {mode === "login"
          ? "Login"
          : mode === "register"
          ? "Register"
          : "Forgot Password"}
      </h2>

      {message.text && (
        <div
          className={`mb-4 p-3 rounded text-center font-medium ${
            message.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-[#c2ecc2] text-green-900"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* EMAIL */}
        <input
          type="email"
          required
          placeholder="Email address"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          className="w-full px-4 py-3 rounded-lg bg-[#ecf9ec]
                     text-green-900 placeholder-green-700
                     border border-green-300
                     focus:outline-none focus:ring-2 focus:ring-green-600"
        />

        {/* PASSWORD */}
        {mode !== "forgot" && (
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              className="w-full px-4 py-3 pr-12 rounded-lg bg-[#ecf9ec]
                         text-green-900 placeholder-green-700
                         border border-green-300
                         focus:outline-none focus:ring-2 focus:ring-green-600"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            {/* 👁 Eye icon — NO background */}
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2
                         text-green-700 hover:text-green-900
                         focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        )}

        {/* PRIMARY BUTTON */}
        <button
          type="submit"
          disabled={mode === "forgot" && cooldown > 0}
          className={`w-full py-3 rounded-lg font-semibold text-white transition ${
            cooldown > 0
              ? "bg-green-300 cursor-not-allowed"
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

      {/* SECONDARY ACTION BUTTONS */}
      <div className="mt-6 flex justify-center gap-4">
        {mode === "login" && (
          <>
            <button
              onClick={() => setMode("register")}
              className="px-6 py-2 rounded-lg font-semibold
                         bg-[#c2ecc2] text-green-900
                         hover:bg-[#ecf9ec]"
            >
              Sign Up
            </button>

            <button
              onClick={() => setMode("forgot")}
              className="px-6 py-2 rounded-lg font-semibold
                         bg-[#c2ecc2] text-green-900
                         hover:bg-[#ecf9ec]"
            >
              Forgot Password?
            </button>
          </>
        )}

        {mode !== "login" && (
          <button
            onClick={() => setMode("login")}
            className="px-6 py-2 rounded-lg font-semibold
                       bg-[#c2ecc2] text-green-900
                       hover:bg-[#ecf9ec]"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
