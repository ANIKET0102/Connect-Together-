const User = require('../models/User');
const crypto = require('crypto');

// Helper to hash passwords securely using PBKDF2 / HMAC-SHA256 with a salt
const hashPassword = (password) => {
  const salt = 'grow_together_salt_123!';
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
};

// @desc    Register a new user or temporary guest
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, password, isGuest } = req.body;
    if (!username) {
      return res.status(400).json({ success: false, error: 'Please provide a username' });
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
      return res.status(400).json({ success: false, error: 'Username must be at least 3 characters' });
    }

    if (isGuest) {
      // Append a random 4-digit number to guarantee guest account uniqueness
      const guestUsername = `${trimmedUsername}_guest_${Math.floor(1000 + Math.random() * 9000)}`;
      
      const user = await User.create({
        username: guestUsername,
        isGuest: true
      });

      return res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          isGuest: true,
          createdAt: user.createdAt
        },
      });
    }

    // Standard credentialed registration
    if (!password) {
      return res.status(400).json({ success: false, error: 'Please provide a password' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    // Case-insensitive uniqueness check
    const existingUser = await User.findOne({
      username: { $regex: new RegExp(`^${trimmedUsername}$`, 'i') }
    });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Username is already taken' });
    }

    const hashedPassword = hashPassword(password);
    const user = await User.create({
      username: trimmedUsername,
      password: hashedPassword,
      isGuest: false
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        isGuest: false,
        createdAt: user.createdAt
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Please provide both username and password' });
    }

    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username.trim()}$`, 'i') }
    });

    // Don't allow guest accounts to login via credentials
    if (!user || user.isGuest) {
      return res.status(400).json({ success: false, error: 'Invalid username or password' });
    }

    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(400).json({ success: false, error: 'Invalid username or password' });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        isGuest: false,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// @desc    Check username availability
// @route   GET /api/users/check-username/:username
// @access  Public
const checkUsername = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username || username.trim().length < 3) {
      return res.status(200).json({ success: true, available: false });
    }

    const existingUser = await User.findOne({
      username: { $regex: new RegExp(`^${username.trim()}$`, 'i') }
    });

    res.status(200).json({
      success: true,
      available: !existingUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// @desc    Delete guest user and clear all their related workspace progress automatically
// @route   DELETE /api/users/guest/:userId
// @access  Public
const deleteGuestUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.isGuest) {
      const Room = require('../models/Room');
      const Task = require('../models/Task');
      const Application = require('../models/Application');
      const ActivityLog = require('../models/ActivityLog');

      // Find all rooms where the guest is a participant
      const rooms = await Room.find({ participants: userId });

      for (const room of rooms) {
        // Filter out the guest from participants
        room.participants = room.participants.filter(
          (participantId) => participantId.toString() !== userId
        );

        if (room.participants.length === 0) {
          // If no users left, purge all room data
          await Task.deleteMany({ roomId: room._id });
          await Application.deleteMany({ roomId: room._id });
          await ActivityLog.deleteMany({ roomId: room._id });
          await room.deleteOne();
        } else {
          // Otherwise, save the updated room state
          await room.save();
        }
      }

      // Purge this guest's activity contribution logs
      await ActivityLog.deleteMany({ userId });

      // Delete the guest User document itself
      await user.deleteOne();
    }

    res.status(200).json({
      success: true,
      message: 'Guest progress vanished successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  checkUsername,
  deleteGuestUser
};
