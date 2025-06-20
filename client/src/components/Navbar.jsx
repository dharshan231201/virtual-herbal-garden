import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthComponent from './AuthComponent'; // Assuming you have this component

function Navbar({ user, showBookmarkedOnly, setShowBookmarkedOnly }) {
    const location = useLocation();

    return (
        <nav className="bg-gradient-to-r from-green-500 to-green-700 p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-white text-2xl font-bold tracking-wider">
                    Virtual Herbal Garden
                </Link>
                <div className="flex items-center space-x-6">
                    <Link
                        to="/"
                        // When clicking Home, ensure showBookmarkedOnly is false
                        onClick={() => setShowBookmarkedOnly(false)}
                        className={`text-white text-lg font-semibold hover:text-green-200 transition-colors duration-200 ${location.pathname === '/' ? 'underline' : ''}`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/plants"
                        // When clicking Browse Plants, ensure showBookmarkedOnly is false
                        onClick={() => setShowBookmarkedOnly(false)}
                        className={`text-white text-lg font-semibold hover:text-green-200 transition-colors duration-200 ${location.pathname === '/plants' && !showBookmarkedOnly ? 'underline' : ''}`}
                    >
                        Browse Plants
                    </Link>
                    <Link
                        to="/ai-assistant"
                        className={`text-white text-lg font-semibold hover:text-green-200 transition-colors duration-200 ${location.pathname === '/ai-assistant' ? 'underline' : ''}`}
                    >
                        AI Assistant
                    </Link>
                    <Link
                        to="/identify"
                        className={`text-white text-lg font-semibold hover:text-green-200 transition-colors duration-200 ${location.pathname === '/identify' ? 'underline' : ''}`}
                    >
                        Identify Plant
                    </Link>
                    {user && ( // Only show "My Bookmarks" if user is logged in
                        <Link
                            to="/plants" // Navigates to /plants to show PlantList
                            onClick={() => setShowBookmarkedOnly(true)} // Sets filter for PlantList
                            className={`text-white text-lg font-semibold hover:text-green-200 transition-colors duration-200 ${location.pathname === '/plants' && showBookmarkedOnly ? 'underline' : ''}`}
                        >
                            My Bookmarks
                        </Link>
                    )}
                    <AuthComponent />
                </div>
            </div>
        </nav>
    );
}

export default Navbar;