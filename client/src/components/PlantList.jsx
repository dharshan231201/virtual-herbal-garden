import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import PlantCard from './PlantCard';
import { FaSearch } from 'react-icons/fa';

function PlantList({ user, userBookmarks, onBookmarkToggled, showBookmarkedOnly }) { // Removed setShowBookmarkedOnly as prop
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');

  // const API_BASE_URL = 'http://127.0.0.1:8001';
  const API_BASE_URL = 'http://localhost:8005';
  const fetchPlants = useCallback(async () => {
    const controller = new AbortController();
    const signal = controller.signal;

    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (submittedSearchTerm) {
        params.q = submittedSearchTerm;
      }

      console.log("Fetching plants with params:", params);
      const response = await axios.get(`${API_BASE_URL}/plants/`, { params, signal });
      setPlants(response.data);
      console.log("Plants fetched successfully:", response.data);
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Request cancelled:', err.message);
      } else {
        console.error("Error fetching plants:", err.response ? err.response.data : err.message);
        setError(err);
      }
    } finally {
      setLoading(false);
    }

    return () => {
      controller.abort();
    };
  }, [submittedSearchTerm, API_BASE_URL]);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  const handleSearchChange = (e) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);

    if (newQuery === '') {
      setSubmittedSearchTerm('');
    }
  };

  const filteredPlants = useMemo(() => {
    let currentPlants = plants;

    // The showBookmarkedOnly filter will now be controlled externally, e.g., by Navbar or a dedicated route
    if (showBookmarkedOnly && user) {
      currentPlants = currentPlants.filter(plant => userBookmarks.has(plant.plant_id));
    }
    return currentPlants;
  }, [plants, showBookmarkedOnly, user, userBookmarks]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSubmittedSearchTerm(searchQuery);
  };

  if (loading) return <div className="text-center text-gray-600 text-xl py-10">Loading plants...</div>;
  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center mx-auto my-8 max-w-lg" role="alert">
      <strong className="font-bold">Error!</strong>
      <span className="block sm:inline"> Failed to load plants. Please try again later.</span>
    </div>
  );

  return (
    <div className="p-4">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
        Medicinal Plant Encyclopedia
      </h1>

      <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-grow flex w-full sm:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search plants by name, description, or uses..."
            className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base
                                   placeholder-gray-500 text-gray-700"
          />
          <button
            type="submit"
            className="p-3 bg-white text-black rounded-r-lg border border-gray-300 hover:bg-gray-100 transition duration-300 flex items-center justify-center w-14 h-auto shadow-sm" // Changed to white background, black text, added border and shadow
            aria-label="Search"
          >
            <FaSearch className="text-2xl" />
          </button>
        </form>
        {/* "Show My Bookmarks" checkbox removed as per request */}
      </div>

      {filteredPlants.length === 0 && !loading && (
        <p className="text-center text-gray-500 text-lg py-10">No plants found matching your criteria.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {filteredPlants.map((plant) => (
          <PlantCard
            key={plant.plant_id}
            plant={plant}
            user={user}
            userBookmarks={userBookmarks}
            onBookmarkToggled={onBookmarkToggled}
          />
        ))}
      </div>
    </div>
  );
}

export default PlantList;