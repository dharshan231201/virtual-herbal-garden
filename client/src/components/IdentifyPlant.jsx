// /client/src/components/IdentifyPlant.jsx
import React, { useState } from "react";
import axios from "axios";

function IdentifyPlant() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_AI_API;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPrediction(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!image) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError(null);
    setPrediction(null);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/ai/identify`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setPrediction(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to identify plant."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 my-8 bg-white rounded-lg shadow-lg border w-full">
      <h2 className="text-3xl font-bold mb-6">Identify Plant</h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="mb-4"
      />

      {previewUrl && (
        <img
          src={previewUrl}
          alt="preview"
          className="max-w-xs rounded mb-4"
        />
      )}

      <button
        onClick={handleUpload}
        disabled={!image || loading}
        className="px-6 py-2 bg-green-700 text-white rounded disabled:opacity-50"
      >
        {loading ? "Identifying..." : "Identify Plant"}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {prediction && (
        <div className="mt-6 bg-green-50 p-4 rounded w-full max-w-md">
          <p><strong>Plant Name:</strong> {prediction.plant_name}</p>
          <p><strong>Description:</strong> {prediction.description}</p>
          <p><strong>Usage:</strong> {prediction.usage}</p>
          {prediction.confidence !== null && (
            <p><strong>Confidence:</strong> {prediction.confidence}%</p>
          )}
        </div>
      )}
    </div>
  );
}

export default IdentifyPlant;
