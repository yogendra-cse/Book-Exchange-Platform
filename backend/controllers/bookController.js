const Book = require('../models/Book');
const User = require('../models/User');

// @desc   Create a book listing
// @route  POST /api/books
// @access Private
const createBook = async (req, res) => {
  try {
    const { title, author, condition, description, images } = req.body;

    // Fetch current user to copy their location
    const user = await User.findById(req.user._id);
    if (!user.location || !user.location.coordinates || user.location.coordinates.every(c => c === 0)) {
      return res.status(400).json({ success: false, message: 'Please update your location before listing a book' });
    }

    const book = await Book.create({
      title,
      author,
      condition,
      description,
      images,
      owner: req.user._id,
      location: user.location,
      tradeStatus: 'none',
    });

    res.status(201).json({ success: true, book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all available books
// @route  GET /api/books
// @access Public
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({ isAvailable: true })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: books.length, books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get current user's books
// @route  GET /api/books/my
// @access Private
const getMyBooks = async (req, res) => {
  try {
    const books = await Book.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: books.length, books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get single book
// @route  GET /api/books/:id
// @access Public
const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('owner', 'name email');
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.json({ success: true, book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update a book (owner only)
// @route  PUT /api/books/:id
// @access Private
const updateBook = async (req, res) => {
  try {
    let book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this book' });
    }

    if (book.tradeStatus !== 'none') {
      return res.status(400).json({ success: false, message: 'Cannot edit book because it is involved in a trade' });
    }

    const { title, author, condition, description, images } = req.body;
    book = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, condition, description, images },
      { new: true, runValidators: true }
    );

    res.json({ success: true, book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete a book (owner only)
// @route  DELETE /api/books/:id
// @access Private
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this book' });
    }

    if (book.tradeStatus !== 'none') {
      return res.status(400).json({ success: false, message: 'Cannot delete book because it is involved in a trade' });
    }

    await book.deleteOne();
    res.json({ success: true, message: 'Book removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get nearby books within 5km
// @route  GET /api/books/nearby?lat=&lng=
// @access Public
const getNearbyBooks = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'lat and lng query params are required' });
    }

    const books = await Book.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          distanceField: 'distance', // meters
          maxDistance: 5000, // 5km
          query: { 
            isAvailable: true, 
            owner: { $ne: req.user._id } 
          },
          spherical: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner',
        },
      },
      { $unwind: '$owner' },
      {
        $project: {
          'owner.password': 0,
          'owner.location': 0,
          'owner.__v': 0,
        },
      },
    ]);

    res.json({ success: true, count: books.length, books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createBook, getAllBooks, getBook, updateBook, deleteBook, getNearbyBooks, getMyBooks };
