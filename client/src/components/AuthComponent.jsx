import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

// Define your API_BASE_URL here.
// IMPORTANT: Ensure this matches your EC2 public IP and backend port exactly, without any spaces.
const API_BASE_URL = 'http://3.83.150.152:8005';

function AuthComponent() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    // This useEffect hook runs whenever the Firebase authentication state changes.
    // It's the perfect place to get the current user and send their data to your backend.
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser); // Update the local state with the Firebase user

            // If a user is currently logged in via Firebase
            if (currentUser) {
                try {
                    // Prepare user data for your backend's /users/sync endpoint.
                    // Your backend's `schemas.UserCreate` expects `google_id`, `email`, `first_name`, `last_name`.
                    const userDataForBackend = {
                        google_id: currentUser.uid, // Firebase UID maps to your backend's google_id
                        email: currentUser.email,
                        // Firebase displayName might contain a full name.
                        // For simplicity, we'll use it for first_name and set last_name to null.
                        // Adjust if your backend or schema requires specific parsing for first/last names.
                        first_name: currentUser.displayName || currentUser.email, // Fallback to email if displayName is null
                        last_name: null // Assuming last_name can be null in your DB or not critical for initial sync
                    };

                    // Make the API call to your backend's /users/sync endpoint
                    const response = await fetch(`${API_BASE_URL}/users/sync`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            // While your current /users/sync endpoint doesn't use it,
                            // sending the Firebase ID token in the Authorization header is good practice
                            // for authenticated API calls and necessary if you add server-side token verification later.
                            'Authorization': `Bearer ${await currentUser.getIdToken()}`
                        },
                        body: JSON.stringify(userDataForBackend)
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error("Backend user sync error: ", errorData);
                        setError(new Error(errorData.detail || "Backend user synchronization failed"));
                    } else {
                        const backendUserData = await response.json();
                        console.log("User successfully synced with backend: ", backendUserData);
                        // At this point, the user should be in your RDS database.
                        // You can now optionally update your app's global state/context
                        // with the user data returned by your backend.
                    }

                } catch (apiError) {
                    console.error("Error sending user data to backend: ", apiError);
                    setError(apiError);
                }
            } else {
                // User is signed out from Firebase, clear any backend-related user info if necessary
                console.log("User signed out from Firebase.");
            }
        });

        // Cleanup function for useEffect
        return () => unsubscribe();
    }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount.

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            // After successful popup sign-in, the onAuthStateChanged listener
            // (in the useEffect above) will automatically detect the new user
            // and trigger the backend sync.
        } catch (error) {
            console.error("Error signing in with Google: ", error);
            setError(error);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            // Optionally, if you have a backend logout endpoint that clears server-side sessions/tokens,
            // you would call it here:
            // await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
        } catch (error) {
            console.error("Error signing out: ", error);
            setError(error);
        }
    };

    // Render logic for displaying user info or sign-in/sign-out buttons
    if (error && error.code !== 'auth/popup-closed-by-user') {
        return <div className="text-red-700">Auth Error: {error.message}</div>;
    }

    return (
        <div className="flex items-center space-x-4">
            {user ? (
                <>
                    {/* Ensure text is visible on the green Navbar background */}
                    <span className="text-white text-lg font-semibold hidden md:inline">Welcome, {user.displayName || user.email}!</span>
                    <button
                        onClick={handleSignOut}
                        className="!bg-red-600 !text-white !font-bold py-2 px-4 rounded-full shadow-lg hover:!bg-red-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                    >
                        Sign Out
                    </button>
                </>
            ) : (
                <button
                    onClick={signInWithGoogle}
                    className="!bg-blue-600 !text-white !font-bold py-2 px-4 rounded-full shadow-lg hover:!bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                >
                    Sign In with Google
                </button>
            )}
        </div>
    );
}

export default AuthComponent;
