const Application = require('../models/Application');
const Room = require('../models/Room');

// @desc    Get all applications for a room
// @route   GET /api/rooms/:roomId/applications
// @access  Public
const getRoomApplications = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }

    const applications = await Application.find({ roomId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

// @desc    Create new application
// @route   POST /api/applications
// @access  Public
const createApplication = async (req, res) => {
  try {
    const { roomId, url, status, tips } = req.body;
    if (!roomId || !url) {
      return res.status(400).json({ success: false, error: 'Please provide roomId and url' });
    }

    const application = await Application.create({
      roomId,
      url,
      status: status || 'ongoing',
      tips: tips || '',
    });

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

// @desc    Update application status or tips
// @route   PUT /api/applications/:id
// @access  Public
const updateApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Public
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
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
  getRoomApplications,
  createApplication,
  updateApplication,
  deleteApplication,
};
