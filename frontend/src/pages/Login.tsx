import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid username or password');
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
          <p className="text-white/60">Your Personal Fitness Journey</p>
        </div>

        {/* Login Card */}
        <div className="miami-card p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
            <p className="text-white/60 text-sm">Sign in to continue your fitness journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-white/80 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="miami-input"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="miami-input"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="miami-button w-full flex items-center justify-center"
            >
              Sign in
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1a1a2e] text-white/40">Or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/register')}
              className="w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300
                       border border-white/20 text-white hover:bg-white/5
                       hover:border-[#00f0ff] hover:shadow-lg hover:shadow-[#00f0ff]/10"
            >
              Create new account
            </button>
          </form>
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