import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function PlantDetail({ userBookmarks, onBookmarkToggled }) {
    const { plantId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [aiResponse, setAiResponse] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [activeQuery, setActiveQuery] = useState(null);
    const [plant, setPlant] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_PLANT_API;
    const isBookmarked = userBookmarks.has(parseInt(plantId));

    // Get Auth data from local storage
    const token = localStorage.getItem('token');
    const dbUser = JSON.parse(localStorage.getItem('user'));

    const fetchPlantDetail = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/plants/${plantId}`);
            setPlant(response.data);
        } catch (err) {
            setError("Failed to load plant details.");
        } finally {
            setLoading(false);
        }
    }, [plantId, API_BASE_URL]);

    useEffect(() => {
        fetchPlantDetail();
    }, [fetchPlantDetail]);

    const handleBookmarkToggle = async () => {
        if (!token || !dbUser) {
            alert("Please log in to bookmark plants.");
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const userEmail = dbUser.email;

            if (isBookmarked) {
                // DELETE: /bookmarks/{email}/{plant_id}
                await axios.delete(`${API_BASE_URL}/bookmarks/${userEmail}/${parseInt(plantId)}`, config);
            } else {
                // POST: Body uses email as the identifier
                await axios.post(`${API_BASE_URL}/bookmarks/`, {
                    email: userEmail,
                    plant_id: parseInt(plantId)
                }, config);
            }
            onBookmarkToggled(parseInt(plantId), isBookmarked);
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to update bookmark.");
        }
    };

    const askAIAboutPlant = async (queryType) => {
        if (!plant?.common_name) return;
        setAiLoading(true);
        setAiError(null);
        setActiveQuery(queryType);

        const prompts = {
            combinations: `For the plant "${plant.common_name}", explain its common uses when combined with other herbs...`,
            allergies: `For the plant "${plant.common_name}", list known allergens...`,
            allergenic_mixtures: `For the plant "${plant.common_name}", describe dangerous mixtures...`
        };

        try {
            const response = await axios.post(`${API_BASE_URL}/ai/chat`, { message: prompts[queryType] });
            setAiResponse(response.data.response);
        } catch (err) {
            setAiError("Failed to get AI response.");
        } finally {
            setAiLoading(false);
        }
    };

    if (loading) return <div className="text-center py-10">Loading plant details...</div>;
    if (error || !plant) return <div className="text-center text-red-600 py-10">{error || "Plant not found."}</div>;

    return (
        <div className="bg-white rounded-lg shadow-xl p-8 my-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <h1 className="text-4xl font-extrabold text-green-800">{plant.common_name || plant.scientific_name}</h1>
                {token && (
                    <button onClick={handleBookmarkToggle} className="transition-colors duration-200">
                        {isBookmarked ? <FaBookmark className="text-green-600 text-3xl" /> : <FaRegBookmark className="text-3xl text-gray-400" />}
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
                {plant.uses && <p><strong className="text-green-700">Uses:</strong> {plant.uses.join(', ')}</p>}
            </div>

            <div className="mt-8 pt-6 border-t">
                <h2 className="text-2xl font-bold mb-4">AI Expert Insights</h2>
                <div className="flex gap-3 mb-6">
                    {['combinations', 'allergies', 'allergenic_mixtures'].map(type => (
                        <button key={type} onClick={() => askAIAboutPlant(type)} 
                                className={`px-4 py-2 rounded-full border ${activeQuery === type ? 'bg-green-700 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                            {type.replace('_', ' ').toUpperCase()}
                        </button>
                    ))}
                </div>
                {aiLoading ? <p>Thinking...</p> : aiResponse && (
                    <div className="bg-gray-50 p-5 rounded-lg prose max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiResponse}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PlantDetail;