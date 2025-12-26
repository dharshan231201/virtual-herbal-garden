import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';

// Import components
import Navbar from './components/Navbar';
import PlantList from './components/PlantList';
import PlantDetail from './components/PlantDetail';
import AIChatAssistant from './components/AIChatAssistant';
import IdentifyPlant from './components/IdentifyPlant';
import Home from './components/Home';
import AuthPage from './components/AuthPage'; 
import ResetPassword from './components/ResetPassword';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
    // Initialize user from localStorage to persist login across refreshes
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    
    const [userBookmarks, setUserBookmarks] = useState(new Set());
    const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

    // Function to fetch user bookmarks from your backend
    const fetchUserBookmarks = useCallback(async (currentUser) => {
        const token = localStorage.getItem('token');
        if (!currentUser || !token) {
            setUserBookmarks(new Set());
            return;
        }

        try {
            // Updated endpoint to use email as per your FastAPI refactor
            const response = await axios.get(`${API_BASE_URL}/bookmarks/user/${currentUser.email}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const bookmarks = new Set(response.data.map(bookmark => bookmark.plant_id));
            setUserBookmarks(bookmarks);
        } catch (error) {
            console.error("Error fetching bookmarks:", error.message);
            setUserBookmarks(new Set());
        }
    }, []);

    // Effect to handle initial load and syncing bookmarks when user changes
    useEffect(() => {
        if (user) {
            fetchUserBookmarks(user);
        } else {
            setUserBookmarks(new Set());
        }
    }, [user, fetchUserBookmarks]);

    // This function can be called by AuthPage.jsx upon successful login
    const handleLogin = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setUserBookmarks(new Set());
    };

    const handleBookmarkToggled = useCallback((plantId, wasBookmarked) => {
        setUserBookmarks(prevBookmarks => {
            const newBookmarks = new Set(prevBookmarks);
            if (wasBookmarked) {
                newBookmarks.delete(plantId);
            } else {
                newBookmarks.add(plantId);
            }
            return newBookmarks;
        });
    }, []);

    return (
        <Router>
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar
                    user={user}
                    onLogout={handleLogout}
                    showBookmarkedOnly={showBookmarkedOnly}
                    setShowBookmarkedOnly={setShowBookmarkedOnly}
                />
                <main className="flex-grow container mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route
                            path="/plants"
                            element={
                                <PlantList
                                    userBookmarks={userBookmarks}
                                    onBookmarkToggled={handleBookmarkToggled}
                                    showBookmarkedOnly={showBookmarkedOnly}
                                />
                            }
                        />
                        <Route
                            path="/plants/:plantId"
                            element={
                                <PlantDetail
                                    userBookmarks={userBookmarks}
                                    onBookmarkToggled={handleBookmarkToggled}
                                />
                            }
                        />
                        <Route path="/ai-assistant" element={<AIChatAssistant user={user} />} />
                        <Route path="/identify" element={<IdentifyPlant />} />
                        <Route path="/login" element={<AuthPage onLogin={handleLogin} />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                    </Routes>
                </main>
                <footer className="bg-gray-800 text-white text-center p-4 mt-8">
                    <p>&copy; 2025 Virtual Herbal Garden. All rights reserved.</p>
                </footer>
            </div>
        </Router>
    );
}

export default App;