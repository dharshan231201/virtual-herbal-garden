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

  useEffect(() => { fetchPlantDetail(); }, [fetchPlantDetail]);

  const handleBookmarkToggle = async () => {
    if (!token || !dbUser) {
      alert("Please log in to bookmark plants.");
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (isBookmarked) {
        await axios.delete(`${PLANT_API}/bookmarks/${dbUser.email}/${plantIdNum}`, config);
      } else {
        await axios.post(`${PLANT_API}/bookmarks/`, { email: dbUser.email, plant_id: plantIdNum }, config);
      }
      onBookmarkToggled?.(plantIdNum, isBookmarked);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update bookmark.");
    }
  };

  const askAIAboutPlant = async (queryType) => {
    if (!plant?.common_name) return;
    setAiLoading(true);
    setAiError(null);
    setActiveQuery(queryType);
    setAiResponse(""); 

    const prompts = {
      combinations: `For the plant "${plant.common_name}", explain its common uses when combined with other herbs.`,
      allergies: `For the plant "${plant.common_name}", list known allergens.`,
      allergenic_mixtures: `For the plant "${plant.common_name}", describe dangerous mixtures.`
    };

    try {
      const res = await axios.post(`${AI_API}/ai/chat`, { message: prompts[queryType] });
      setAiResponse(res.data.response);
    } catch (err) {
      setAiError("Failed to get AI response. Please check if AI Service is running.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading plant details...</div>;
  if (error || !plant) return <div className="text-center text-red-600 py-10">{error || "Plant not found."}</div>;

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 my-8 border border-gray-200 max-w-4xl mx-auto">
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
          <img src={plant.image_url} alt={plant.common_name} className="max-w-lg rounded-lg shadow-md" />
        </div>
      )}

      <div className="space-y-4 text-gray-700 text-lg">
        <p><strong className="text-green-700">Description:</strong> {plant.description}</p>
        {plant.scientific_name && <p className="italic"><strong className="text-green-700">Scientific Name:</strong> {plant.scientific_name}</p>}
        {plant.uses && <p><strong className="text-green-700">Uses:</strong> {plant.uses.join(", ")}</p>}
      </div>

      {/* ================= AI SECTION ================= */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <h2 className="text-2xl font-bold mb-4 text-green-900">AI Expert Insights</h2>
        <div className="flex gap-3 mb-6 flex-wrap">
          {["combinations", "allergies", "allergenic_mixtures"].map((type) => (
            <button
              key={type}
              onClick={() => askAIAboutPlant(type)}
              className={`px-5 py-2 rounded-full border transition-all shadow-sm font-semibold ${
                activeQuery === type 
                  ? "bg-green-700 text-white border-green-700" 
                  : "bg-green-50 text-green-700 border-green-100 hover:bg-green-100"
              }`}
            >
              {type.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>

        {aiLoading && <p className="text-green-600 font-medium animate-pulse">🌿 AI is thinking...</p>}
        {aiError && <p className="text-red-600 italic bg-red-50 p-3 rounded-lg border border-red-100">{aiError}</p>}
        
        {aiResponse && (
          <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 shadow-inner">
            <div className="prose prose-green max-w-none 
                            prose-headings:text-green-900 prose-headings:font-bold
                            prose-p:text-gray-800 prose-p:leading-relaxed
                            prose-strong:text-green-800 prose-li:text-gray-800">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiResponse}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlantDetail;