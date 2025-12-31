import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import PlantCard from "./PlantCard";
import { FaSearch } from "react-icons/fa";

function PlantList({ userBookmarks, onBookmarkToggled, showBookmarkedOnly }) {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState("");

  const API_BASE_URL = import.meta.env.VITE_PLANT_API;

  const fetchPlants = useCallback(async () => {
    setLoading(true);
    try {
      const params = submittedSearchTerm ? { search_query: submittedSearchTerm } : {};
      const res = await axios.get(`${API_BASE_URL}/plants`, { params });
      setPlants(res.data);
    } finally {
      setLoading(false);
    }
  }, [submittedSearchTerm]);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  const filteredPlants = useMemo(() => {
    if (showBookmarkedOnly) {
      return plants.filter(p => userBookmarks.has(p.plant_id));
    }
    return plants;
  }, [plants, showBookmarkedOnly, userBookmarks]);

  if (loading) return <div className="text-center py-10">Loading plants...</div>;

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); setSubmittedSearchTerm(searchQuery); }}
            className="flex max-w-xl mx-auto mb-6">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow p-3 border rounded-l"
          placeholder="Search plants..."
        />
        <button className="bg-green-700 text-white p-3 rounded-r">
          <FaSearch />
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {filteredPlants.map(plant => (
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
