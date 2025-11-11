import React, { useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DragonTower = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [difficulty, setDifficulty] = useState('easy');
  const [gameState, setGameState] = useState('idle'); // idle, playing, finished
  const [gameId, setGameId] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(0);
  const [tower, setTower] = useState([]);
  const [revealedTiles, setRevealedTiles] = useState({});
  const [config, setConfig] = useState({ eggs: 2, tiles: 3, levels: 8 });
  const [payoutTable, setPayoutTable] = useState([]);
  const [loading, setLoading] = useState(false);

  const difficultyOptions = {
    easy: { eggs: 3, tiles: 4, levels: 8 },
    medium: { eggs: 2, tiles: 3, levels: 9 },
    hard: { eggs: 1, tiles: 2, levels: 10 },
  };

  const calculatePayoutTable = (eggs, tiles, levels) => {
    const table = [];
    let multiplier = 1;
    for (let i = 0; i < levels; i++) {
      multiplier *= (tiles / eggs);
      table.push({ level: i + 1, multiplier: multiplier * 0.99 });
    }
    return table;
  };

  const handleStart = async () => {
    if (betAmount <= 0) {
      toast.error('Bet amount must be greater than 0');
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post('/games/dragon-tower/init', {
        betAmount: parseFloat(betAmount),
        difficulty
      });

      if (response.data.success) {
        const { gameId, config } = response.data;
        setGameId(gameId);
        setConfig(config);
        setGameState('playing');
        setCurrentLevel(0);
        setCurrentMultiplier(0);
        setRevealedTiles({});
        
        // Initialize tower structure
        const newTower = Array(config.levels).fill(null).map(() => 
          Array(config.tiles).fill('closed')
        );
        setTower(newTower);
        
        // Calculate payout table
        const table = calculatePayoutTable(config.eggs, config.tiles, config.levels);
        setPayoutTable(table);
        
        toast.success('Game started!');
      } else {
        toast.error(response.data.error || 'Failed to start game');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  const handleTileClick = async (level, tileIndex) => {
    if (gameState !== 'playing' || level !== currentLevel || loading) return;
    if (revealedTiles[`${level}-${tileIndex}`]) return;

    setLoading(true);

    try {
      const response = await api.post('/games/dragon-tower', {
        gameId,
        level,
        tileIndex,
        action: 'continue'
      });

      if (response.data.success) {
        const result = response.data.result;
        
        // Update revealed tile
        const tileKey = `${level}-${tileIndex}`;
        setRevealedTiles(prev => ({
          ...prev,
          [tileKey]: result.isEgg ? 'egg' : 'bomb'
        }));

        if (result.isEgg) {
          // Egg found - move to next level
          setCurrentLevel(result.currentLevel);
          setCurrentMultiplier(result.multiplier);
          toast.success('Egg found! Continue or cash out?');
          
          // Check if game is complete
          if (result.currentLevel >= config.levels) {
            setGameState('finished');
            toast.success(`Won ${result.payout.toFixed(2)}!`);
          }
        } else {
          // Bomb hit - game over
          setGameState('finished');
          toast.error('Bomb! Game over');
        }
      } else {
        toast.error(response.data.error || 'Move failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to make move');
    } finally {
      setLoading(false);
    }
  };

  const handleCashOut = async () => {
    if (gameState !== 'playing' || currentLevel === 0 || loading) return;

    setLoading(true);

    try {
      const response = await api.post('/games/dragon-tower', {
        gameId,
        action: 'collect'
      });

      if (response.data.success) {
        const result = response.data.result;
        setGameState('finished');
        toast.success(`Cashed out ${result.payout.toFixed(2)}!`);
      } else {
        toast.error(response.data.error || 'Cash out failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cash out');
    } finally {
      setLoading(false);
    }
  };

  const getTileContent = (level, tileIndex) => {
    const tileKey = `${level}-${tileIndex}`;
    const state = revealedTiles[tileKey];

    if (state === 'egg') {
      return (
        <svg className="w-8 h-8" fill="none" stroke="#48bb78" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    
    if (state === 'bomb') {
      return (
        <svg className="w-8 h-8" fill="none" stroke="#f56565" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }

    return null;
  };

  const getTileStyle = (level, tileIndex) => {
    const tileKey = `${level}-${tileIndex}`;
    const state = revealedTiles[tileKey];
    const isCurrentLevel = level === currentLevel && gameState === 'playing';

    if (state === 'egg') {
      return { backgroundColor: 'rgba(72, 187, 120, 0.2)', borderColor: '#48bb78' };
    }
    
    if (state === 'bomb') {
      return { backgroundColor: 'rgba(245, 101, 101, 0.2)', borderColor: '#f56565' };
    }

    if (isCurrentLevel && !loading) {
      return { backgroundColor: '#2d3748', borderColor: '#4299e1', cursor: 'pointer' };
    }

    return { backgroundColor: '#2d3748', borderColor: '#2d3748' };
  };

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-semibold mb-6" style={{ color: '#e2e8f0' }}>
          🐉 Dragon Tower
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN - 25% (3 cols) */}
          <div className="lg:col-span-3">
            <div 
              className="rounded-xl border p-6 sticky top-20"
              style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#e2e8f0' }}>
                Controls
              </h3>

              {gameState === 'idle' && (
                <>
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

                  {/* Difficulty */}
                  <div className="mb-4">
                    <label className="block text-sm font-normal mb-2" style={{ color: '#a0aec0' }}>
                      Difficulty
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full rounded-lg border px-4 py-2 focus:outline-none"
                      style={{ 
                        backgroundColor: '#2d3748', 
                        borderColor: '#2d3748',
                        color: '#e2e8f0'
                      }}
                    >
                      <option value="easy">Easy (3 eggs, 4 tiles)</option>
                      <option value="medium">Medium (2 eggs, 3 tiles)</option>
                      <option value="hard">Hard (1 egg, 2 tiles)</option>
                    </select>
                  </div>

                  {/* Start Button */}
                  <button
                    onClick={handleStart}
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
                    {loading ? 'Starting...' : '🐉 START'}
                  </button>
                </>
              )}

              {gameState === 'playing' && (
                <>
                  {/* Current Level */}
                  <div 
                    className="mb-4 p-3 rounded-lg"
                    style={{ backgroundColor: '#2d3748' }}
                  >
                    <div className="text-xs font-normal" style={{ color: '#a0aec0' }}>
                      Current Level
                    </div>
                    <div className="text-2xl font-mono font-semibold" style={{ color: '#e2e8f0' }}>
                      {currentLevel}/{config.levels}
                    </div>
                  </div>

                  {/* Current Multiplier */}
                  <div 
                    className="mb-4 p-3 rounded-lg"
                    style={{ backgroundColor: '#2d3748' }}
                  >
                    <div className="text-xs font-normal" style={{ color: '#a0aec0' }}>
                      Current Multiplier
                    </div>
                    <div className="text-2xl font-mono font-semibold" style={{ color: '#48bb78' }}>
                      {currentMultiplier.toFixed(2)}×
                    </div>
                  </div>

                  {/* Cash Out Button */}
                  {currentLevel > 0 && (
                    <button
                      onClick={handleCashOut}
                      disabled={loading}
                      className="w-full rounded-lg px-6 py-3 font-medium transition-colors"
                      style={{ 
                        backgroundColor: loading ? '#2d3748' : '#48bb78',
                        color: '#ffffff',
                        cursor: loading ? 'not-allowed' : 'pointer'
                      }}
                      onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#38a169')}
                      onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#48bb78')}
                    >
                      💰 CASH OUT (${(betAmount * currentMultiplier).toFixed(2)})
                    </button>
                  )}
                </>
              )}

              {gameState === 'finished' && (
                <button
                  onClick={() => setGameState('idle')}
                  className="w-full rounded-lg px-6 py-3 font-medium transition-colors"
                  style={{ 
                    backgroundColor: '#4299e1',
                    color: '#ffffff'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#3182ce'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#4299e1'}
                >
                  🔄 NEW GAME
                </button>
              )}
            </div>
          </div>

          {/* CENTER COLUMN - 50% (6 cols) */}
          <div className="lg:col-span-6">
            <div 
              className="rounded-xl border p-6"
              style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}
            >
              <h3 className="text-lg font-semibold mb-6 text-center" style={{ color: '#e2e8f0' }}>
                {gameState === 'idle' ? 'Start a game to play' : 'Dragon Tower'}
              </h3>

              {gameState !== 'idle' && (
                <div className="space-y-3">
                  {/* Render tower from top to bottom */}
                  {tower.slice().reverse().map((level, idx) => {
                    const actualLevel = tower.length - 1 - idx;
                    return (
                      <div key={actualLevel} className="flex justify-center gap-3">
                        {level.map((_, tileIndex) => (
                          <button
                            key={tileIndex}
                            onClick={() => handleTileClick(actualLevel, tileIndex)}
                            disabled={actualLevel !== currentLevel || gameState !== 'playing' || loading}
                            className="flex items-center justify-center border-2 rounded-lg transition-all hover:scale-105"
                            style={{
                              width: '80px',
                              height: '80px',
                              ...getTileStyle(actualLevel, tileIndex)
                            }}
                          >
                            {getTileContent(actualLevel, tileIndex)}
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - 25% (3 cols) */}
          <div className="lg:col-span-3">
            <div 
              className="rounded-xl border p-6 sticky top-20"
              style={{ backgroundColor: '#1e2433', borderColor: '#2d3748' }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#e2e8f0' }}>
                Payout Ladder
              </h3>

              {payoutTable.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {payoutTable.slice().reverse().map((item, idx) => {
                    const isCurrentLevel = item.level === currentLevel && gameState === 'playing';
                    const isPassed = item.level < currentLevel;
                    
                    return (
                      <div 
                        key={item.level}
                        className="flex items-center justify-between py-2 px-3 rounded border"
                        style={{ 
                          backgroundColor: isCurrentLevel ? '#4299e1' : (isPassed ? 'rgba(72, 187, 120, 0.1)' : 'transparent'),
                          borderColor: isCurrentLevel ? '#4299e1' : '#2d3748'
                        }}
                      >
                        <span 
                          className="text-sm font-normal"
                          style={{ color: isCurrentLevel ? '#ffffff' : '#a0aec0' }}
                        >
                          Level {item.level}
                        </span>
                        <span 
                          className="text-sm font-mono font-semibold"
                          style={{ color: isCurrentLevel ? '#ffffff' : (isPassed ? '#48bb78' : '#e2e8f0') }}
                        >
                          {item.multiplier.toFixed(2)}×
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-center py-4" style={{ color: '#a0aec0' }}>
                  Start a game to see payouts
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DragonTower;
