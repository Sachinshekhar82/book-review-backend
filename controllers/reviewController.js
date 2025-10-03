const Review = require('../models/Review');
const Book = require('../models/Book');

// Helper function to update book average rating
const updateBookRating = async (bookId) => {
  const reviews = await Review.find({ bookId });
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;
  
  await Book.findByIdAndUpdate(bookId, {
    averageRating: parseFloat(averageRating.toFixed(1)),
    reviewCount: reviews.length
  });
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ bookId: req.params.bookId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      count: reviews.length, 
      data: reviews 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { bookId, rating, reviewText } = req.body;
    
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ 
        success: false, 
        message: 'Book not found' 
      });
    }

    const existingReview = await Review.findOne({ 
      bookId, 
      userId: req.user.id 
    });
    
    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this book' 
      });
    }

    const review = await Review.create({
      bookId,
      rating,
      reviewText,
      userId: req.user.id
    });

    await updateBookRating(bookId);

    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name email');
    
    res.status(201).json({ 
      success: true, 
      data: populatedReview 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this review' 
      });
    }

    review = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    await updateBookRating(review.bookId);

    res.status(200).json({ 
      success: true, 
      data: review 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this review' 
      });
    }

    const bookId = review.bookId;
    await review.deleteOne();
    await updateBookRating(bookId);

    res.status(200).json({ 
      success: true, 
      message: 'Review deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.id })
      .populate('bookId', 'title author')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      count: reviews.length, 
      data: reviews 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
