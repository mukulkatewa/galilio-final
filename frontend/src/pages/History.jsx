import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import toast from 'react-hot-toast';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/user/history');
      if (response.data.success) {
        setHistory(response.data.data.history);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  // Pagination
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentHistory = history.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-semibold mb-6" style={{ color: '#e2e8f0' }}>
          📜 Game History
        </h1>

        <div className="max-w-screen-xl mx-auto">
          <div 
            className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}
          >
            {loading ? (
              <div className="p-8 text-center" style={{ color: '#a0aec0' }}>
                Loading history...
              </div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center" style={{ color: '#a0aec0' }}>
                No game history yet. Start playing to see your history here.
              </div>
            ) : (
              <>
                {/* Table */}
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
                          Time
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold" style={{ color: '#a0aec0' }}>
                          Game
                        </th>
                        <th className="text-right py-4 px-6 text-sm font-semibold" style={{ color: '#a0aec0' }}>
                          Bet
                        </th>
                        <th className="text-right py-4 px-6 text-sm font-semibold" style={{ color: '#a0aec0' }}>
                          Payout
                        </th>
                        <th className="text-right py-4 px-6 text-sm font-semibold" style={{ color: '#a0aec0' }}>
                          Profit/Loss
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentHistory.map((game, index) => (
                        <tr 
                          key={game.id}
                          style={{ 
                            backgroundColor: index % 2 === 0 ? '#1e2433' : '#1a1f2e',
                            borderBottom: '1px solid #2d3748'
                          }}
                        >
                          <td className="py-4 px-6 text-sm font-normal" style={{ color: '#a0aec0' }}>
                            {formatDate(game.createdAt)}
                          </td>
                          <td className="py-4 px-6 text-sm font-normal" style={{ color: '#e2e8f0' }}>
                            {formatGameName(game.gameType)}
                          </td>
                          <td className="py-4 px-6 text-sm font-mono text-right" style={{ color: '#e2e8f0' }}>
                            ${parseFloat(game.betAmount).toFixed(2)}
                          </td>
                          <td className="py-4 px-6 text-sm font-mono text-right" style={{ color: '#e2e8f0' }}>
                            ${parseFloat(game.payout).toFixed(2)}
                          </td>
                          <td 
                            className="py-4 px-6 text-sm font-mono font-semibold text-right"
                            style={{ 
                              color: parseFloat(game.profit) >= 0 ? '#48bb78' : '#f56565'
                            }}
                          >
                            {parseFloat(game.profit) >= 0 ? '+' : ''}${parseFloat(game.profit).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div 
                    className="flex items-center justify-center gap-2 py-4 px-6"
                    style={{ borderTop: '1px solid #2d3748' }}
                  >
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="rounded-lg px-4 py-2 font-medium transition-colors"
                      style={{ 
                        backgroundColor: currentPage === 1 ? '#2d3748' : '#1a1f2e',
                        color: currentPage === 1 ? '#a0aec0' : '#e2e8f0',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                      }}
                      onMouseEnter={(e) => currentPage !== 1 && (e.target.style.backgroundColor = '#2d3748')}
                      onMouseLeave={(e) => currentPage !== 1 && (e.target.style.backgroundColor = '#1a1f2e')}
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first, last, current, and pages around current
                          if (page === 1 || page === totalPages) return true;
                          if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                          return false;
                        })
                        .map((page, index, array) => {
                          // Add ellipsis
                          const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                          
                          return (
                            <React.Fragment key={page}>
                              {showEllipsisBefore && (
                                <span className="px-2" style={{ color: '#a0aec0' }}>...</span>
                              )}
                              <button
                                onClick={() => goToPage(page)}
                                className="rounded-lg px-4 py-2 font-medium transition-colors"
                                style={{ 
                                  backgroundColor: currentPage === page ? '#4299e1' : '#1a1f2e',
                                  color: currentPage === page ? '#ffffff' : '#e2e8f0'
                                }}
                                onMouseEnter={(e) => currentPage !== page && (e.target.style.backgroundColor = '#2d3748')}
                                onMouseLeave={(e) => currentPage !== page && (e.target.style.backgroundColor = '#1a1f2e')}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}
                    </div>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="rounded-lg px-4 py-2 font-medium transition-colors"
                      style={{ 
                        backgroundColor: currentPage === totalPages ? '#2d3748' : '#1a1f2e',
                        color: currentPage === totalPages ? '#a0aec0' : '#e2e8f0',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                      }}
                      onMouseEnter={(e) => currentPage !== totalPages && (e.target.style.backgroundColor = '#2d3748')}
                      onMouseLeave={(e) => currentPage !== totalPages && (e.target.style.backgroundColor = '#1a1f2e')}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default History;
