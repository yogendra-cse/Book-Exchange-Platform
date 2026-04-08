const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    condition: {
      type: String,
      enum: ['new', 'good', 'fair', 'poor'],
      required: [true, 'Condition is required'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    images: {
      type: [String],
      default: [],
    },
    tradeStatus: {
      type: String,
      enum: ['none', 'pending', 'accepted', 'completed', 'return-requested', 'returned'],
      default: 'none',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// 2dsphere index for geospatial queries
bookSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Book', bookSchema);
