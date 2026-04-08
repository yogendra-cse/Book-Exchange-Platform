const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    books: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
    tradeRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TradeRequest',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'returned', 'return-pending'],
      default: 'active',
    },
    returnRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    returnRequested: {
      type: Boolean,
      default: false,
    },
    returnRequestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    otp: {
      type: String,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    otpGeneratedAt: {
      type: Date,
    },
    otpGeneratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Match', matchSchema);
