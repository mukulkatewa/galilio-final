import React, { useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Keno = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [pickedNumbers, setPickedNumbers] = useState([]);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [recentGames, setRecentGames] = useState([]);

  const payoutTable = [
    { matches: 4, multiplier: 1 },
    { matches: 5, multiplier: 2 },
    { matches: 6, multiplier: 10 },
    { matches: 7, multiplier: 50 },
    { matches: 8, multiplier: 200 },
    { matches: 9, multiplier: 1000 },
    { matches: 10, multiplier: 5000 },
  ];

  const toggleNumber = (num) => {
    if (loading) return;
    
    if (pickedNumbers.includes(num)) {
      setPickedNumbers(pickedNumbers.filter(n => n !== num));
    } else {
      if (pickedNumbers.length < 10) {
        setPickedNumbers([...pickedNumbers, num]);
      } else {
        toast.error('Maximum 10 numbers allowed');
      }
    }
  };

  const quickPick = () => {
    if (loading) return;
    const numbers = [];
    while (numbers.length < 10) {
      const num = Math.floor(Math.random() * 80) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    setPickedNumbers(numbers);
  };

  const clearSelection = () => {
    if (loading) return;
    setPickedNumbers([]);
    setDrawnNumbers([]);
    setGameResult(null);
  };

  const handlePlay = async () => {
    if (betAmount <= 0) {
      toast.error('Bet amount must be greater than 0');
      return;
    }

    if (pickedNumbers.length !== 10) {
      toast.error('Please pick exactly 10 numbers');
      return;
    }

    setLoading(true);
    setDrawnNumbers([]);
    setGameResult(null);

    try {
      const response = await api.post('/games/keno', {
        betAmount: parseFloat(betAmount),
        pickedNumbers: pickedNumbers
      });

      if (response.data.success) {
        const result = response.data.result;
        
        // Animate drawn numbers
        const drawn = result.drawnNumbers;
        for (let i = 0; i < drawn.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setDrawnNumbers(prev => [...prev, drawn[i]]);
        }

        // Show result after animation
        setTimeout(() => {
          setGameResult(result);
          setRecentGames(prev => [result, ...prev.slice(0, 9)]);
          
          if (result.matches >= 4) {
            toast.success(`${result.matches} matches! Won $${result.payout.toFixed(2)}`);
          } else {
            toast.error(`${result.matches} matches - No win`);
          }
          
          setLoading(false);
        }, 500);
      } else {
        toast.error(response.data.error || 'Game failed');
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to play');
      setLoading(false);
    }
  };

  const getNumberState = (num) => {
    if (drawnNumbers.length === 0) {
      return pickedNumbers.includes(num) ? 'selected' : 'default';
    }
    
    if (!pickedNumbers.includes(num)) {
      return 'default';
    }
    
    if (drawnNumbers.includes(num)) {
      return 'hit';
    }
    
    if (gameResult) {
      return 'miss';
    }
    
    return 'selected';
  };

  const getNumberStyle = (state) => {
    switch (state) {
      case 'selected':
        return { backgroundColor: '#4299e1', color: '#ffffff' };
      case 'hit':
        return { backgroundColor: '#48bb78', color: '#ffffff' };
      case 'miss':
        return { backgroundColor: '#f56565', color: '#ffffff' };
      default:
        return { backgroundColor: '#2d3748', color: '#a0aec0' };
    }
  };

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-semibold mb-6" style={{ color: '#e2e8f0' }}>
          🎱 Keno
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN - 25% (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Controls Card */}
            <div 
              className="rounded-xl border p-6"
              style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#e2e8f0' }}>
                Controls
              </h3>

              {/* Bet Amount */}
              <div className="mb-4">
                <label className="block text-sm font-normal mb-2" style={{ color: '#a0aec0' }}>
                  Bet Amount
                </label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  disabled={loading}
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

              {/* Numbers Selected */}
              <div 
                className="mb-4 p-3 rounded-lg text-center"
                style={{ backgroundColor: '#2d3748' }}
              >
                <div className="text-xs font-normal" style={{ color: '#a0aec0' }}>
                  Numbers Selected
                </div>
                <div className="text-2xl font-mono font-semibold" style={{ color: '#e2e8f0' }}>
                  {pickedNumbers.length}/10
                </div>
              </div>

              {/* Quick Pick Button */}
              <button
                onClick={quickPick}
                disabled={loading}
                className="w-full rounded-lg px-6 py-2 font-medium mb-2 transition-colors"
                style={{ 
                  backgroundColor: loading ? '#2d3748' : '#f6ad55',
                  color: '#ffffff',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#ed8936')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#f6ad55')}
              >
                Quick Pick
              </button>

              {/* Clear Button */}
              <button
                onClick={clearSelection}
                disabled={loading}
                className="w-full rounded-lg px-6 py-2 font-medium mb-4 transition-colors"
                style={{ 
                  backgroundColor: loading ? '#2d3748' : '#2d3748',
                  color: '#e2e8f0',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#3d4758')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#2d3748')}
              >
                Clear
              </button>

              {/* Play Button */}
              <button
                onClick={handlePlay}
                disabled={loading || pickedNumbers.length !== 10}
                className="w-full rounded-lg px-6 py-3 font-medium transition-colors"
                style={{ 
                  backgroundColor: (loading || pickedNumbers.length !== 10) ? '#2d3748' : '#4299e1',
                  color: '#ffffff',
                  cursor: (loading || pickedNumbers.length !== 10) ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => !(loading || pickedNumbers.length !== 10) && (e.target.style.backgroundColor = '#3182ce')}
                onMouseLeave={(e) => !(loading || pickedNumbers.length !== 10) && (e.target.style.backgroundColor = '#4299e1')}
              >
                {loading ? 'Drawing...' : '🎱 PLAY'}
              </button>
            </div>

            {/* Payout Table */}
            <div 
              className="rounded-xl border p-6"
              style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}
            >
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#e2e8f0' }}>
                Payout Table
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {payoutTable.map((item) => (
                  <div 
                    key={item.matches}
                    className="flex items-center justify-between py-2 border-b"
                    style={{ borderColor: '#2d3748' }}
                  >
                    <span className="text-sm font-normal" style={{ color: '#a0aec0' }}>
                      {item.matches} matches
                    </span>
                    <span className="text-sm font-mono font-semibold" style={{ color: '#48bb78' }}>
                      {item.multiplier}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER COLUMN - 55% (7 cols) */}
          <div className="lg:col-span-7">
            <div 
              className="rounded-xl border p-6"
              style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}
            >
              {/* Result Display */}
              {gameResult && (
                <div 
                  className="mb-6 p-4 rounded-lg text-center"
                  style={{ backgroundColor: '#2d3748' }}
                >
                  <div className="text-lg font-semibold" style={{ color: '#e2e8f0' }}>
                    {gameResult.matches} Matches - {gameResult.matches >= 4 ? `${gameResult.multiplier}x Multiplier` : 'No Win'}
                  </div>
                  {gameResult.matches >= 4 && (
                    <div className="text-2xl font-mono font-semibold mt-2" style={{ color: '#48bb78' }}>
                      Won ${gameResult.payout.toFixed(2)}
                    </div>
                  )}
                </div>
              )}

              {/* Number Grid - 8x10 */}
              <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: 80 }, (_, i) => i + 1).map((num) => {
                  const state = getNumberState(num);
                  const style = getNumberStyle(state);
                  
                  return (
                    <button
                      key={num}
                      onClick={() => toggleNumber(num)}
                      disabled={loading}
                      className="rounded-full font-mono font-semibold transition-all hover:scale-105"
                      style={{
                        width: '45px',
                        height: '45px',
                        ...style,
                        cursor: loading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - 20% (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Drawn Numbers */}
            <div 
              className="rounded-xl border p-6"
              style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}
            >
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#e2e8f0' }}>
                Drawn Numbers
              </h3>
              {drawnNumbers.length === 0 ? (
                <p className="text-xs text-center" style={{ color: '#a0aec0' }}>
                  No numbers drawn yet
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {drawnNumbers.map((num, idx) => (
                    <div
                      key={idx}
                      className="rounded-full font-mono font-semibold flex items-center justify-center"
                      style={{
                        width: '35px',
                        height: '35px',
                        backgroundColor: pickedNumbers.includes(num) ? '#48bb78' : '#2d3748',
                        color: '#ffffff',
                        fontSize: '12px'
                      }}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Games */}
            <div 
              className="rounded-xl border p-6"
              style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}
            >
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#e2e8f0' }}>
                Recent Games
              </h3>
              {recentGames.length === 0 ? (
                <p className="text-xs text-center" style={{ color: '#a0aec0' }}>
                  No games yet
                </p>
              ) : (
                <div className="space-y-2">
                  {recentGames.map((game, index) => (
                    <div 
                      key={index}
                      className="p-2 rounded border"
                      style={{ borderColor: '#2d3748', backgroundColor: '#1a1f2e' }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono" style={{ color: '#a0aec0' }}>
                          {game.matches} hits
                        </span>
                        <span 
                          className="text-xs font-semibold"
                          style={{ color: game.matches >= 4 ? '#48bb78' : '#f56565' }}
                        >
                          {game.matches >= 4 ? `+$${game.profit.toFixed(2)}` : `-$${game.betAmount.toFixed(2)}`}
                        </span>
                      </div>
                      {game.matches >= 4 && (
                        <div className="text-xs font-mono" style={{ color: '#f6ad55' }}>
                          {game.multiplier}x
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Keno;
