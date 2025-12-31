// /client/src/components/IdentifyPlant.jsx
import React, { useState } from "react";
import axios from "axios";

function IdentifyPlant() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_AI_API;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const handleIdentify = async () => {
    if (!image) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/ai/identify`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Identification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white text-gray-800 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Identify Plant from Image
      </h2>

      {/* ✅ IMAGE UPLOAD */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full mb-4"
      />

      {/* ✅ IMAGE PREVIEW */}
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-full max-h-64 object-contain mb-4 rounded"
        />
      )}

      {/* ✅ BUTTON */}
      <button
        onClick={handleIdentify}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Identifying..." : "Identify Plant"}
      </button>

      {/* ✅ ERROR */}
      {error && (
        <p className="text-red-600 text-center mt-4">{error}</p>
      )}

      {/* ✅ RESULT */}
      {result && (
        <div className="mt-6 bg-green-50 p-4 rounded">
          <p><strong>Plant:</strong> {result.plant_name}</p>
          <p><strong>Description:</strong> {result.description}</p>
          <p><strong>Usage:</strong> {result.usage}</p>
          {result.confidence !== null && (
            <p><strong>Confidence:</strong> {result.confidence}%</p>
          )}
        </div>
      )}
    </div>
  );
}

export default IdentifyPlant;
