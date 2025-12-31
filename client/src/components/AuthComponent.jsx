import React, { useState, useEffect } from 'react';

function AuthComponent() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check if a local token exists
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <div className="flex items-center space-x-4">
            {isLoggedIn ? (
                <button 
                    onClick={handleLogout} 
                    className="bg-red-500 text-white px-4 py-2 rounded-full font-bold hover:bg-red-600 transition"
                >
                    Logout
                </button>
            ) : null}
        </div>
    );
}

export default AuthComponent;