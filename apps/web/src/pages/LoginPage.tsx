import AuthLayout from '../components/AuthLayout';
import ErrorMessage from '../components/ErrorMessage';
import Icon from '../components/Icon';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getApiErrorMessage } from '../lib/apiError';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to login'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back." description="Pick up where you left off. Your workspace is ready." footer={<>New to Tasko? <Link to="/register" className="font-semibold text-ink hover:text-info-ink">Create an account <span aria-hidden="true">↗</span></Link></>}>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <ErrorMessage message={error || authError} />
        <div><label htmlFor="login-email" className="label-text">Email address</label><input id="login-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field auth-field" placeholder="you@example.com" /></div>
        <div><label htmlFor="login-password" className="label-text">Password</label><input id="login-password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="input-field auth-field" placeholder="Enter your password" /></div>
        <button type="submit" className="btn-primary min-h-12 w-full justify-between px-5" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign in'}<Icon name="arrow" className="h-4 w-4" /></button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;