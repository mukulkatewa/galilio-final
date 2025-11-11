import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Limbo = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [targetMultiplier, setTargetMultiplier] = useState(2);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [recentGames, setRecentGames] = useState([]);
  const [winChance, setWinChance] = useState(50);

  // Calculate win chance based on target multiplier
  useEffect(() => {
    const multiplier = parseFloat(targetMultiplier) || 2;
    const chance = (0.99 / multiplier) * 100;
    setWinChance(chance);
  }, [targetMultiplier]);

  const handlePlay = async () => {
    if (betAmount <= 0) {
      toast.error('Bet amount must be greater than 0');
      return;
    }

    if (targetMultiplier < 1.01) {
      toast.error('Target multiplier must be at least 1.01');
      return;
    }

    if (targetMultiplier > 1000000) {
      toast.error('Target multiplier cannot exceed 1,000,000');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/games/limbo', {
        betAmount: parseFloat(betAmount),
        targetMultiplier: parseFloat(targetMultiplier)
      });

      if (response.data.success) {
        const gameResult = response.data.result;
        setResult(gameResult);
        
        // Add to recent games
        setRecentGames(prev => [gameResult, ...prev.slice(0, 9)]);

        if (gameResult.won) {
          toast.success(`Won ${gameResult.payout.toFixed(2)}!`);
        } else {
          toast.error(`Lost ${betAmount}`);
        }
      } else {
        toast.error(response.data.error || 'Game failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to play');
    } finally {
      setLoading(false);
    }
  };

  // Convert multiplier to log scale position for visualization (1.01 to 100)
  const getPosition = (multiplier) => {
    const num = parseFloat(multiplier) || 2;
    const minLog = Math.log(1.01);
    const maxLog = Math.log(100);
    const valueLog = Math.log(Math.max(1.01, Math.min(100, num)));
    return ((valueLog - minLog) / (maxLog - minLog)) * 100;
  };

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-semibold mb-6" style={{ color: '#e2e8f0' }}>
          🎯 Limbo
        </h1>

        {/* Centered Card */}
        <div className="max-w-2xl mx-auto">
          <div 
            className="rounded-xl border p-8"
            style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}
          >
            {/* Huge Outcome Display */}
            <div className="text-center mb-8">
              <div className="text-sm font-normal mb-2" style={{ color: '#a0aec0' }}>
                Outcome
              </div>
              <div 
                className="font-mono font-semibold transition-opacity"
                style={{ 
                  fontSize: '72px',
                  color: '#e2e8f0',
                  opacity: result ? 1 : 0.3
                }}
              >
                {result ? `${result.outcomeMultiplier.toFixed(2)}×` : '0.00×'}
              </div>
              {result && (
                <div 
                  className="text-xl font-semibold mt-2"
                  style={{ color: result.won ? '#48bb78' : '#f56565' }}
                >
                  {result.won ? `Won $${result.payout.toFixed(2)}` : `Lost $${result.betAmount.toFixed(2)}`}
                </div>
              )}
            </div>

            {/* Horizontal Comparison Bar */}
            <div className="mb-8">
              <div className="text-sm font-normal mb-4" style={{ color: '#a0aec0' }}>
                Multiplier Range (1.01× - 100×)
              </div>
              
              <div className="relative h-16 mb-2">
                {/* Background bar */}
                <div 
                  className="absolute inset-0 rounded-lg"
                  style={{ backgroundColor: '#2d3748' }}
                />

                {/* Target marker (blue) */}
                <div 
                  className="absolute top-0 bottom-0 w-1 z-10"
                  style={{ 
                    left: `${getPosition(targetMultiplier)}%`,
                    backgroundColor: '#4299e1',
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div 
                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-mono px-2 py-1 rounded whitespace-nowrap"
                    style={{ 
                      backgroundColor: '#4299e1',
                      color: '#ffffff'
                    }}
                  >
                    Target: {(parseFloat(targetMultiplier) || 0).toFixed(2)}×
                  </div>
                </div>

                {/* Outcome marker (green/red) */}
                {result && (
                  <div 
                    className="absolute top-0 bottom-0 w-2 z-20"
                    style={{ 
                      left: `${getPosition(result.outcomeMultiplier)}%`,
                      backgroundColor: result.won ? '#48bb78' : '#f56565',
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div 
                      className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-sm font-mono font-semibold px-2 py-1 rounded whitespace-nowrap"
                      style={{ 
                        backgroundColor: result.won ? '#48bb78' : '#f56565',
                        color: '#ffffff'
                      }}
                    >
                      {result.outcomeMultiplier.toFixed(2)}×
                    </div>
                  </div>
                )}
              </div>

              {/* Scale labels */}
              <div className="flex justify-between text-xs font-mono mt-8" style={{ color: '#a0aec0' }}>
                <span>1.01×</span>
                <span>10×</span>
                <span>100×</span>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4 mb-8">
              {/* Bet Amount */}
              <div>
                <label className="block text-sm font-normal mb-2" style={{ color: '#a0aec0' }}>
                  Bet Amount
                </label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full rounded-lg border px-4 py-2 focus:outline-none"
                  style={{ 
                    backgroundColor: '#2d3748', 
                    borderColor: '#2d3748',
                    color: '#e2e8f0'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4299e1'}
                  onBlur={(e) => e.target.style.borderColor = '#2d3748'}
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Target Multiplier */}
              <div>
                <label className="block text-sm font-normal mb-2" style={{ color: '#a0aec0' }}>
                  Target Multiplier (1.01 - 1,000,000)
                </label>
                <input
                  type="number"
                  value={targetMultiplier}
                  onChange={(e) => setTargetMultiplier(e.target.value || '')}
                  className="w-full rounded-lg border px-4 py-2 focus:outline-none"
                  style={{ 
                    backgroundColor: '#2d3748', 
                    borderColor: '#2d3748',
                    color: '#e2e8f0'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4299e1'}
                  onBlur={(e) => e.target.style.borderColor = '#2d3748'}
                  min="1.01"
                  max="1000000"
                  step="0.01"
                />
              </div>

              {/* Win Chance & Multiplier Display */}
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="rounded-lg p-3"
                  style={{ backgroundColor: '#2d3748' }}
                >
                  <div className="text-xs font-normal" style={{ color: '#a0aec0' }}>
                    Win Chance
                  </div>
                  <div className="text-lg font-mono font-semibold" style={{ color: '#48bb78' }}>
                    {winChance.toFixed(2)}%
                  </div>
                </div>
                <div 
                  className="rounded-lg p-3"
                  style={{ backgroundColor: '#2d3748' }}
                >
                  <div className="text-xs font-normal" style={{ color: '#a0aec0' }}>
                    Multiplier
                  </div>
                  <div className="text-lg font-mono font-semibold" style={{ color: '#f6ad55' }}>
                    {targetMultiplier || '0'}×
                  </div>
                </div>
              </div>

              {/* Play Button */}
              <button
                onClick={handlePlay}
                disabled={loading}
                className="w-full rounded-lg px-6 py-3 font-medium transition-colors"
                style={{ 
                  backgroundColor: loading ? '#2d3748' : '#4299e1',
                  color: '#ffffff',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#3182ce')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#4299e1')}
              >
                {loading ? 'Playing...' : '🎯 PLAY'}
              </button>
            </div>

            {/* Recent Games Table */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#e2e8f0' }}>
                Recent Games
              </h3>
              
              {recentGames.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: '#a0aec0' }}>
                  No games yet
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #2d3748' }}>
                        <th className="text-left py-2 text-sm font-semibold" style={{ color: '#a0aec0' }}>
                          Target
                        </th>
                        <th className="text-left py-2 text-sm font-semibold" style={{ color: '#a0aec0' }}>
                          Outcome
                        </th>
                        <th className="text-right py-2 text-sm font-semibold" style={{ color: '#a0aec0' }}>
                          Result
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentGames.map((game, index) => (
                        <tr 
                          key={index}
                          style={{ borderBottom: '1px solid #2d3748' }}
                        >
                          <td className="py-3 text-sm font-mono" style={{ color: '#e2e8f0' }}>
                            {game.targetMultiplier.toFixed(2)}×
                          </td>
                          <td className="py-3 text-sm font-mono" style={{ color: '#e2e8f0' }}>
                            {game.outcomeMultiplier.toFixed(2)}×
                          </td>
                          <td 
                            className="py-3 text-sm font-semibold text-right"
                            style={{ color: game.won ? '#48bb78' : '#f56565' }}
                          >
                            {game.won ? `+$${game.profit.toFixed(2)}` : `-$${game.betAmount.toFixed(2)}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Limbo;
