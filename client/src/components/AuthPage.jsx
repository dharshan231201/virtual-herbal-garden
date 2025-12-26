import React, { useState } from 'react';
import axios from 'axios';

const AUTH_URL = import.meta.env.VITE_AUTH_API;

function AuthPage() {
    const [mode, setMode] = useState('login'); 
    const [formData, setFormData] = useState({ 
        email: '', password: '', first_name: '', last_name: '' 
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        
        try {
            let endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
            if (mode === 'forgot') endpoint = '/auth/forgot-password';

            const response = await axios.post(`${AUTH_URL}${endpoint}`, formData);
            
            if (mode === 'login') {
                // Save the JWT and User ID for the other microservices
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                window.location.href = '/'; 
            } else {
                setMessage({ type: 'success', text: response.data.message || "Success! Please check your email." });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.detail || "Authentication failed" });
        }
    };

    return (
        <div className="max-w-md mx-auto my-10 p-8 bg-white rounded-xl shadow-2xl border border-gray-100">
            <h2 className="text-3xl font-bold mb-6 text-center text-green-800 capitalize">{mode}</h2>
            
            {message.text && (
                <div className={`p-3 mb-4 rounded-lg text-sm font-medium text-center ${
                    message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                    type="email" placeholder="Email Address" required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                
                {mode !== 'forgot' && (
                    <input 
                        type="password" placeholder="Password" required
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                )}

                {mode === 'register' && (
                    <div className="flex gap-2">
                        <input type="text" placeholder="First Name" className="w-1/2 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
                        <input type="text" placeholder="Last Name" className="w-1/2 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
                    </div>
                )}

                <button type="submit" className="w-full bg-green-700 text-white py-3 rounded-lg font-bold hover:bg-green-800 transition shadow-md">
                    {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Reset Password'}
                </button>
            </form>

            <div className="mt-6 text-sm text-center flex justify-center gap-4 text-gray-600">
                {mode === 'login' ? (
                    <>
                        <button onClick={() => setMode('register')} className="hover:text-green-700 font-semibold">Sign Up</button>
                        <span>|</span>
                        <button onClick={() => setMode('forgot')} className="hover:text-green-700 font-semibold">Forgot?</button>
                    </>
                ) : (
                    <button onClick={() => setMode('login')} className="hover:text-green-700 font-semibold">Already have an account? Login</button>
                )}
            </div>
        </div>
    );
}
export default AuthPage;