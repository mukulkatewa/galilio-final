 const ProvablyFairRNG = require('../utils/rng');
const GameService = require('../services/gameService');

// Game state manager for multiplayer crash (Stake.com style)
class CrashGameManager {
  constructor() {
    this.currentGame = null;
    this.activeBets = new Map(); // userId -> { betAmount, joinedAt, autoCashout }
    this.roundCounter = 0;
  }

  generateCrashPoint() {
    this.roundCounter++;
    
    // Generate provably fair seeds
    const serverSeed = ProvablyFairRNG.generateServerSeed();
    const clientSeed = ProvablyFairRNG.generateClientSeed();
    const nonce = Date.now() + this.roundCounter;
    
    // Use provably fair RNG
    const hash = ProvablyFairRNG.generateHash(serverSeed, clientSeed, nonce);
    
    // Stake.com crash algorithm
    // Convert hash to number and apply house edge formula
    const hashValue = parseInt(hash.substring(0, 8), 16);
    const e = hashValue / 0xFFFFFFFF; // Normalize to 0-1
    
    // House edge: 1%
    // Formula: floor(99 / (e * 100) * 100) / 100
    let crashPoint;
    
    if (e === 0) {
      crashPoint = 100; // Max multiplier
    } else {
      const result = 99 / (e * 100);
      crashPoint = Math.floor(result * 100) / 100;
    }
    
    // Clamp between 1.00 and 100.00 (Stake limits)
    crashPoint = Math.max(1.00, Math.min(crashPoint, 100.00));
    
    return {
      crashPoint,
      serverSeed,
      clientSeed,
      nonce,
      hash
    };
  }

  startNewRound() {
    const crashData = this.generateCrashPoint();
    this.currentGame = {
      ...crashData,
      startTime: Date.now(),
      status: 'betting', // Stake has betting phase
      bettingEndsAt: Date.now() + 5000, // 5 second betting window
      gameStartedAt: null
    };
    this.activeBets.clear();
    
    // Auto-start game after betting phase
    setTimeout(() => {
      if (this.currentGame && this.currentGame.status === 'betting') {
        this.currentGame.status = 'active';
        this.currentGame.gameStartedAt = Date.now();
      }
    }, 5000);
    
    return this.currentGame;
  }

  placeBet(userId, betAmount, autoCashout = null) {
    if (!this.currentGame) {
      return { success: false, error: 'No active game' };
    }

    // Can only bet during betting phase or very early in active phase
    if (this.currentGame.status === 'crashed') {
      return { success: false, error: 'Game has ended' };
    }

    if (this.currentGame.status === 'active') {
      const elapsed = Date.now() - this.currentGame.gameStartedAt;
      if (elapsed > 500) { // Only allow bets in first 0.5 seconds
        return { success: false, error: 'Betting closed' };
      }
    }

    this.activeBets.set(userId, {
      betAmount,
      joinedAt: Date.now(),
      autoCashout: autoCashout || null,
      cashedOut: false
    });

    return { success: true };
  }

  cashOut(userId, multiplier) {
    const bet = this.activeBets.get(userId);
    if (!bet) {
      return { success: false, error: 'No active bet found' };
    }

    if (bet.cashedOut) {
      return { success: false, error: 'Already cashed out' };
    }

    if (!this.currentGame || this.currentGame.status !== 'active') {
      return { success: false, error: 'Game is not active' };
    }

    if (multiplier > this.currentGame.crashPoint) {
      return { success: false, error: 'Game already crashed' };
    }

    // Mark as cashed out but keep in activeBets for history
    bet.cashedOut = true;
    bet.cashOutMultiplier = multiplier;
    bet.payout = bet.betAmount * multiplier;

    return {
      success: true,
      betAmount: bet.betAmount,
      cashOutMultiplier: multiplier,
      payout: bet.payout
    };
  }

  getMultiplierAtTime() {
    if (!this.currentGame || this.currentGame.status !== 'active') {
      return 1.00;
    }

    const elapsed = Date.now() - this.currentGame.gameStartedAt;
    
    // Stake.com multiplier growth formula
    // Exponential growth: multiplier = e^(0.00006 * elapsed_ms)
    const multiplier = Math.pow(Math.E, 0.00006 * elapsed);
    
    // Check if we've reached crash point
    if (multiplier >= this.currentGame.crashPoint) {
      this.currentGame.status = 'crashed';
      return this.currentGame.crashPoint;
    }
    
    return Math.floor(multiplier * 100) / 100;
  }

  processAutoCashouts(currentMultiplier) {
    const results = [];
    
    for (const [userId, bet] of this.activeBets.entries()) {
      if (!bet.cashedOut && bet.autoCashout && currentMultiplier >= bet.autoCashout) {
        const result = this.cashOut(userId, bet.autoCashout);
        if (result.success) {
          results.push({ userId, ...result });
        }
      }
    }
    
    return results;
  }

  getCurrentGame() {
    return this.currentGame;
  }

  endRound() {
    if (this.currentGame) {
      this.currentGame.status = 'crashed';
    }
  }
}

// Single instance for all players
const gameManager = new CrashGameManager();

class CrashController {
  
  // Get current game state
  static async getCurrentGame(req, res) {
    try {
      let game = gameManager.getCurrentGame();
      
      // Auto-create new game if none exists or if crashed
      if (!game || game.status === 'crashed') {
        game = gameManager.startNewRound();
        console.log('NEW CRASH ROUND:', {
          crashPoint: game.crashPoint,
          hash: game.hash,
          serverSeed: game.serverSeed.substring(0, 8) + '...'
        });
      }

      let currentMultiplier = 1.00;
      let timeRemaining = null;

      if (game.status === 'betting') {
        timeRemaining = Math.max(0, game.bettingEndsAt - Date.now());
      } else if (game.status === 'active') {
        currentMultiplier = gameManager.getMultiplierAtTime();
        
        // Process auto cashouts
        gameManager.processAutoCashouts(currentMultiplier);
        
        // Check if game should end
        if (currentMultiplier >= game.crashPoint) {
          gameManager.endRound();
          currentMultiplier = game.crashPoint;
        }
      }

      res.json({
        success: true,
        game: {
          crashPoint: game.status === 'crashed' ? game.crashPoint : null, // Hide until crashed
          startTime: game.startTime,
          gameStartedAt: game.gameStartedAt,
          status: game.status,
          currentMultiplier,
          timeRemaining,
          hash: game.hash // For provably fair verification
        }
      });
    } catch (error) {
      console.error('Get current game error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get game state' 
      });
    }
  }

  // Place bet on current round
  static async placeBet(req, res) {
    try {
      const { betAmount, autoCashout } = req.body;
      const userId = req.user.id;
      
      if (!betAmount || betAmount <= 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid bet amount' 
        });
      }

      // Validate auto cashout
      if (autoCashout && (autoCashout < 1.01 || autoCashout > 100)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Auto cashout must be between 1.01x and 100x' 
        });
      }
      
      if (parseFloat(req.user.balance) < betAmount) {
        return res.status(400).json({ 
          success: false, 
          error: 'Insufficient balance' 
        });
      }

      // Ensure game exists
      let game = gameManager.getCurrentGame();
      if (!game || game.status === 'crashed') {
        game = gameManager.startNewRound();
      }

      const result = gameManager.placeBet(userId, betAmount, autoCashout);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      // Deduct balance immediately
      await GameService.updateBalance(userId, -betAmount);

      res.json({
        success: true,
        message: 'Bet placed successfully',
        gameStatus: game.status,
        bettingEndsAt: game.bettingEndsAt,
        autoCashout
      });
    } catch (error) {
      console.error('Place bet error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to place bet' 
      });
    }
  }

  // Manual cashout
  static async cashOut(req, res) {
    try {
      const userId = req.user.id;
      
      const game = gameManager.getCurrentGame();
      if (!game || game.status !== 'active') {
        return res.status(400).json({ 
          success: false, 
          error: 'Cannot cash out now' 
        });
      }

      const currentMultiplier = gameManager.getMultiplierAtTime();
      
      if (currentMultiplier >= game.crashPoint) {
        return res.status(400).json({ 
          success: false, 
          error: 'Game crashed' 
        });
      }

      const cashOutResult = gameManager.cashOut(userId, currentMultiplier);
      
      if (!cashOutResult.success) {
        return res.status(400).json(cashOutResult);
      }

      // Record in database
      const betAmount = cashOutResult.betAmount;
      const payout = cashOutResult.payout;
      const profit = payout - betAmount;

      const gameData = {
        crashPoint: game.crashPoint,
        cashedOutAt: currentMultiplier,
        won: true
      };

      const dbResult = await GameService.recordGame(
        userId,
        'crash',
        betAmount,
        payout,
        profit,
        gameData,
        game.serverSeed,
        game.clientSeed,
        game.nonce
      );

      res.json({
        success: true,
        result: {
          betAmount,
          cashOutMultiplier: currentMultiplier,
          payout,
          profit,
          newBalance: parseFloat(dbResult.newBalance)
        }
      });
    } catch (error) {
      console.error('Cash out error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to cash out' 
      });
    }
  }

  // Get game history
  static async getHistory(req, res) {
    try {
      // Return last 10 crash points for display
      // You'd implement this in your GameService
      const history = await GameService.getCrashHistory(10);
      
      res.json({
        success: true,
        history
      });
    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get history' 
      });
    }
  }

  // Verify game result (provably fair)
  static async verifyGame(req, res) {
    try {
      const { serverSeed, clientSeed, nonce } = req.body;
      
      const hash = ProvablyFairRNG.generateHash(serverSeed, clientSeed, nonce);
      const hashValue = parseInt(hash.substring(0, 8), 16);
      const e = hashValue / 0xFFFFFFFF;
      
      let crashPoint;
      if (e === 0) {
        crashPoint = 100;
      } else {
        const result = 99 / (e * 100);
        crashPoint = Math.floor(result * 100) / 100;
      }
      
      crashPoint = Math.max(1.00, Math.min(crashPoint, 100.00));
      
      res.json({
        success: true,
        verified: true,
        crashPoint,
        hash
      });
    } catch (error) {
      console.error('Verify game error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to verify game' 
      });
    }
  }
}

module.exports = CrashController;