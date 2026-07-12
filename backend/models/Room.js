const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: [true, 'Please add a room code'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [6, 'Room code must be exactly 6 digits'],
      maxlength: [6, 'Room code must be exactly 6 digits'],
      match: [/^[0-9]+$/, 'Room code must contain only numeric characters'],
    },
    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      validate: [arrayLimit, '{PATH} exceeds the limit of 2 participants'],
      default: [],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

function arrayLimit(val) {
  return val.length <= 2;
}

module.exports = mongoose.model('Room', RoomSchema);
