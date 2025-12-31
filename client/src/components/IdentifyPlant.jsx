// /client/src/components/IdentifyPlant.jsx
import React, { useState } from "react";
import axios from "axios";

function IdentifyPlant() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_AI_API;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const handleIdentify = async () => {
    if (!image) return;

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
      setError(
        err.response?.data?.detail || "Failed to identify plant"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Identify Plant
      </h2>

      {/* FILE INPUT */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full mb-4"
      />

      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="mx-auto mb-4 max-h-64 rounded"
        />
      )}

      <button
        onClick={handleIdentify}
        disabled={!image || loading}
        className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? "Identifying..." : "Identify Plant"}
      </button>

      {error && (
        <p className="text-red-600 mt-4 text-center">{error}</p>
      )}

      {result && (
        <div className="mt-6 bg-green-50 p-4 rounded">
          <p><strong>Plant:</strong> {result.plant_name}</p>
          <p><strong>Description:</strong> {result.description}</p>
          <p><strong>Usage:</strong> {result.usage}</p>
          {result.confidence && (
            <p><strong>Confidence:</strong> {result.confidence}%</p>
          )}
        </div>
      )}
    </div>
  );
}

export default IdentifyPlant;
