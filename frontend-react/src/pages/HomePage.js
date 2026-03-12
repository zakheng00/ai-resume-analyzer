import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:3000/api/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message and redirect to dashboard
        alert('Resume uploaded successfully!');
        setFile(null);
        // Navigate to dashboard with the resume ID
        navigate(`/dashboard?resumeId=${data.id}`);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Error uploading file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-600">AI Resume Analyzer</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Get AI-Powered Resume Insights
          </h2>
          <p className="text-xl text-gray-600">
            Upload your resume and let our AI analyze it for improvements
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <form onSubmit={handleUpload}>
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-gray-600 mb-2">
                  {file ? file.name : 'Click to upload or drag and drop PDF'}
                </p>
                <p className="text-sm text-gray-400">PDF files only</p>
              </label>
            </div>

            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
            >
              {uploading ? 'Uploading...' : 'Analyze Resume'}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="font-bold text-lg mb-2">AI Analysis</h3>
            <p className="text-gray-600">Get detailed insights powered by AI</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="font-bold text-lg mb-2">Score & Metrics</h3>
            <p className="text-gray-600">View your resume score and recommendations</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="font-bold text-lg mb-2">Improvements</h3>
            <p className="text-gray-600">Get actionable tips to improve your resume</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
