import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function PlantDetail({ userBookmarks = new Set(), onBookmarkToggled }) {
  const { plantId } = useParams();
  const plantIdNum = Number(plantId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plant, setPlant] = useState(null);

  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [activeQuery, setActiveQuery] = useState(null);

  const PLANT_API = import.meta.env.VITE_PLANT_API;
  const AI_API = import.meta.env.VITE_AI_API;

  const token = localStorage.getItem("token");
  const dbUser = JSON.parse(localStorage.getItem("user") || "null");

  const isBookmarked = userBookmarks.has(plantIdNum);

  /* ================= FETCH PLANT ================= */
  const fetchPlantDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${PLANT_API}/plants/${plantIdNum}`);
      setPlant(res.data);
      setError(null);
    } catch {
      setError("Failed to load plant details.");
    } finally {
      setLoading(false);
    }
  }, [plantIdNum, PLANT_API]);

  useEffect(() => {
    fetchPlantDetail();
  }, [fetchPlantDetail]);

  /* ================= BOOKMARK ================= */
  const handleBookmarkToggle = async () => {
    if (!token || !dbUser) {
      alert("Please log in to bookmark plants.");
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (isBookmarked) {
        await axios.delete(
          `${PLANT_API}/bookmarks/${dbUser.email}/${plantIdNum}`,
          config
        );
      } else {
        await axios.post(
          `${PLANT_API}/bookmarks/`,
          { email: dbUser.email, plant_id: plantIdNum },
          config
        );
      }

      onBookmarkToggled?.(plantIdNum, isBookmarked);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update bookmark.");
    }
  };

  /* ================= AI ================= */
  const askAIAboutPlant = async (queryType) => {
    if (!plant?.common_name) return;

    setAiLoading(true);
    setAiError(null);
    setActiveQuery(queryType);

    const prompts = {
      combinations: `For the plant "${plant.common_name}", explain its common uses when combined with other herbs.`,
      allergies: `For the plant "${plant.common_name}", list known allergens.`,
      allergenic_mixtures: `For the plant "${plant.common_name}", describe dangerous mixtures.`
    };

    try {
      const res = await axios.post(`${AI_API}/chat`, {
        message: prompts[queryType],
      });
      setAiResponse(res.data.response);
    } catch {
      setAiError("Failed to get AI response.");
    } finally {
      setAiLoading(false);
    }
  };

  /* ================= UI STATES ================= */
  if (loading)
    return <div className="text-center py-10">Loading plant details...</div>;

  if (error || !plant)
    return (
      <div className="text-center text-red-600 py-10">
        {error || "Plant not found."}
      </div>
    );

  /* ================= UI ================= */
  return (
    <div className="bg-white rounded-lg shadow-xl p-8 my-8 border border-gray-200">
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <h1 className="text-4xl font-extrabold text-green-800">
          {plant.common_name || plant.scientific_name}
        </h1>

        {token && (
          <button onClick={handleBookmarkToggle}>
            {isBookmarked ? (
              <FaBookmark className="text-green-600 text-3xl" />
            ) : (
              <FaRegBookmark className="text-3xl text-gray-400" />
            )}
          </button>
        )}
      </div>

      {plant.image_url && (
        <div className="mb-6 flex justify-center">
          <img
            src={plant.image_url}
            alt={plant.common_name}
            className="max-w-lg rounded-lg shadow-md"
          />
        </div>
      )}

      <div className="space-y-4 text-gray-700 text-lg">
        <p>
          <strong className="text-green-700">Description:</strong>{" "}
          {plant.description}
        </p>

        {plant.scientific_name && (
          <p className="italic">
            <strong className="text-green-700">Scientific Name:</strong>{" "}
            {plant.scientific_name}
          </p>
        )}

        {plant.uses && (
          <p>
            <strong className="text-green-700">Uses:</strong>{" "}
            {plant.uses.join(", ")}
          </p>
        )}
      </div>

      {/* ================= AI SECTION ================= */}
      <div className="mt-8 pt-6 border-t">
        <h2 className="text-2xl font-bold mb-4">AI Expert Insights</h2>

        <div className="flex gap-3 mb-6 flex-wrap">
          {["combinations", "allergies", "allergenic_mixtures"].map((type) => (
            <button
              key={type}
              onClick={() => askAIAboutPlant(type)}
              className={`px-4 py-2 rounded-full border ${
                activeQuery === type
                  ? "bg-green-700 text-white"
                  : "bg-green-50 text-green-700 hover:bg-green-100"
              }`}
            >
              {type.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>

        {aiLoading && <p>Thinking...</p>}
        {aiError && <p className="text-red-600">{aiError}</p>}

        {aiResponse && (
          <div className="bg-gray-50 p-5 rounded-lg prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {aiResponse}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlantDetail;
