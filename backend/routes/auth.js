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

    // Create new user
    const user = new User({
      name,
      email,
      password
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
    const { gameType, result } = req.body;
    console.log('Updating stats:', { gameType, result });

    // Find user and update stats
    const update = {
      $inc: {
        [`stats.${gameType}.gamesPlayed`]: 1
      }
    };

    // Update specific result counter
    if (result === 'win') {
      update.$inc[`stats.${gameType}.wins`] = 1;
    } else if (result === 'draw') {
      update.$inc[`stats.${gameType}.draws`] = 1;
    } else if (result === 'lose') {
      update.$inc[`stats.${gameType}.losses`] = 1;
    }

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      update,
      { new: true }
    ).select('-password');

    console.log('Updated user:', user);
    res.json(user);
  } catch (error) {
    console.error('Error updating stats:', error);
    res.status(500).json({ message: 'Error updating stats' });
  }
});

module.exports = router; 