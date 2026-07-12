const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Please associate this application with a room'],
    },
    url: {
      type: String,
      required: [true, 'Please add a URL'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['accepted', 'rejected', 'ongoing'],
      default: 'ongoing',
    },
    tips: {
      type: String,
      default: '',
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Application', ApplicationSchema);
