const express = require('express');
const router = express.Router();
const {
  createBook,
  getAllBooks,
  getBook,
  updateBook,
  deleteBook,
  getNearbyBooks,
  getMyBooks,
} = require('../controllers/bookController');
const { protect } = require('../middlewares/auth');

// IMPORTANT: /nearby must come BEFORE /:id or Express will treat "nearby" as an id
router.get('/nearby', protect, getNearbyBooks);
router.get('/my', protect, getMyBooks);

router.route('/')
  .get(getAllBooks)
  .post(protect, createBook);

router.route('/:id')
  .get(getBook)
  .put(protect, updateBook)
  .delete(protect, deleteBook);

module.exports = router;
