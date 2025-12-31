import React from "react";
import { Link, useLocation } from "react-router-dom";
import AuthComponent from "./AuthComponent";

function Navbar({ user, showBookmarkedOnly, setShowBookmarkedOnly }) {
  const location = useLocation();
  const isPlantsPage = location.pathname === "/plants";

  return (
    <nav className="bg-green-700 shadow-lg p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">

        <Link to="/" className="text-2xl font-extrabold">
          Virtual Herbal Garden
        </Link>

        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/">Home</Link>
          <Link to="/plants">Browse Plants</Link>
          <Link to="/ai-assistant">AI Assistant</Link>
          <Link to="/identify">Identify Plant</Link>
        </div>

        <div className="flex items-center space-x-4">

          {/* Favorites only on plants page */}
          {user && isPlantsPage && (
            <label className="flex items-center bg-green-800 px-3 py-1 rounded-full text-sm cursor-pointer">
              <span className="mr-2">Favorites Only</span>
              <input
                type="checkbox"
                checked={showBookmarkedOnly}
                onChange={(e) => setShowBookmarkedOnly(e.target.checked)}
                className="h-4 w-4 rounded"
              />
            </label>
          )}

          {!user && (
            <Link
              to="/login"
              className="bg-white text-green-700 px-4 py-2 rounded-full font-bold text-sm"
            >
              Login / Sign Up
            </Link>
          )}

          {user && <AuthComponent />}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
