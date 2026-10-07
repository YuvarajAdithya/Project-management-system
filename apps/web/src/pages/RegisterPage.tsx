import AuthLayout from '../components/AuthLayout';
import ErrorMessage from '../components/ErrorMessage';
import Icon from '../components/Icon';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getApiErrorMessage } from '../lib/apiError';

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await register(fullName, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to register'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Start with a clear mind." description="Create your account and make space for what comes next." footer={<>Already have an account? <Link to="/login" className="font-semibold text-ink hover:text-info-ink">Sign in <span aria-hidden="true">↗</span></Link></>}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <ErrorMessage message={error} />
        <div><label htmlFor="register-name" className="label-text">Full name</label><input id="register-name" type="text" autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} className="input-field auth-field" placeholder="Your full name" /></div>
        <div><label htmlFor="register-email" className="label-text">Email address</label><input id="register-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field auth-field" placeholder="you@example.com" /></div>
        <div><label htmlFor="register-password" className="label-text">Password</label><input id="register-password" type="password" autoComplete="new-password" aria-describedby="password-hint" value={password} onChange={e => setPassword(e.target.value)} className="input-field auth-field" placeholder="Create a password" /><p id="password-hint" className="mt-2 text-xs text-secondary">Use at least 8 characters.</p></div>
        <div><label htmlFor="register-confirm" className="label-text">Confirm password</label><input id="register-confirm" type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field auth-field" placeholder="Repeat your password" /></div>
        <button type="submit" className="btn-primary min-h-12 w-full justify-between px-5" disabled={isLoading}>{isLoading ? 'Creating account...' : 'Create account'}<Icon name="arrow" className="h-4 w-4" /></button>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;