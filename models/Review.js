const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  bookId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Book', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: [true, 'Rating is required'], 
    min: 1, 
    max: 5 
  },
  reviewText: { 
    type: String, 
    required: [true, 'Review text is required'], 
    trim: true 
  }
}, { timestamps: true });

// Prevent duplicate reviews from same user on same book
reviewSchema.index({ bookId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
