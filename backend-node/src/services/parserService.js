// Parser Service
// Handles communication with Python PDF parser service

const axios = require('axios');

const parserClient = axios.create({
  baseURL: process.env.PYTHON_SERVICE_URL,
  timeout: 30000,
});

exports.parsePDF = async (filePath) => {
  try {
    // TODO: Send PDF to Python service for parsing
    // This should use multipart/form-data for file upload
    const response = await parserClient.post('/parse', {
      file_path: filePath,
    });
    return response.data;
  } catch (error) {
    console.error('Parser service error:', error);
    throw error;
  }
};

exports.extractText = async (fileBuffer) => {
  try {
    // TODO: Send file buffer to Python service
    // Returns extracted text from PDF
    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer]));
    
    const response = await parserClient.post('/extract-text', formData);
    return response.data;
  } catch (error) {
    console.error('Error extracting text:', error);
    throw error;
  }
};
