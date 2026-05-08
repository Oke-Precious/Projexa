'use strict';

(function attachProjexaApi(windowObject) {
  const API_BASE_URL = 'http://localhost:3000';
  
  async function request(path, options = {}) {
    const url = path.startsWith('http') ? path : API_BASE_URL + path;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    const rawText = await response.text();
    let payload = null;

    if (rawText) {
      try {
        payload = JSON.parse(rawText);
      } catch (error) {
        payload = rawText;
      }
    }

    if (!response.ok) {
      const errorMessage = payload && typeof payload === 'object' && payload.error
        ? payload.error
        : rawText || 'Request failed.';
      throw new Error(errorMessage);
    }

    return payload;
  }

  windowObject.ProjexaAPI = {
    request
  };
})(window);