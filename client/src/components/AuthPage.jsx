import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AUTH_URL = import.meta.env.VITE_AUTH_API;
const RESEND_TIME = 30; // seconds

function AuthPage() {
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  const [message, setMessage] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [timer, setTimer] = useState(0);

  const navigate = useNavigate();

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const sendResetCode = async () => {
    await axios.post(`${AUTH_URL}/auth/forgot-password`, {
      email: formData.email,
    });
    setResetSent(true);
    setTimer(RESEND_TIME);
    setMessage("Reset code sent to your email.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (mode === "forgot") {
        await sendResetCode();
        return;
      }

      const endpoint =
        mode === "login" ? "/auth/login" : "/auth/register";

      const res = await axios.post(`${AUTH_URL}${endpoint}`, formData);

      if (mode === "login") {
        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/");
      } else {
        setMessage("Account created successfully.");
      }
    } catch (err) {
      setMessage(err.response?.data?.detail || "Request failed");
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-8 bg-white shadow-xl rounded">
      <h2 className="text-2xl font-bold text-center mb-2 capitalize">
        {mode === "forgot" ? "Forgot Password" : mode}
      </h2>

      {message && (
        <p className="text-center text-sm text-green-700 mb-4">
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email address"
          className="w-full p-3 border rounded"
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

        <button className="w-full bg-green-700 text-white py-3 rounded font-semibold">
          {mode === "login"
            ? "Sign In"
            : mode === "register"
            ? "Create Account"
            : "Send Reset Code"}
        </button>
      </form>

      {/* Forgot Password UX */}
      {resetSent && (
        <div className="mt-6 space-y-3 text-center">
          <p className="text-sm text-gray-600">
            Check your inbox (and spam folder) for the reset code.
          </p>

          <button
            onClick={() => navigate("/reset-password")}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            🔐 Reset Password
          </button>

          {timer > 0 ? (
            <p className="text-xs text-gray-500">
              Resend available in {timer}s
            </p>
          ) : (
            <button
              onClick={sendResetCode}
              className="text-sm text-blue-600 underline"
            >
              Didn’t get the email? Resend code
            </button>
          )}
        </div>
      )}

      {/* Footer Links */}
      <div className="mt-6 text-sm text-center">
        {mode === "login" && (
          <>
            <button onClick={() => setMode("register")}>
              Sign Up
            </button>{" "}
            |{" "}
            <button onClick={() => setMode("forgot")}>
              Forgot?
            </button>
          </>
        )}

        {mode !== "login" && (
          <button onClick={() => setMode("login")}>
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
