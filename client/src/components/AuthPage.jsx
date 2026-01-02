import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const AUTH_URL = import.meta.env.VITE_AUTH_API;

function AuthPage({ onLogin }) {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // 'login', 'register', or 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: ""
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  // Handle countdown for "Forgot Password" resend
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
        setCooldown(60);
        setMessage({
          type: "success",
          text: "If the account exists, a reset email has been sent.",
        });
      } else {
        setMessage({
          type: "success",
          text: "Account created successfully. Please sign in.",
        });
        setMode("login");
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Request failed. Please try again.",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-xl border border-green-300 shadow-lg bg-white">
      <h2 className="text-3xl font-bold text-center text-green-900 mb-6">
        {mode === "login" ? "Login" : mode === "register" ? "Register" : "Forgot Password"}
      </h2>

      {message.text && (
        <div
          className={`mb-4 p-3 rounded text-center font-medium ${
            message.type === "error"
              ? "bg-red-100 text-red-700 border border-red-200"
              : "bg-[#c2ecc2] text-green-900 border border-green-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name fields for Registration */}
        {mode === "register" && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="First Name"
              required
              className="w-1/2 px-4 py-3 rounded-lg bg-[#ecf9ec] text-green-900 border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-600"
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Last Name"
              className="w-1/2 px-4 py-3 rounded-lg bg-[#ecf9ec] text-green-900 border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-600"
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </div>
        )}

        {/* EMAIL */}
        <input
          type="email"
          required
          placeholder="Email address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 rounded-lg bg-[#ecf9ec] text-green-900 placeholder-green-700 border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-600"
        />

        {/* PASSWORD SECTION */}
        {mode !== "forgot" && (
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              className="w-full px-4 py-3 pr-12 rounded-lg bg-[#ecf9ec] text-green-900 placeholder-green-700 border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-600"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            {/* EYE BUTTON - Fully Transparent background, only green icon visible */}
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 
                         bg-transparent border-none p-0 flex items-center justify-center
                         text-green-600 hover:text-green-800 
                         focus:outline-none focus:ring-0"
              style={{ background: 'none', border: 'none', boxShadow: 'none' }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={mode === "forgot" && cooldown > 0}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-all shadow-md active:scale-[0.98] ${
            cooldown > 0
              ? "bg-green-300 cursor-not-allowed"
              : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {mode === "forgot"
            ? cooldown > 0 ? `Resend in ${cooldown}s` : "Send Reset Code"
            : mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </form>

      {/* TOGGLE MODES */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <div className="flex gap-4">
          {mode === "login" ? (
            <>
              <button
                onClick={() => { setMode("register"); setMessage({type:"", text:""}); }}
                className="text-sm font-semibold text-green-800 hover:underline"
              >
                Create an Account
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => { setMode("forgot"); setMessage({type:"", text:""}); }}
                className="text-sm font-semibold text-green-800 hover:underline"
              >
                Forgot Password?
              </button>
            </>
          ) : (
            <button
              onClick={() => { setMode("login"); setMessage({type:"", text:""}); }}
              className="text-sm font-semibold text-green-800 hover:underline"
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;