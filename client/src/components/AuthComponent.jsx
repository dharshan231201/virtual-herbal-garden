import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

function AuthComponent() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google: ", error);
            setError(error);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error);
            setError(error);
        }
    };

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
                        // Added !important or more specific classes might be needed if still overridden.
                        // Let's try explicit Tailwind classes for background and text first.
                        className="!bg-red-600 !text-white !font-bold py-2 px-4 rounded-full shadow-lg hover:!bg-red-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                    >
                        Sign Out
                    </button>
                </>
            ) : (
                <button
                    onClick={signInWithGoogle}
                    // Added !important or more specific classes might be needed if still overridden.
                    // Let's try explicit Tailwind classes for background and text first.
                    className="!bg-blue-600 !text-white !font-bold py-2 px-4 rounded-full shadow-lg hover:!bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                >
                    Sign In with Google
                </button>
            )}
        </div>
    );
}

export default AuthComponent;