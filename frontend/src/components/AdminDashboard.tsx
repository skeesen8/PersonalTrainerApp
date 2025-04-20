import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#2a2a4e]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="miami-card p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome, Admin {user?.full_name}
            </h1>
            <p className="text-[#00f0ff]/80">
              Manage your fitness platform from here
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Management Card */}
            <div className="miami-card p-6 hover-scale">
              <h3 className="text-xl font-semibold text-white mb-2">User Management</h3>
              <p className="text-white/60 mb-4">
                View and manage user accounts
              </p>
              <div className="text-[#00f0ff]">
                {/* Add user count or other metrics here */}
                Total Users: --
              </div>
            </div>

            {/* Workout Plans Card */}
            <div className="miami-card p-6 hover-scale">
              <h3 className="text-xl font-semibold text-white mb-2">Workout Plans</h3>
              <p className="text-white/60 mb-4">
                Create and manage workout plans
              </p>
              <div className="text-[#00f0ff]">
                Active Plans: --
              </div>
            </div>

            {/* Meal Plans Card */}
            <div className="miami-card p-6 hover-scale">
              <h3 className="text-xl font-semibold text-white mb-2">Meal Plans</h3>
              <p className="text-white/60 mb-4">
                Create and manage meal plans
              </p>
              <div className="text-[#00f0ff]">
                Active Plans: --
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="miami-card p-4 text-center hover-scale">
                <span className="text-[#00f0ff] block mb-2">➕</span>
                <span className="text-white">Add User</span>
              </button>
              <button className="miami-card p-4 text-center hover-scale">
                <span className="text-[#00f0ff] block mb-2">📊</span>
                <span className="text-white">View Reports</span>
              </button>
              <button className="miami-card p-4 text-center hover-scale">
                <span className="text-[#00f0ff] block mb-2">🏋️‍♂️</span>
                <span className="text-white">New Workout</span>
              </button>
              <button className="miami-card p-4 text-center hover-scale">
                <span className="text-[#00f0ff] block mb-2">🥗</span>
                <span className="text-white">New Meal Plan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#00f0ff] rounded-full filter blur-[128px] opacity-10"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#ff69b4] rounded-full filter blur-[128px] opacity-10"></div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 