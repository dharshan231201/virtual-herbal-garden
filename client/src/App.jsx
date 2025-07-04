import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase'; // Assuming your firebase config is here

// Import your components
import Navbar from './components/Navbar';
import PlantList from './components/PlantList';
import PlantDetail from './components/PlantDetail';
import AIChatAssistant from './components/AIChatAssistant';
import IdentifyPlant from './components/IdentifyPlant';
import Home from './components/Home'; // NEW IMPORT: Home component

const API_BASE_URL = 'http://3.83.150.152:8005'; // THIS MUST BE YOUR SERVER'S ACTUAL IP AND PORT 8005

function App() {
    const [user, setUser] = useState(null);
    const [userBookmarks, setUserBookmarks] = useState(new Set());
    const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false); // State for Navbar filter

    // Auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Fetch bookmarks immediately after user logs in or state changes
                await fetchUserBookmarks(currentUser);
            } else {
                setUserBookmarks(new Set()); // Clear bookmarks if logged out
            }
        });
        return () => unsubscribe();
    }, []);

    // Function to fetch user bookmarks
    const fetchUserBookmarks = useCallback(async (currentUser) => {
        if (!currentUser) {
            setUserBookmarks(new Set());
            return;
        }
        try {
            const idToken = await currentUser.getIdToken();
            const response = await axios.get(`${API_BASE_URL}/bookmarks/user/${currentUser.uid}`, {
                headers: { Authorization: `Bearer ${idToken}` }
            });
            const bookmarks = new Set(response.data.map(bookmark => bookmark.plant_id));
            setUserBookmarks(bookmarks);
            console.log("User bookmarks fetched:", bookmarks);
        } catch (error) {
            console.error("Error fetching bookmarks:", error.response ? error.response.data : error.message);
            setUserBookmarks(new Set()); // Clear bookmarks on error
        }
    }, [API_BASE_URL]);

    // Callback for when a bookmark is toggled (add/remove)
    const handleBookmarkToggled = useCallback((plantId, wasBookmarked) => {
        setUserBookmarks(prevBookmarks => {
            const newBookmarks = new Set(prevBookmarks);
            if (wasBookmarked) {
                newBookmarks.delete(plantId);
            } else {
                newBookmarks.add(plantId);
            }
            console.log("Updated bookmarks locally:", newBookmarks);
            return newBookmarks;
        });
    }, []);

    return (
        <Router>
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar
                    user={user}
                    showBookmarkedOnly={showBookmarkedOnly}
                    setShowBookmarkedOnly={setShowBookmarkedOnly}
                />
                <main className="flex-grow container mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/" element={<Home />} /> {/* Home component for root path */}
                        <Route
                            path="/plants" // PlantList now at /plants
                            element={
                                <PlantList
                                    user={user}
                                    userBookmarks={userBookmarks}
                                    onBookmarkToggled={handleBookmarkToggled}
                                    showBookmarkedOnly={showBookmarkedOnly} // Pass the state to PlantList
                                />
                            }
                        />
                        <Route
                            path="/plants/:plantId"
                            element={
                                <PlantDetail
                                    user={user}
                                    userBookmarks={userBookmarks}
                                    onBookmarkToggled={handleBookmarkToggled}
                                />
                            }
                        />
                        <Route path="/ai-assistant" element={<AIChatAssistant user={user} />} />
                        <Route path="/identify" element={<IdentifyPlant />} />
                        {/* Add other routes here if necessary */}
                    </Routes>
                </main>
                <footer className="bg-gray-800 text-white text-center p-4 mt-8">
                    <p>&copy; 2024 Virtual Herbal Garden. All rights reserved.</p>
                </footer>
            </div>
        </Router>
    );
}

export default App;
