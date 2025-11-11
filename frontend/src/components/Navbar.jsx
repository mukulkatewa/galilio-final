import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    try {
      const response = await api.get('/user/balance');
      if (response.data.success) {
        setBalance(response.data.data.balance);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchBalance, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav 
      className="fixed top-0 left-0 right-0 h-16 border-b flex items-center justify-between px-6 z-50"
      style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}
    >
      {/* Logo */}
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold" style={{ color: '#e2e8f0' }}>
          🚀 Galilio
        </h1>
      </div>

      {/* Balance */}
      <div className="flex items-center">
        {loading ? (
          <div 
            className="h-8 w-32 rounded animate-pulse"
            style={{ backgroundColor: '#2d3748' }}
          />
        ) : (
          <div className="text-2xl font-mono font-semibold" style={{ color: '#e2e8f0' }}>
            ${balance.toFixed(2)}
          </div>
        )}
      </div>

      {/* User & Logout */}
      <div className="flex items-center gap-4">
        <span className="font-normal" style={{ color: '#a0aec0' }}>
          {user?.username}
        </span>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg transition-colors"
          style={{ color: '#a0aec0' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2d3748'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          title="Logout"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
