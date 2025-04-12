const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user with initialized stats
    const user = new User({
      name,
      email,
      password,
      stats: {
        tictactoe: {
          gamesPlayed: 0,
          wins: 0,
          draws: 0,
          losses: 0
        },
        rps: {
          gamesPlayed: 0,
          wins: 0,
          draws: 0,
          losses: 0
        },
        snake: {
          gamesPlayed: 0,
          highScore: 0
        }
      }
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        stats: user.stats
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        stats: user.stats
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Decoded token:', decoded);
    
    const user = await User.findById(decoded.userId).select('-password');
    console.log('Found user:', user);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize stats if they don't exist
    if (!user.stats) {
      console.log('Initializing stats for user');
      user.stats = {
        tictactoe: {
          gamesPlayed: 0,
          wins: 0,
          draws: 0,
          losses: 0
        },
        rps: {
          gamesPlayed: 0,
          wins: 0,
          draws: 0,
          losses: 0
        },
        snake: {
          gamesPlayed: 0,
          highScore: 0
        }
      };
      await user.save();
    }

    res.json(user);
  } catch (error) {
    console.error('Error in /me endpoint:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Update game statistics
router.put('/stats', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const { gameType, result, score } = req.body;
    console.log('Updating stats:', { gameType, result, score });

    // First, get the current user to check their stats
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize stats if they don't exist
    if (!user.stats) {
      user.stats = {
        tictactoe: { gamesPlayed: 0, wins: 0, draws: 0, losses: 0 },
        rps: { gamesPlayed: 0, wins: 0, draws: 0, losses: 0 },
        snake: { gamesPlayed: 0, highScore: 0 }
      };
      await user.save();
    }

    // Initialize specific game stats if they don't exist
    if (!user.stats[gameType]) {
      if (gameType === 'snake') {
        user.stats[gameType] = { gamesPlayed: 0, highScore: 0 };
      } else {
        user.stats[gameType] = { gamesPlayed: 0, wins: 0, draws: 0, losses: 0 };
      }
      await user.save();
    }

    // Prepare the update
    const update = {};

    // Update specific result counter
    if (result === 'win') {
      update.$inc = {
        [`stats.${gameType}.gamesPlayed`]: 1,
        [`stats.${gameType}.wins`]: 1
      };
    } else if (result === 'draw') {
      update.$inc = {
        [`stats.${gameType}.gamesPlayed`]: 1,
        [`stats.${gameType}.draws`]: 1
      };
    } else if (result === 'lose') {
      update.$inc = {
        [`stats.${gameType}.gamesPlayed`]: 1,
        [`stats.${gameType}.losses`]: 1
      };
    } else if (result === 'gamesPlayed') {
      // For snake game, just increment games played
      update.$inc = {
        [`stats.${gameType}.gamesPlayed`]: 1
      };
    } else if (result === 'highScore' && gameType === 'snake' && score) {
      // For snake game high score
      const currentHighScore = user.stats.snake.highScore || 0;
      console.log('Checking high score:', { currentHighScore, newScore: score });
      if (score > currentHighScore) {
        console.log('New high score! Updating from', currentHighScore, 'to', score);
        update.$set = {
          [`stats.${gameType}.highScore`]: score
        };
      }
      // Always increment games played for snake game
      update.$inc = {
        [`stats.${gameType}.gamesPlayed`]: 1
      };
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      update,
      { new: true }
    ).select('-password');

    console.log('Updated user:', updatedUser);
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating stats:', error);
    res.status(500).json({ message: 'Error updating stats' });
  }
});

// Get leaderboard data
router.get('/leaderboard', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token but don't need the decoded data
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Get all users with their stats
    const users = await User.find({}, 'name stats')
      .sort({ 'stats.tictactoe.wins': -1, 'stats.rps.wins': -1 })
      .limit(100);

    // Format the data for the frontend
    const leaderboardData = users.map(user => ({
      username: user.name,
      gameStats: user.stats || {
        tictactoe: { gamesPlayed: 0, wins: 0, draws: 0, losses: 0 },
        rps: { gamesPlayed: 0, wins: 0, draws: 0, losses: 0 }
      }
    }));

    res.json(leaderboardData);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard data' });
  }
});

module.exports = router; 