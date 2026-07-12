const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Please associate this task with a room'],
    },
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true,
    },
    status: {
      type: Map,
      of: Boolean,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', TaskSchema);
