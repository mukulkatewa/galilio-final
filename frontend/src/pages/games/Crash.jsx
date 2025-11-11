import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const Crash = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [autoCashout, setAutoCashout] = useState('');
  const [loading, setLoading] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState(null);
  const [result, setResult] = useState(null);
  const [recentCrashes, setRecentCrashes] = useState([]);
  const [chartData, setChartData] = useState([{ x: 0, y: 1.00 }]);
  const animationRef = useRef(null);

  const handleBet = async () => {
    if (betAmount <= 0) {
      toast.error('Bet amount must be greater than 0');
      return;
    }

    if (autoCashout && parseFloat(autoCashout) < 1.01) {
      toast.error('Auto cashout must be at least 1.01');
      return;
    }

    setLoading(true);
    setGameActive(false);
    setCurrentMultiplier(1.00);
    setCrashPoint(null);
    setResult(null);
    setChartData([{ x: 0, y: 1.00 }]);

    try {
      const response = await api.post('/games/crash', {
        betAmount: parseFloat(betAmount),
        autoCashout: autoCashout ? parseFloat(autoCashout) : null
      });

      if (response.data.success) {
        const gameResult = response.data.result;
        setCrashPoint(gameResult.crashPoint);
        
        // Start animation
        setGameActive(true);
        animateGame(gameResult);
      } else {
        toast.error(response.data.error || 'Game failed');
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place bet');
      setLoading(false);
    }
  };

  const animateGame = (gameResult) => {
    const startTime = Date.now();
    const duration = Math.min(gameResult.crashPoint * 1000, 5000); // Max 5 seconds
    const targetMultiplier = gameResult.cashedOutAt || gameResult.crashPoint;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Exponential growth curve
      const multiplier = 1 + (targetMultiplier - 1) * progress;
      setCurrentMultiplier(multiplier);
      
      // Update chart data
      setChartData(prev => [...prev, { x: prev.length, y: multiplier }]);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        setGameActive(false);
        setResult(gameResult);
        setRecentCrashes(prev => [gameResult.crashPoint, ...prev.slice(0, 9)]);
        setLoading(false);
        
        if (gameResult.won) {
          toast.success(`Cashed out at ${gameResult.cashedOutAt.toFixed(2)}×! Won $${gameResult.payout.toFixed(2)}`);
        } else {
          toast.error(`Crashed at ${gameResult.crashPoint.toFixed(2)}×`);
        }
      }
    };
    
    animate();
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-semibold mb-6" style={{ color: '#e2e8f0' }}>
          🚀 Crash
        </h1>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* TOP SECTION - 60% */}
          <div 
            className="rounded-xl border p-8"
            style={{ backgroundColor: '#1e2433', borderColor: '#2d3748', minHeight: '400px' }}
          >
            {/* Large Multiplier Display */}
            <div className="text-center mb-6">
              <div 
                className="font-mono font-semibold transition-colors"
                style={{ 
                  fontSize: '80px',
                  color: gameActive ? '#48bb78' : (result ? (result.won ? '#48bb78' : '#f56565') : '#e2e8f0')
                }}
              >
                {currentMultiplier.toFixed(2)}×
              </div>
              {result && (
                <div 
                  className="text-xl font-semibold mt-2"
                  style={{ color: result.won ? '#48bb78' : '#f56565' }}
                >
                  {result.won 
                    ? `Cashed out at ${result.cashedOutAt.toFixed(2)}× - Won $${result.payout.toFixed(2)}`
                    : `Crashed at ${result.crashPoint.toFixed(2)}× - Lost $${result.betAmount.toFixed(2)}`
                  }
                </div>
              )}
              {!result && crashPoint && !gameActive && (
                <div className="text-lg font-semibold mt-2" style={{ color: '#f56565' }}>
                  Crashed at {crashPoint.toFixed(2)}×
                </div>
              )}
            </div>

            {/* Line Graph */}
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="x" 
                    hide 
                  />
                  <YAxis 
                    domain={[1, 'auto']} 
                    hide 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="y" 
                    stroke={gameActive ? '#48bb78' : (result ? (result.won ? '#48bb78' : '#f56565') : '#4299e1')}
                    strokeWidth={3}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* BOTTOM SECTION - 40% */}
          <div 
            className="rounded-xl border p-6"
            style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Controls */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold" style={{ color: '#e2e8f0' }}>
                  Controls
                </h3>

                {/* Bet Amount */}
                <div>
                  <label className="block text-sm font-normal mb-2" style={{ color: '#a0aec0' }}>
                    Bet Amount
                  </label>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    disabled={loading || gameActive}
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

                {/* Auto Cashout */}
                <div>
                  <label className="block text-sm font-normal mb-2" style={{ color: '#a0aec0' }}>
                    Auto Cashout (Optional)
                  </label>
                  <input
                    type="number"
                    value={autoCashout}
                    onChange={(e) => setAutoCashout(e.target.value)}
                    disabled={loading || gameActive}
                    placeholder="e.g. 2.00"
                    className="w-full rounded-lg border px-4 py-2 focus:outline-none"
                    style={{ 
                      backgroundColor: '#2d3748', 
                      borderColor: '#2d3748',
                      color: '#e2e8f0'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#4299e1'}
                    onBlur={(e) => e.target.style.borderColor = '#2d3748'}
                    min="1.01"
                    step="0.01"
                  />
                </div>

                {/* Bet Button */}
                <button
                  onClick={handleBet}
                  disabled={loading || gameActive}
                  className="w-full rounded-lg px-6 py-3 font-medium transition-colors"
                  style={{ 
                    backgroundColor: (loading || gameActive) ? '#2d3748' : '#4299e1',
                    color: '#ffffff',
                    cursor: (loading || gameActive) ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => !(loading || gameActive) && (e.target.style.backgroundColor = '#3182ce')}
                  onMouseLeave={(e) => !(loading || gameActive) && (e.target.style.backgroundColor = '#4299e1')}
                >
                  {loading ? 'Starting...' : gameActive ? 'In Progress...' : '🚀 PLACE BET'}
                </button>
              </div>

              {/* Recent Crash Points */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#e2e8f0' }}>
                  Recent Crashes
                </h3>
                
                {recentCrashes.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: '#a0aec0' }}>
                    No games yet
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {recentCrashes.map((crash, index) => (
                      <div
                        key={index}
                        className="rounded-lg px-4 py-2 font-mono font-semibold"
                        style={{ 
                          backgroundColor: crash < 2 ? '#f56565' : crash < 5 ? '#f6ad55' : '#48bb78',
                          color: '#ffffff'
                        }}
                      >
                        {crash.toFixed(2)}×
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Crash;
