import axios from 'axios';

export const NO_NETWORK_MESSAGE = 'No internet connection. Check your network and try again.';
export const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please log in again.';

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return NO_NETWORK_MESSAGE;
    const message = error.response.data?.message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}
