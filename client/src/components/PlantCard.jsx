import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';

function PlantCard({ plant, user, userBookmarks, onBookmarkToggled }) {

    const API_BASE_URL = 'http://3.83.150.152:8005';
    const isBookmarked = userBookmarks.has(plant.plant_id);

    const handleBookmark = async (event) => {
        event.stopPropagation();
        event.preventDefault();

        if (!user) {
            alert("Please sign in to bookmark plants!");
            return;
        }

        try {
            const idToken = await user.getIdToken();

            if (isBookmarked) {
                // CORRECTED: DELETE request to match FastAPI path parameters
                const response = await axios.delete(
                    `${API_BASE_URL}/bookmarks/${user.uid}/${plant.plant_id}`, // Correct URL with path parameters
                    {
                        headers: { Authorization: `Bearer ${idToken}` },
                        // No 'data' needed for DELETE when using path parameters
                    }
                );
                console.log('Bookmark removed successfully:', response.status); // 204 No Content, so no data
            } else {
                const bookmarkData = {
                    plant_id: plant.plant_id,
                    user_google_id: user.uid
                };
                // CORRECTED: POST request to match FastAPI endpoint
                const response = await axios.post(
                    `${API_BASE_URL}/bookmarks/`, // Correct URL for POST
                    bookmarkData,
                    {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                            'Content-Type': 'application/json'
                        },
                    }
                );
                console.log('Bookmark added successfully:', response.data);
            }

            if (onBookmarkToggled) {
                onBookmarkToggled(plant.plant_id, isBookmarked);
            }

        } catch (error) {
            console.error('Error toggling bookmark:', error.response ? error.response.data : error.message);
            if (error.response) {
                if (error.response.status === 409) {
                    alert(`Plant "${plant.common_name}" is already bookmarked by you.`);
                } else if (error.response.status === 404 && isBookmarked) {
                    alert(`Bookmark for "${plant.common_name}" not found. It might already be unbookmarked.`);
                } else {
                    alert(`Failed to toggle bookmark for "${plant.common_name}". Error: ${error.response.data.detail || error.message}`);
                }
            } else {
                alert(`Failed to toggle bookmark for "${plant.common_name}". Please try again.`);
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 relative">
            <button
                onClick={handleBookmark}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white bg-opacity-85 hover:bg-opacity-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                disabled={!user}
                title={isBookmarked ? "Unbookmark Plant" : "Bookmark Plant"}
                aria-label={isBookmarked ? "Unbookmark Plant" : "Bookmark Plant"}
            >
                {isBookmarked ? (
                    <FaBookmark className="text-xl text-yellow-500 drop-shadow-sm" />
                ) : (
                    <FaRegBookmark className="text-xl text-gray-800 drop-shadow-sm" />
                )}
            </button>

            <Link to={`/plants/${plant.plant_id}`} className="block">
                {plant.image_url ? (
                    <img
                        src={plant.image_url}
                        alt={plant.common_name}
                        className="w-full h-48 object-cover rounded-t-lg"
                    />
                ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-t-lg">
                        No Image
                    </div>
                )}
                <div className="p-4 text-center">
                    <h3 className="text-xl font-semibold text-gray-800 hover:text-green-700 transition-colors duration-200">
                        {plant.common_name}
                    </h3>
                </div>
            </Link>
        </div>
    );
}

export default PlantCard;
