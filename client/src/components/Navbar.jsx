import React from 'react';
import { Link } from 'react-router-dom';
import AuthComponent from './AuthComponent';

function Navbar({ user, showBookmarkedOnly, setShowBookmarkedOnly }) {
    // Check local storage since we removed Firebase 'user' state
    const localUser = localStorage.getItem('token');

    return (
        <nav className="bg-green-700 shadow-lg p-4 text-white">
            <div className="container mx-auto flex flex-wrap justify-between items-center">
                <Link to="/" className="text-2xl font-extrabold tracking-tight hover:text-green-200 transition">
                    Virtual Herbal Garden
                </Link>

                <div className="hidden md:flex space-x-8 items-center font-medium">
                    <Link to="/" className="hover:text-green-200 transition">Home</Link>
                    <Link to="/plants" className="hover:text-green-200 transition">Browse Plants</Link>
                    <Link to="/ai-assistant" className="hover:text-green-200 transition">AI Assistant</Link>
                    <Link to="/identify" className="hover:text-green-200 transition">Identify Plant</Link>
                </div>

                <div className="flex items-center space-x-4">
                    {localUser && (
                        <label className="flex items-center cursor-pointer bg-green-800 px-3 py-1 rounded-full text-sm">
                            <span className="mr-2">Favorites Only</span>
                            <input
                                type="checkbox"
                                checked={showBookmarkedOnly}
                                onChange={(e) => setShowBookmarkedOnly(e.target.checked)}
                                className="form-checkbox h-4 w-4 text-green-500 rounded"
                            />
                        </label>
                    )}

                    {!localUser && (
                        <Link 
                            to="/login" 
                            className="bg-white text-green-700 px-4 py-2 rounded-full font-bold text-sm shadow-md hover:bg-gray-100 transition"
                        >
                            Login / Sign Up
                        </Link>
                    )}

                    <AuthComponent />
                </div>
            </div>
        </nav>
    );
}

export default Navbar;