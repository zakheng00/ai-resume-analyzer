import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, endpoint, data = null) => {
    setLoading(true);
    setError(null);
    try {
      const config = {
        method,
        url: `${API_BASE_URL}${endpoint}`,
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  const get = useCallback((endpoint) => request('GET', endpoint), [request]);
  const post = useCallback((endpoint, data) => request('POST', endpoint, data), [request]);
  const put = useCallback((endpoint, data) => request('PUT', endpoint, data), [request]);
  const del = useCallback((endpoint) => request('DELETE', endpoint), [request]);

  return { get, post, put, del, loading, error };
};
