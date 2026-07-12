const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    count: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Index to ensure uniqueness per user per room per day
ActivityLogSchema.index({ roomId: 1, userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
