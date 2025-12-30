import React, { useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [data, setData] = useState({
        email: '',
        resetId: searchParams.get('code') || '',
        new_password: ''
    });
    const [msg, setMsg] = useState('');

    const handleReset = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/reset-password`, data);
            setMsg("Password updated! You can now login.");
        } catch (err) {
            setMsg(err.response?.data?.detail || "Error resetting password");
        }
    };

    return (
        <div className="max-w-md mx-auto my-10 p-6 bg-white shadow-lg border rounded">
            <h2 className="text-xl font-bold mb-4">Set New Password</h2>
            <form onSubmit={handleReset} className="space-y-4">
                <input type="email" placeholder="Confirm Email" required className="w-full p-2 border"
                    onChange={e => setData({ ...data, email: e.target.value })} />
                <input type="text" placeholder="Reset Code from Email" value={data.resetId} required className="w-full p-2 border"
                    onChange={e => setData({ ...data, resetId: e.target.value })} />
                <input type="password" placeholder="New Password (8+ chars)" required className="w-full p-2 border"
                    onChange={e => setData({ ...data, new_password: e.target.value })} />
                <button className="w-full bg-blue-600 text-white py-2 rounded">Update Password</button>
            </form>
            {msg && <p className="mt-4 text-center text-blue-600">{msg}</p>}
        </div>
    );
}
export default ResetPassword;