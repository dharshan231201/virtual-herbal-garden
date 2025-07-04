import React, { useState } from 'react';
import axios from 'axios';

function IdentifyPlant() {
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false); // State to indicate loading
    const [error, setError] = useState(null);

    const API_BASE_URL = 'http://3.83.150.152:8005';
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedImage = e.target.files[0];
            setImage(selectedImage);
            setPreviewUrl(URL.createObjectURL(selectedImage));
            setPrediction(null); // Clear previous prediction
            setError(null); // Clear previous error
        }
    };

    const handleUpload = async () => {
        if (!image) {
            setError("Please select an image first.");
            return;
        }

        setLoading(true); // Start loading
        setError(null);
        setPrediction(null);

        const formData = new FormData();
        formData.append('image', image); // Corrected to 'image'

        try {
            const response = await axios.post(`${API_BASE_URL}/identify-plant/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setPrediction(response.data);
            console.log("Prediction:", response.data);
        } catch (err) {
            console.error("Error uploading image for identification:", err.response ? err.response.data : err.message);

            let errorMessage = 'Unknown error occurred.';

            if (axios.isAxiosError(err) && err.response) {
                if (typeof err.response.data === 'object' && err.response.data.detail) {
                    errorMessage = err.response.data.detail;
                } else if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                } else {
                    try {
                        errorMessage = JSON.stringify(err.response.data);
                    } catch (e) {
                        errorMessage = String(err.response.data);
                    }
                }
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(`Failed to identify plant: ${errorMessage}`);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <div className="flex flex-col items-center p-6 my-8 bg-white rounded-lg shadow-lg border border-gray-200 w-full">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">Identify Plant from Image</h2>

            <div className="mb-6 w-full max-w-md">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-green-50 file:text-green-700
                                hover:file:bg-green-100"
                />
            </div>

            {previewUrl && (
                <div className="mb-6">
                    <img src={previewUrl} alt="Image Preview" className="max-w-xs max-h-64 object-contain rounded-lg shadow-md border border-gray-300" />
                </div>
            )}

            {/* Changed disabled logic: button is always visible, but only clickable if an image is selected and not loading */}
            <button
                onClick={handleUpload}
                disabled={!image || loading} // Button is disabled if no image is selected OR if currently loading
                className="px-8 py-3 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
                {loading ? 'Identifying...' : 'Identify Plant'} {/* Dynamic button text */}
            </button>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-6 w-full max-w-md text-center" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            {prediction && (
                <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg shadow-inner w-full max-w-md">
                    <h3 className="text-xl font-bold text-green-800 mb-4">Identification Results:</h3>
                    <p className="text-gray-700 text-lg">
                        <strong>Plant Name:</strong> {prediction.plant_name || 'N/A'}
                    </p>
                    <p className="text-gray-700 text-lg">
                        <strong>Description:</strong> {prediction.description || 'N/A'}
                    </p>
                    <p className="text-gray-700 text-lg">
                        <strong>Usage:</strong> {prediction.usage || 'No usage information available.'}
                    </p>
                    {prediction.confidence !== null && prediction.confidence !== undefined && (
                        <p className="text-gray-700 text-lg">
                            <strong>Confidence:</strong> {(prediction.confidence * 100).toFixed(2)}%
                        </p>
                    )}
                </div>
            )}

            {/* Display "Upload an image" message only if no prediction, not loading, and no error */}
            {!prediction && !loading && !error && (
                <p className="text-gray-500 mt-6">Upload an image to identify a plant!</p>
            )}
        </div>
    );
}

export default IdentifyPlant;
