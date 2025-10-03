const Book = require('../models/Book');
const Review = require('../models/Review');

exports.getBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const { search, genre, sort } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    if (genre && genre !== '') {
      query.genre = genre;
    }

    let sortOption = {};
    if (sort === 'year') sortOption = { publishedYear: -1 };
    else if (sort === 'rating') sortOption = { averageRating: -1 };
    else sortOption = { createdAt: -1 };

    const books = await Book.find(query)
      .populate('addedBy', 'name email')
      .sort(sortOption)
      .limit(limit)
      .skip(skip);

    const total = await Book.countDocuments(query);

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: books
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('addedBy', 'name email');
    
    if (!book) {
      return res.status(404).json({ 
        success: false, 
        message: 'Book not found' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: book 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.createBook = async (req, res) => {
  try {
    const { title, author, description, genre, publishedYear } = req.body;
    
    const book = await Book.create({
      title,
      author,
      description,
      genre,
      publishedYear,
      addedBy: req.user.id
    });
    
    res.status(201).json({ 
      success: true, 
      data: book 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.updateBook = async (req, res) => {
  try {
    let book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ 
        success: false, 
        message: 'Book not found' 
      });
    }

    if (book.addedBy.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this book' 
      });
    }

    book = await Book.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ 
      success: true, 
      data: book 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ 
        success: false, 
        message: 'Book not found' 
      });
    }

    if (book.addedBy.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this book' 
      });
    }

    await Review.deleteMany({ bookId: req.params.id });
    await book.deleteOne();
    
    res.status(200).json({ 
      success: true, 
      message: 'Book and associated reviews deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getUserBooks = async (req, res) => {
  try {
    const books = await Book.find({ addedBy: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      count: books.length, 
      data: books 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
