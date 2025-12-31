import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import PlantCard from "./PlantCard";

function PlantList({ userBookmarks, onBookmarkToggled, showBookmarkedOnly }) {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_PLANT_API;

  const fetchPlants = useCallback(async () => {
    setLoading(true);
    const res = await axios.get(`${API_BASE_URL}/plants`);
    setPlants(res.data);
    setLoading(false);
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  const filteredPlants = useMemo(() => {
    if (showBookmarkedOnly) {
      return plants.filter(p => userBookmarks.has(p.plant_id));
    }
    return plants;
  }, [plants, showBookmarkedOnly, userBookmarks]);

  if (loading) return <p>Loading plants...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {filteredPlants.map(plant => (
        <PlantCard
          key={plant.plant_id}
          plant={plant}
          userBookmarks={userBookmarks}
          onBookmarkToggled={onBookmarkToggled}
        />
      ))}
    </div>
  );
}

export default PlantList;
