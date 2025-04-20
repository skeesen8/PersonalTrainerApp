import React, { useState } from 'react';
import api from '../api/axios';
import Button from './Button';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    is_admin: false,
    assigned_admin_id: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/users/', formData);
      onUserAdded();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create user');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="miami-card p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Add New User</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="miami-input"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="miami-input"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="miami-input"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAdmin"
              checked={formData.is_admin}
              onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
              className="miami-checkbox"
            />
            <label htmlFor="isAdmin" className="text-white/80 text-sm font-medium">
              Make this user an admin
            </label>
          </div>

          {!formData.is_admin && (
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Assign to Admin (Email)
              </label>
              <input
                type="text"
                value={formData.assigned_admin_id}
                onChange={(e) => setFormData({ ...formData, assigned_admin_id: e.target.value })}
                className="miami-input"
                placeholder="Admin's email"
              />
            </div>
          )}

          <div className="flex space-x-3 mt-6">
            <Button
              type="submit"
              variant="primary"
              fullWidth
            >
              Create User
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal; 