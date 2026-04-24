'use strict';

(function attachProjexaApi(windowObject) {
  async function request(path, options = {}) {
    const response = await fetch(path, {
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