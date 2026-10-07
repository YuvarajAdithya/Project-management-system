import axios from 'axios';

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    // A response is stronger evidence than the browser's connectivity hint.
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim()) return message;
    if (error.response) return fallback;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return 'No internet connection. Check your network and try again.';
    }
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return 'The request timed out. Please try again.';
    }
    if (error.code === 'ERR_NETWORK' || error.request) {
      // Browsers do not expose whether this was CORS, a server outage or a
      // connection failure. Do not claim the device is offline without evidence.
      return 'Unable to reach the server. Please try again. If this continues, check the server connection and configuration.';
    }
  }
  return fallback;
};
