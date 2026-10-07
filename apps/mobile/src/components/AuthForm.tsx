import React, { useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { getApiErrorMessage } from '../lib/apiError';
import { Action, Field, FormScreen, Notice } from './TaskoForm';

export function AuthForm({ registering = false }: { registering?: boolean }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register, sessionMessage } = useAuth();

  const submit = async () => {
    if (loading) return;
    if (!email.trim() || !password || (registering && (!fullName.trim() || !confirmPassword))) {
      return setError('Please fill in all fields.');
    }
    if (registering && password !== confirmPassword) return setError('Passwords do not match.');
    if (registering && password.length < 8) return setError('Password must be at least 8 characters.');
    setError(null);
    setLoading(true);
    try {
      const body = { email: email.trim().toLowerCase(), password, ...(registering ? { fullName: fullName.trim() } : {}) };
      const response = await api.post(registering ? '/auth/register' : '/auth/login', body);
      await (registering ? register : login)(response.data.token, response.data.user);
    } catch (error) {
      setError(getApiErrorMessage(error, registering ? 'Failed to register.' : 'Failed to login.'));
    } finally { setLoading(false); }
  };

  return <FormScreen auth title={registering ? 'Make room for progress.' : 'Welcome back.'} subtitle={registering ? 'Create your Tasko account. Bring your projects and priorities together.' : 'Your projects, priorities and next steps, all in one place.'}>
    {!registering && <Notice message={sessionMessage} />}
    {registering && <Field label="Full name" value={fullName} onChangeText={setFullName} placeholder="Your full name" autoComplete="name" textContentType="name" autoCapitalize="words" editable={!loading} />}
    <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" editable={!loading} />
    <Field label="Password" value={password} onChangeText={setPassword} placeholder={registering ? 'At least 8 characters' : 'Enter your password'} secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete={registering ? 'new-password' : 'current-password'} textContentType={registering ? 'newPassword' : 'password'} editable={!loading} returnKeyType={registering ? 'next' : 'go'} onSubmitEditing={registering ? undefined : submit} />
    {registering && <Field label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Enter your password again" secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="new-password" textContentType="newPassword" editable={!loading} returnKeyType="go" onSubmitEditing={submit} />}
    <Notice message={error} />
    <Action label={registering ? 'Create account' : 'Log in'} busy={loading} onPress={submit} />
    <Action label={registering ? 'Already have an account? Log in' : 'New to Tasko? Create an account'} secondary disabled={loading} onPress={() => registering ? router.replace('/(auth)/login') : router.push('/(auth)/register')} />
  </FormScreen>;
}
