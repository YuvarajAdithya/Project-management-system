import axios from 'axios';

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'No internet connection. Check your network and try again.';
    }
    const message = error.response.data?.message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
};
