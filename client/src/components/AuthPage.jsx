import React, { useState } from "react";
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
        navigate("/"); // ✅ SPA-safe redirect
      } else {
        setMessage({
          type: "success",
          text: res.data.message || "Please check your email.",
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
      <h2 className="text-2xl font-bold text-center mb-6 capitalize">{mode}</h2>

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

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
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

        {mode === "register" && (
          <>
            <input
              type="text"
              placeholder="First Name"
              className="w-full p-3 border rounded"
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Last Name"
              className="w-full p-3 border rounded"
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
            />
          </>
        )}

        <button className="w-full bg-green-700 text-white py-3 rounded font-bold">
          {mode === "login"
            ? "Sign In"
            : mode === "register"
            ? "Create Account"
            : "Send Reset Code"}
        </button>
      </form>

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
