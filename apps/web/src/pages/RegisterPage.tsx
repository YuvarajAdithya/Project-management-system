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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">TaskFlow</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Create a new account</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div role="alert" className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="label-text">Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input-field" placeholder="John Doe" />
            </div>
            <div>
              <label className="label-text">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" />
            </div>
            <div>
              <label className="label-text">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="••••••••" />
            </div>
            <div>
              <label className="label-text">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field" placeholder="••••••••" />
            </div>
          </div>
          <div>
            <button type="submit" className="w-full btn-primary flex justify-center" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-500">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
