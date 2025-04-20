import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(username, password);
      // Use navigate for both cases
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#2a2a4e] px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 miami-gradient bg-clip-text text-transparent">
            FitFlow
          </h1>
          <p className="text-[#00f0ff]/80">Your Personal Fitness Journey</p>
        </div>

        {/* Login Card */}
        <div className="miami-card p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
            <p className="text-white/60 text-sm">Sign in to continue your fitness journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 rounded-lg bg-[#2a2a4e]/50 border border-[#00f0ff]/20 text-white placeholder-white/50 focus:outline-none focus:border-[#00f0ff]/50 transition-colors"
                required
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-lg bg-[#2a2a4e]/50 border border-[#00f0ff]/20 text-white placeholder-white/50 focus:outline-none focus:border-[#00f0ff]/50 transition-colors"
                required
              />
            </div>
            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-white/60">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#00f0ff] hover:text-[#00f0ff]/80 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#00f0ff] rounded-full filter blur-[128px] opacity-20"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#ff69b4] rounded-full filter blur-[128px] opacity-20"></div>
        </div>
      </div>
    </div>
  );
};

export default Login; 