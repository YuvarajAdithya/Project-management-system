import test from 'node:test';
import assert from 'node:assert/strict';
import { getApiErrorMessage } from '../src/lib/apiError.ts';

const fallback = 'Unable to sign in.';
const axiosFailure = (extra: Record<string, unknown> = {}) => ({ isAxiosError: true, ...extra });

test('offline hint is required before a network failure is labelled no internet', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  try {
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine: true } });
    assert.match(getApiErrorMessage(axiosFailure({ code: 'ERR_NETWORK' }), fallback), /Unable to reach the server/);
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine: false } });
    assert.equal(getApiErrorMessage(axiosFailure({ code: 'ERR_NETWORK' }), fallback), 'No internet connection. Check your network and try again.');
    assert.equal(getApiErrorMessage(axiosFailure({ response: { data: { message: 'Invalid credentials' } } }), fallback), 'Invalid credentials');
    assert.equal(getApiErrorMessage(axiosFailure({ response: { status: 500, data: '<html>Error</html>' } }), fallback), fallback);
  } finally {
    if (original) Object.defineProperty(globalThis, 'navigator', original);
    else Reflect.deleteProperty(globalThis, 'navigator');
  }
});

test('timeouts, browser-blocked requests and client setup errors stay distinct', () => {
  assert.match(getApiErrorMessage(axiosFailure({ code: 'ETIMEDOUT' }), fallback), /timed out/);
  assert.match(getApiErrorMessage(axiosFailure({ code: 'ECONNABORTED' }), fallback), /timed out/);
  assert.match(getApiErrorMessage(axiosFailure({ request: {} }), fallback), /Unable to reach the server/);
  assert.equal(getApiErrorMessage(axiosFailure({ code: 'ERR_BAD_OPTION' }), fallback), fallback);
  assert.equal(getApiErrorMessage(new Error('unexpected'), fallback), fallback);
});

test('HTTP errors preserve safe API messages and fall back for malformed responses', () => {
  for (const status of [400, 401, 403, 404, 429, 500]) {
    assert.equal(getApiErrorMessage(axiosFailure({ response: { status, data: { message: 'Please try again' } } }), fallback), 'Please try again');
  }
  for (const data of [null, '', {}, { message: ' ' }, { message: 42 }]) {
    assert.equal(getApiErrorMessage(axiosFailure({ response: { status: 500, data } }), fallback), fallback);
  }
});
