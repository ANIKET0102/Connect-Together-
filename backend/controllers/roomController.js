const Room = require('../models/Room');
const User = require('../models/User');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

// Helper to generate a random 6-digit numeric code
const generateRoomCode = () => {
  const chars = '0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// @desc    Create a new room and add the creator as participant
// @route   POST /api/rooms/create
// @access  Public
const createRoom = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Please provide a userId' });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Generate unique room code
    let roomCode;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      roomCode = generateRoomCode();
      const existingRoom = await Room.findOne({ roomCode: roomCode.toLowerCase() });
      if (!existingRoom) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({
        success: false,
        error: 'Could not generate a unique room code. Please try again.',
      });
    }

    const room = await Room.create({
      roomCode: roomCode.toLowerCase(),
      participants: [userId],
    });

    res.status(201).json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Error in createRoom:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

// @desc    Join an existing room
// @route   POST /api/rooms/join
// @access  Public
const joinRoom = async (req, res) => {
  try {
    const { roomCode, userId } = req.body;
    if (!roomCode || !userId) {
      return res.status(400).json({ success: false, error: 'Please provide both roomCode and userId' });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Find room by code (normalized to lowercase)
    const room = await Room.findOne({ roomCode: roomCode.toLowerCase() });
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }

    // Check if user is already a participant
    if (room.participants.includes(userId)) {
      return res.status(200).json({
        success: true,
        message: 'User is already in this room',
        data: room,
      });
    }

    // Check if room is full
    if (room.participants.length >= 2) {
      return res.status(400).json({
        success: false,
        error: 'Room is already full (maximum 2 participants allowed)',
      });
    }

    // Add user as participant
    room.participants.push(userId);
    await room.save();

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Error in joinRoom:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

// @desc    Get all tasks for a specific room
// @route   GET /api/rooms/:roomId/tasks
// @access  Public
const getRoomTasks = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }

    const tasks = await Task.find({ roomId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

// @desc    Get room details by room code
// @route   GET /api/rooms/code/:roomCode
// @access  Public
const getRoomByCode = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const room = await Room.findOne({ roomCode: roomCode.toLowerCase() }).populate('participants', 'username');
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

// @desc    Get all activity logs for a room
// @route   GET /api/rooms/:roomId/activity
// @access  Public
const getRoomActivity = async (req, res) => {
  try {
    const { roomId } = req.params;
    const logs = await ActivityLog.find({ roomId });
    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

module.exports = {
  createRoom,
  joinRoom,
  getRoomTasks,
  getRoomByCode,
  getRoomActivity,
};
