import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const Admin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  if (!user?.isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsResponse, usersResponse] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      if (usersResponse.data.success) {
        setUsers(usersResponse.data.data.users);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const formatGameName = (gameType) => {
    const gameNames = {
      'dice': '🎲 Dice',
      'keno': '🎱 Keno',
      'limbo': '🎯 Limbo',
      'crash': '🚀 Crash',
      'dragonTower': '🐉 Dragon Tower',
      'dragon-tower': '🐉 Dragon Tower'
    };
    return gameNames[gameType] || gameType;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-semibold mb-6" style={{ color: '#e2e8f0' }}>
          ⚙️ Admin Dashboard
        </h1>

        {loading ? (
          <div className="text-center py-12" style={{ color: '#a0aec0' }}>
            Loading admin data...
          </div>
        ) : (
          <>
            {/* Stat Cards - Top Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total House Profit */}
              <div 
                className="rounded-xl border p-6"
                style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}
              >
                <h3 className="text-sm font-normal mb-2" style={{ color: '#a0aec0' }}>
                  Total House Profit
                </h3>
                <div className="text-3xl font-mono font-semibold" style={{ color: '#48bb78' }}>
                  ${stats?.overall?.houseProfit?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs mt-2" style={{ color: '#a0aec0' }}>
                  Edge: {stats?.overall?.actualEdge || '0.00%'}
                </p>
              </div>

              {/* Total Wagered */}
              <div 
                className="rounded-xl border p-6"
                style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}
              >
                <h3 className="text-sm font-normal mb-2" style={{ color: '#a0aec0' }}>
                  Total Wagered
                </h3>
                <div className="text-3xl font-mono font-semibold" style={{ color: '#4299e1' }}>
                  ${stats?.overall?.totalWagered?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs mt-2" style={{ color: '#a0aec0' }}>
                  Total Payout: ${stats?.overall?.totalPayout?.toFixed(2) || '0.00'}
                </p>
              </div>

              {/* Total Games */}
              <div 
                className="rounded-xl border p-6"
                style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}
              >
                <h3 className="text-sm font-normal mb-2" style={{ color: '#a0aec0' }}>
                  Total Games
                </h3>
                <div className="text-3xl font-mono font-semibold" style={{ color: '#f6ad55' }}>
                  {stats?.overall?.totalGames || 0}
                </div>
                <p className="text-xs mt-2" style={{ color: '#a0aec0' }}>
                  Across all games
                </p>
              </div>
            </div>

            {/* Game Stats Table */}
            <div 
              className="rounded-xl border overflow-hidden mb-8"
              style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}
            >
              <div className="p-6 border-b" style={{ borderColor: '#2d3748' }}>
                <h2 className="text-xl font-semibold" style={{ color: '#e2e8f0' }}>
                  Game Statistics
                </h2>
              </div>

              {stats?.byGame && stats.byGame.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr 
                        style={{ 
                          backgroundColor: '#1a1f2e',
                          borderBottom: '1px solid #2d3748'
                        }}
                      >
                        <th className="text-left py-4 px-6 text-sm font-semibold" style={{ color: '#a0aec0' }}>
                          Game
                        </th>
                        <th className="text-right py-4 px-6 text-sm font-semibold" style={{ color: '#a0aec0' }}>
                          Games
                        </th>
                        <th className="text-right py-4 px-6 text-sm font-semibold" style={{ color: '#a0aec0' }}>
                          Wagered
                        </th>
                        <th className="text-right py-4 px-6 text-sm font-semibold" style={{ color: '#a0aec0' }}>
                          Payout
                        </th>
                        <th className="text-right py-4 px-6 text-sm font-semibold" style={{ color: '#a0aec0' }}>
                          Profit
                        </th>
                        <th className="text-right py-4 px-6 text-sm font-semibold" style={{ color: '#a0aec0' }}>
                          Edge%
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.byGame.map((game, index) => (
                        <tr 
                          key={game.gameType}
                          style={{ 
                            backgroundColor: index % 2 === 0 ? '#1e2433' : '#1a1f2e',
                            borderBottom: '1px solid #2d3748'
                          }}
                        >
                          <td className="py-4 px-6 text-sm font-normal" style={{ color: '#e2e8f0' }}>
                            {formatGameName(game.gameType)}
                          </td>
                          <td className="py-4 px-6 text-sm font-mono text-right" style={{ color: '#e2e8f0' }}>
                            {game.totalGames}
                          </td>
                          <td className="py-4 px-6 text-sm font-mono text-right" style={{ color: '#e2e8f0' }}>
                            ${game.totalWagered.toFixed(2)}
                          </td>
                          <td className="py-4 px-6 text-sm font-mono text-right" style={{ color: '#e2e8f0' }}>
                            ${game.totalPayout.toFixed(2)}
                          </td>
                          <td 
                            className="py-4 px-6 text-sm font-mono font-semibold text-right"
                            style={{ color: game.houseProfit >= 0 ? '#48bb78' : '#f56565' }}
                          >
                            ${game.houseProfit.toFixed(2)}
                          </td>
                          <td className="py-4 px-6 text-sm font-mono text-right" style={{ color: '#f6ad55' }}>
                            {game.actualEdge}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center" style={{ color: '#a0aec0' }}>
                  No game statistics available yet
                </div>
              )}
            </div>

            {/* Users Table */}
            <div 
              className="rounded-xl border overflow-hidden"
              style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}
            >
              <div className="p-6 border-b" style={{ borderColor: '#2d3748' }}>
                <h2 className="text-xl font-semibold" style={{ color: '#e2e8f0' }}>
                  Users ({users.length})
                </h2>
              </div>

              {users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr 
                        style={{ 
                          backgroundColor: '#1a1f2e',
                          borderBottom: '1px solid #2d3748'
                        }}
                      >
                        <th className="text-left py-4 px-6 text-sm font-semibold" style={{ color: '#a0aec0' }}>
                          Username
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold" style={{ color: '#a0aec0' }}>
                          Email
                        </th>
                        <th className="text-right py-4 px-6 text-sm font-semibold" style={{ color: '#a0aec0' }}>
                          Balance
                        </th>
                        <th className="text-center py-4 px-6 text-sm font-semibold" style={{ color: '#a0aec0' }}>
                          Role
                        </th>
                        <th className="text-right py-4 px-6 text-sm font-semibold" style={{ color: '#a0aec0' }}>
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr 
                          key={user.id}
                          style={{ 
                            backgroundColor: index % 2 === 0 ? '#1e2433' : '#1a1f2e',
                            borderBottom: '1px solid #2d3748'
                          }}
                        >
                          <td className="py-4 px-6 text-sm font-normal" style={{ color: '#e2e8f0' }}>
                            {user.username}
                          </td>
                          <td className="py-4 px-6 text-sm font-normal" style={{ color: '#a0aec0' }}>
                            {user.email}
                          </td>
                          <td className="py-4 px-6 text-sm font-mono text-right" style={{ color: '#e2e8f0' }}>
                            ${user.balance.toFixed(2)}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span 
                              className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                              style={{ 
                                backgroundColor: user.isAdmin ? '#4299e1' : '#2d3748',
                                color: '#ffffff'
                              }}
                            >
                              {user.isAdmin ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm font-normal text-right" style={{ color: '#a0aec0' }}>
                            {formatDate(user.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center" style={{ color: '#a0aec0' }}>
                  No users found
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Admin;
