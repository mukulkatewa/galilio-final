import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Dice = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [target, setTarget] = useState(50);
  const [rollOver, setRollOver] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [recentGames, setRecentGames] = useState([]);
  const [winChance, setWinChance] = useState(50);
  const [multiplier, setMultiplier] = useState(1.98);

  // Calculate win chance and multiplier
  useEffect(() => {
    const chance = rollOver ? (100 - target) : target;
    const mult = (100 / chance) * 0.99;
    setWinChance(chance);
    setMultiplier(mult);
  }, [target, rollOver]);

  const handleRoll = async () => {
    if (betAmount <= 0) {
      toast.error('Bet amount must be greater than 0');
      return;
    }

    if (target < 1 || target > 99) {
      toast.error('Target must be between 1 and 99');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/games/dice', {
        betAmount: parseFloat(betAmount),
        target: parseInt(target),
        rollOver
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
        toast.error(response.data.error || 'Roll failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to roll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-semibold mb-6" style={{ color: '#e2e8f0' }}>
          🎲 Dice
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT COLUMN - 60% */}
          <div className="lg:col-span-3 space-y-6">
            {/* Result Display */}
            <div 
              className="rounded-xl border p-8"
              style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}
            >
              <div className="text-center">
                <div className="text-sm font-normal mb-2" style={{ color: '#a0aec0' }}>
                  Roll Result
                </div>
                <div 
                  className="text-8xl font-mono font-semibold transition-opacity"
                  style={{ 
                    color: '#e2e8f0',
                    opacity: result ? 1 : 0.3
                  }}
                >
                  {result ? result.result.toFixed(2) : '00.00'}
                </div>
                {result && (
                  <div 
                    className="text-xl font-semibold mt-4"
                    style={{ color: result.won ? '#48bb78' : '#f56565' }}
                  >
                    {result.won ? `Won $${result.payout.toFixed(2)}` : `Lost $${result.betAmount.toFixed(2)}`}
                  </div>
                )}
              </div>
            </div>

            {/* Visual Indicator Bar */}
            <div 
              className="rounded-xl border p-6"
              style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}
            >
              <div className="text-sm font-normal mb-4" style={{ color: '#a0aec0' }}>
                Visual Range (0-100)
              </div>
              
              <div className="relative h-20">
                {/* Background bar */}
                <div 
                  className="absolute inset-0 rounded-lg overflow-hidden"
                  style={{ backgroundColor: '#2d3748' }}
                >
                  {/* Win zone (green) and Lose zone (red) */}
                  {rollOver ? (
                    <>
                      {/* Red zone (0 to target) */}
                      <div 
                        className="absolute top-0 bottom-0 left-0"
                        style={{ 
                          width: `${target}%`,
                          backgroundColor: 'rgba(245, 101, 101, 0.3)'
                        }}
                      />
                      {/* Green zone (target to 100) */}
                      <div 
                        className="absolute top-0 bottom-0 right-0"
                        style={{ 
                          width: `${100 - target}%`,
                          backgroundColor: 'rgba(72, 187, 120, 0.3)'
                        }}
                      />
                    </>
                  ) : (
                    <>
                      {/* Green zone (0 to target) */}
                      <div 
                        className="absolute top-0 bottom-0 left-0"
                        style={{ 
                          width: `${target}%`,
                          backgroundColor: 'rgba(72, 187, 120, 0.3)'
                        }}
                      />
                      {/* Red zone (target to 100) */}
                      <div 
                        className="absolute top-0 bottom-0 right-0"
                        style={{ 
                          width: `${100 - target}%`,
                          backgroundColor: 'rgba(245, 101, 101, 0.3)'
                        }}
                      />
                    </>
                  )}
                </div>

                {/* Target marker line */}
                <div 
                  className="absolute top-0 bottom-0 w-1"
                  style={{ 
                    left: `${target}%`,
                    backgroundColor: '#e2e8f0',
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div 
                    className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono px-2 py-1 rounded"
                    style={{ 
                      backgroundColor: '#1e2433',
                      color: '#e2e8f0'
                    }}
                  >
                    {target}
                  </div>
                </div>

                {/* Result marker (appears after roll) */}
                {result && (
                  <div 
                    className="absolute top-0 bottom-0 w-2 animate-pulse"
                    style={{ 
                      left: `${result.result}%`,
                      backgroundColor: result.won ? '#48bb78' : '#f56565',
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div 
                      className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-mono font-semibold px-2 py-1 rounded"
                      style={{ 
                        backgroundColor: result.won ? '#48bb78' : '#f56565',
                        color: '#ffffff'
                      }}
                    >
                      {result.result.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              {/* Labels */}
              <div className="flex justify-between mt-8 text-xs font-mono" style={{ color: '#a0aec0' }}>
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - 40% */}
          <div className="lg:col-span-2 space-y-6">
            {/* Controls Card */}
            <div 
              className="rounded-xl border p-6"
              style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#e2e8f0' }}>
                Game Controls
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

              {/* Target Slider */}
              <div className="mb-4">
                <label className="block text-sm font-normal mb-2" style={{ color: '#a0aec0' }}>
                  Target: <span className="font-mono font-semibold" style={{ color: '#e2e8f0' }}>{target}</span>
                </label>
                <input
                  type="range"
                  value={target}
                  onChange={(e) => setTarget(parseInt(e.target.value))}
                  min="1"
                  max="99"
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{ 
                    backgroundColor: '#2d3748',
                    accentColor: '#4299e1'
                  }}
                />
                <div className="flex justify-between text-xs font-mono mt-1" style={{ color: '#a0aec0' }}>
                  <span>1</span>
                  <span>99</span>
                </div>
              </div>

              {/* Roll Over/Under Toggle */}
              <div className="mb-4">
                <label className="block text-sm font-normal mb-2" style={{ color: '#a0aec0' }}>
                  Roll Type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRollOver(true)}
                    className="flex-1 rounded-lg px-4 py-2 font-medium transition-colors"
                    style={{ 
                      backgroundColor: rollOver ? '#4299e1' : '#2d3748',
                      color: '#e2e8f0'
                    }}
                  >
                    Roll Over
                  </button>
                  <button
                    onClick={() => setRollOver(false)}
                    className="flex-1 rounded-lg px-4 py-2 font-medium transition-colors"
                    style={{ 
                      backgroundColor: !rollOver ? '#4299e1' : '#2d3748',
                      color: '#e2e8f0'
                    }}
                  >
                    Roll Under
                  </button>
                </div>
              </div>

              {/* Win Chance & Multiplier */}
              <div className="grid grid-cols-2 gap-4 mb-4">
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
                    {multiplier.toFixed(2)}x
                  </div>
                </div>
              </div>

              {/* Roll Button */}
              <button
                onClick={handleRoll}
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
                {loading ? 'Rolling...' : '🎲 ROLL'}
              </button>
            </div>

            {/* Recent Results */}
            <div 
              className="rounded-xl border p-6"
              style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#e2e8f0' }}>
                Recent Results
              </h3>
              
              {recentGames.length === 0 ? (
                <p className="text-sm text-center" style={{ color: '#a0aec0' }}>
                  No games yet
                </p>
              ) : (
                <div className="space-y-2">
                  {recentGames.map((game, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between py-2 border-b"
                      style={{ borderColor: '#2d3748' }}
                    >
                      <span className="font-mono font-semibold" style={{ color: '#e2e8f0' }}>
                        {game.result.toFixed(2)}
                      </span>
                      <span 
                        className="text-sm font-medium"
                        style={{ color: game.won ? '#48bb78' : '#f56565' }}
                      >
                        {game.won ? `+$${game.profit.toFixed(2)}` : `-$${game.betAmount.toFixed(2)}`}
                      </span>
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

export default Dice;
