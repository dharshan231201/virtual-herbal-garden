// /client/src/components/PlantList.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import PlantCard from './PlantCard';
import { FaSearch } from 'react-icons/fa';

function PlantList({ userBookmarks, onBookmarkToggled, showBookmarkedOnly }) {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');
  
  const API_BASE_URL = import.meta.env.VITE_PLANT_API;
  const token = localStorage.getItem('token');

  const fetchPlants = useCallback(async () => {
    setLoading(true);
    try {
      const params = submittedSearchTerm ? { search_query: submittedSearchTerm } : {};
      const response = await axios.get(`${API_BASE_URL}/plants`, { params });
      setPlants(response.data);
    } catch (err) {
      setError("Failed to load plants.");
    } finally {
      setLoading(false);
    }
  }, [submittedSearchTerm, API_BASE_URL]);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  const filteredPlants = useMemo(() => {
    if (showBookmarkedOnly && token) {
      return plants.filter(plant => userBookmarks.has(plant.plant_id));
    }
    return plants;
  }, [plants, showBookmarkedOnly, token, userBookmarks]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSubmittedSearchTerm(searchQuery);
  };

  if (loading) return <div className="text-center py-10">Loading plants...</div>;

  return (
    <div className="p-4">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Herbal Library</h1>

      <div className="mb-8 flex justify-center">
        <form onSubmit={handleSearchSubmit} className="flex w-full max-w-2xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or uses..."
            className="flex-grow p-3 border rounded-l-lg outline-none focus:ring-2 focus:ring-green-500"
          />
          <button type="submit" className="p-3 bg-green-700 text-white rounded-r-lg hover:bg-green-800">
            <FaSearch />
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredPlants.map((plant) => (
          <PlantCard
            key={plant.plant_id}
            plant={plant}
            userBookmarks={userBookmarks}
            onBookmarkToggled={onBookmarkToggled}
          />
        ))}
      </div>
    </div>
  );
}

export default PlantList;