import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function PlantDetail({ userBookmarks, onBookmarkToggled }) {
  const { plantId } = useParams();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_PLANT_API;
  const AI_API_URL = import.meta.env.VITE_AI_API;

  const isBookmarked =
    userBookmarks && userBookmarks.has(Number(plantId));

  useEffect(() => {
    axios.get(`${API_BASE_URL}/plants/${plantId}`)
      .then(res => setPlant(res.data))
      .finally(() => setLoading(false));
  }, [plantId, API_BASE_URL]);

  if (loading) return <p>Loading...</p>;
  if (!plant) return <p>Plant not found</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold">{plant.common_name}</h1>
      <p>{plant.description}</p>
    </div>
  );
}

export default PlantDetail;
