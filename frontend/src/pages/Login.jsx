import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#1a1f2e' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold mb-2">🚀 Galilio</h1>
        </div>

        {/* Card */}
        <div className="rounded-xl border p-6" style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username/Email Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-normal mb-2" style={{ color: '#e2e8f0' }}>
                Username or Email
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none transition-colors"
                style={{ 
                  backgroundColor: '#1e2433', 
                  borderColor: '#2d3748',
                  color: '#e2e8f0'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4299e1'}
                onBlur={(e) => e.target.style.borderColor = '#2d3748'}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-normal mb-2" style={{ color: '#e2e8f0' }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border px-4 py-2 pr-10 focus:outline-none transition-colors"
                  style={{ 
                    backgroundColor: '#1e2433', 
                    borderColor: '#2d3748',
                    color: '#e2e8f0'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4299e1'}
                  onBlur={(e) => e.target.style.borderColor = '#2d3748'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: '#a0aec0' }}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg px-6 py-3 font-medium transition-colors"
              style={{ 
                backgroundColor: '#4299e1',
                color: '#ffffff'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#3182ce'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4299e1'}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            {/* Register Link */}
            <div className="text-center text-sm" style={{ color: '#a0aec0' }}>
              Don't have an account?{' '}
              <Link to="/register" className="hover:underline" style={{ color: '#4299e1' }}>
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
