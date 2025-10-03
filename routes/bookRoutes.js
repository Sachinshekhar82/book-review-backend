const express = require('express');
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getUserBooks
} = require('../controllers/bookController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getBooks);
router.get('/user/me', protect, getUserBooks);
router.get('/:id', getBookById);
router.post('/', protect, createBook);
router.put('/:id', protect, updateBook);
router.delete('/:id', protect, deleteBook);

module.exports = router;
