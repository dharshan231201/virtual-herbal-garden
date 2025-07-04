import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function AIChatAssistant() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const messagesEndRef = useRef(null);

    const API_BASE_URL = 'http://3.83.150.152:8005';
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleInputChange = (e) => {
        setInputMessage(e.target.value);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (inputMessage.trim() === '') return;

        const newMessage = { sender: 'user', text: inputMessage.trim() };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setInputMessage('');

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${API_BASE_URL}/ai/chat`, { message: newMessage.text });
            const aiResponse = { sender: 'ai', text: response.data.response };
            setMessages((prevMessages) => [...prevMessages, aiResponse]);
        } catch (err) {
            console.error("Error communicating with AI:", err.response ? err.response.data : err.message);
            setError("Failed to get response from AI. Please try again.");
            setMessages((prevMessages) => [...prevMessages, { sender: 'ai', text: "Sorry, I couldn't process that. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[70vh] bg-white rounded-lg shadow-lg overflow-hidden p-6 my-8 border border-gray-200 w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">AI Assistant</h2>

            {/* Chat Messages Display Area */}
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar mb-4 bg-gray-50 p-3 rounded-lg">
                {messages.length === 0 && (
                    <p className="text-center text-gray-500 mt-10">Type a message to start chatting with the AI!</p>
                )}
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[70%] p-3 rounded-lg shadow-sm text-sm prose
                                ${msg.sender === 'user'
                                    ? 'bg-green-500 text-white ml-auto rounded-br-none'
                                    : 'bg-gray-200 text-gray-800 mr-auto rounded-bl-none'
                                }`}
                        >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start mb-4">
                        <div className="max-w-[70%] p-3 rounded-lg shadow-sm bg-gray-200 text-gray-800 mr-auto rounded-bl-none">
                            Thinking...
                        </div>
                    </div>
                )}
                {error && (
                    <div className="text-red-600 text-center text-sm mt-2">{error}</div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSendMessage} className="flex mt-auto">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={handleInputChange}
                    placeholder="Ask about plants, uses, or remedies..."
                    className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-r-lg hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || inputMessage.trim() === ''}
                >
                    Send
                </button>
            </form>
        </div>
    );
}

export default AIChatAssistant;
