import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen px-4 py-8" style={{ backgroundColor: '#1a1f2e' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">🚀 Galilio</h1>
          <button
            onClick={handleLogout}
            className="rounded-lg px-6 py-2 font-medium transition-colors"
            style={{ 
              backgroundColor: '#f56565',
              color: '#ffffff'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#e53e3e'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#f56565'}
          >
            Logout
          </button>
        </div>

        {/* Welcome Card */}
        <div className="rounded-xl border p-6 mb-6" style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: '#e2e8f0' }}>
            Welcome, {user?.username}!
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#2d3748' }}>
              <p className="text-sm" style={{ color: '#a0aec0' }}>Balance</p>
              <p className="text-2xl font-mono font-semibold mt-1" style={{ color: '#48bb78' }}>
                ${user?.balance?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#2d3748' }}>
              <p className="text-sm" style={{ color: '#a0aec0' }}>Email</p>
              <p className="text-lg font-normal mt-1" style={{ color: '#e2e8f0' }}>
                {user?.email}
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#2d3748' }}>
              <p className="text-sm" style={{ color: '#a0aec0' }}>Account Type</p>
              <p className="text-lg font-normal mt-1" style={{ color: '#e2e8f0' }}>
                {user?.isAdmin ? 'Admin' : 'User'}
              </p>
            </div>
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="rounded-xl border p-6" style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}>
          <h3 className="text-xl font-semibold mb-4" style={{ color: '#e2e8f0' }}>
            Galilio Games
          </h3>
          <p style={{ color: '#a0aec0' }}>
            Games will be available here soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
