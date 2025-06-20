import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function PlantDetail({ user, userBookmarks, onBookmarkToggled }) {
    const { plantId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [aiResponse, setAiResponse] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [activeQuery, setActiveQuery] = useState(null);
    const [plant, setPlant] = useState(null);
    const API_BASE_URL = 'http://localhost:8005';
    // const API_BASE_URL = 'http://127.0.0.1:8001';
    const isBookmarked = userBookmarks.has(parseInt(plantId));

    const fetchPlantDetail = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${API_BASE_URL}/plants/${plantId}`);
            setPlant(response.data);
        } catch (err) {
            console.error("Error fetching plant details:", err);
            setError("Failed to load plant details. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [plantId, API_BASE_URL]);

    useEffect(() => {
        fetchPlantDetail();
    }, [fetchPlantDetail]);

    const handleBookmarkToggle = async () => {
        if (!user) {
            alert("Please log in to bookmark plants.");
            return;
        }

        try {
            const idToken = await user.getIdToken();
            if (isBookmarked) {
                // CORRECTED: DELETE request to match FastAPI path parameters
                await axios.delete(`${API_BASE_URL}/bookmarks/${user.uid}/${parseInt(plantId)}`, { // Correct URL
                    headers: { Authorization: `Bearer ${idToken}` },
                    // No 'data' needed for DELETE with path parameters
                });
            } else {
                // CORRECTED: POST request to match FastAPI endpoint
                await axios.post(`${API_BASE_URL}/bookmarks/`, { // Correct URL
                    user_google_id: user.uid,
                    plant_id: parseInt(plantId)
                }, {
                    headers: { Authorization: `Bearer ${idToken}` }
                });
            }
            // Notify App.jsx about the bookmark change
            onBookmarkToggled(parseInt(plantId), isBookmarked);
        } catch (err) {
            console.error("Error toggling bookmark:", err.response ? err.response.data : err.message);
            if (err.response) {
                if (err.response.status === 409) {
                    alert(`This plant is already bookmarked by you.`);
                } else if (err.response.status === 404 && isBookmarked) {
                    alert(`Bookmark not found. It might already be unbookmarked.`);
                } else {
                    alert(`Failed to update bookmark. Error: ${err.response.data.detail || err.message}`);
                }
            } else {
                alert(`Failed to update bookmark. Please try again.`);
            }
        }
    };

    const askAIAboutPlant = async (queryType) => {
        if (!plant) {
            setAiError("Plant data not loaded yet. Please wait.");
            setAiLoading(false);
            return;
        }

        setAiLoading(true);
        setAiError(null);
        setAiResponse('');
        setActiveQuery(queryType);

        let prompt = "";
        const plantName = plant.common_name;

        if (!plantName) {
            setAiError("Plant name not available. Cannot ask AI.");
            setAiLoading(false);
            return;
        }

        switch (queryType) {
            case 'combinations':
                prompt = `For the plant "${plantName}", explain its common uses when combined with other herbs or ingredients. Provide examples of beneficial combinations and their traditional/medicinal purposes.`;
                break;
            case 'allergies':
                prompt = `For the plant "${plantName}", list known allergens, common allergic reactions, and who might be particularly susceptible to allergies from it.`;
                break;
            case 'allergenic_mixtures':
                prompt = `For the plant "${plantName}", describe any known mixtures or combinations with other substances (plants, drugs, chemicals) that could potentially cause or worsen allergic reactions. Be specific if possible.`;
                break;
            default:
                prompt = `Tell me more about the medicinal uses and properties of "${plantName}".`;
                break;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/ai/chat`, { message: prompt });
            setAiResponse(response.data.response);
        } catch (err) {
            console.error("Error getting AI response:", err.response ? err.response.data : err.message);
            setAiError(`Failed to get AI response: ${err.response?.data?.detail || err.message}`);
        } finally {
            setAiLoading(false);
        }
    };

    if (loading) return <div className="text-center text-gray-600 text-lg">Loading plant details...</div>;
    if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-auto max-w-2xl" role="alert">{error}</div>;
    if (!plant) return <div className="text-center text-gray-600 text-lg">Plant not found.</div>;

    const displayPlantName = plant.common_name || plant.scientific_name || "Unknown Plant";

    return (
        <div className="bg-white rounded-lg shadow-xl overflow-hidden p-8 my-8 border border-gray-200 w-full">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h1 className="text-4xl font-extrabold text-green-800">{displayPlantName}</h1>
                {user && (
                    <button
                        onClick={handleBookmarkToggle}
                        className="text-gray-500 hover:text-green-600 transition-colors duration-200"
                        title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
                    >
                        {isBookmarked ? (
                            <FaBookmark className="text-green-600 text-3xl" />
                        ) : (
                            <FaRegBookmark className="text-3xl" />
                        )}
                    </button>
                )}
            </div>

            {plant.image_url && (
                <div className="mb-6 flex justify-center">
                    <img
                        src={plant.image_url}
                        alt={displayPlantName}
                        className="w-full max-w-lg h-auto rounded-lg shadow-md border border-gray-300 object-cover"
                        style={{ maxHeight: '400px' }}
                    />
                </div>
            )}

            <div className="mb-6">
                <p className="text-gray-700 text-lg mb-2">
                    <strong className="text-green-700">Description:</strong> {plant.description}
                </p>
                {plant.scientific_name && (
                    <p className="text-gray-600 text-base italic mb-2">
                        <strong className="text-green-700">Scientific Name:</strong> {plant.scientific_name}
                    </p>
                )}
                {plant.uses && plant.uses.length > 0 && (
                    <p className="text-gray-700 text-lg mb-2">
                        <strong className="text-green-700">Uses:</strong> {plant.uses.join(', ')}
                    </p>
                )}
                {plant.region && (
                    <p className="text-gray-700 text-lg mb-2">
                        <strong className="text-green-700">Region:</strong> {plant.region}
                    </p>
                )}
                {plant.plant_type && (
                    <p className="text-gray-700 text-lg mb-2">
                        <strong className="text-green-700">Plant Type:</strong> {plant.plant_type}
                    </p>
                )}
            </div>

            {/* AI Interaction Section (unchanged from your last provided code) */}
            <div className="mt-8 pt-6 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Ask Our AI Assistant About {displayPlantName}:</h2>
                <div className="flex flex-wrap gap-3 mb-6">
                    <button
                        onClick={() => askAIAboutPlant('combinations')}
                        className={`px-6 py-2 rounded-full text-lg font-semibold transition duration-300 ${activeQuery === 'combinations' ? 'bg-green-700 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                        disabled={aiLoading}
                    >
                        Combinations & Usage
                    </button>
                    <button
                        onClick={() => askAIAboutPlant('allergies')}
                        className={`px-6 py-2 rounded-full text-lg font-semibold transition duration-300 ${activeQuery === 'allergies' ? 'bg-green-700 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                        disabled={aiLoading}
                    >
                        Allergies
                    </button>
                    <button
                        onClick={() => askAIAboutPlant('allergenic_mixtures')}
                        className={`px-6 py-2 rounded-full text-lg font-semibold transition duration-300 ${activeQuery === 'allergenic_mixtures' ? 'bg-green-700 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                        disabled={aiLoading}
                    >
                        Allergenic Mixtures
                    </button>
                </div>

                {aiLoading && (
                    <div className="text-center text-gray-600 text-lg py-4">
                        Getting AI insights...
                    </div>
                )}

                {aiError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative w-full mb-4" role="alert">
                        <strong className="font-bold">AI Error!</strong>
                        <span className="block sm:inline"> {aiError}</span>
                    </div>
                )}

                {aiResponse && !aiLoading && (
                    <div className="bg-gray-50 border border-gray-200 p-5 rounded-lg shadow-inner">
                        <h3 className="text-xl font-semibold text-gray-700 mb-3">AI Response:</h3>
                        <div className="text-gray-800 prose">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {aiResponse}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PlantDetail;