const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Title is required'], 
    trim: true 
  },
  author: { 
    type: String, 
    required: [true, 'Author is required'], 
    trim: true 
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'] 
  },
  genre: { 
    type: String, 
    required: [true, 'Genre is required'],
    enum: ['Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 'Biography', 'Fantasy', 'Romance', 'Thriller', 'Other']
  },
  publishedYear: { 
    type: Number, 
    required: [true, 'Published year is required'],
    min: 1000,
    max: new Date().getFullYear()
  },
  addedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  averageRating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
