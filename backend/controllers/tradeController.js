const TradeRequest = require('../models/TradeRequest');
const Match = require('../models/Match');
const Book = require('../models/Book');

// @desc   Send a trade request
// @route  POST /api/trades
// @access Private
const sendTradeRequest = async (req, res) => {
  try {
    const { receiverId, senderBookId, receiverBookId } = req.body;

    // Validate books exist and are available
    const [senderBook, receiverBook] = await Promise.all([
      Book.findById(senderBookId),
      Book.findById(receiverBookId),
    ]);

    if (!senderBook || !receiverBook) {
      return res.status(404).json({ success: false, message: 'One or both books not found' });
    }
    if (!senderBook.isAvailable || !receiverBook.isAvailable) {
      return res.status(400).json({ success: false, message: 'One or both books are not available' });
    }
    if (senderBook.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You do not own the sender book' });
    }

    // Prevent duplicate pending requests
    const existing = await TradeRequest.findOne({
      sender: req.user._id,
      receiver: receiverId,
      senderBook: senderBookId,
      receiverBook: receiverBookId,
      status: 'pending',
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Trade request already sent' });
    }

    const trade = await TradeRequest.create({
      sender: req.user._id,
      receiver: receiverId,
      senderBook: senderBookId,
      receiverBook: receiverBookId,
    });

    // Update tradeStatus for both books
    await Book.updateMany(
      { _id: { $in: [senderBookId, receiverBookId] } },
      { tradeStatus: 'pending' }
    );

    res.status(201).json({ success: true, trade });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Accept a trade request → creates Match, marks books unavailable
// @route  PUT /api/trades/:id/accept
// @access Private
const acceptTradeRequest = async (req, res) => {
  try {
    const trade = await TradeRequest.findById(req.params.id);
    if (!trade) return res.status(404).json({ success: false, message: 'Trade request not found' });

    if (trade.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to accept this request' });
    }
    if (trade.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Trade request is no longer pending' });
    }

    // Update trade status
    trade.status = 'accepted';
    await trade.save();

    // mark both books as unavailable and SWAP OWNERS
    // senderBook goes to receiver, receiverBook goes to sender
    await Book.findByIdAndUpdate(trade.senderBook, { owner: trade.receiver, isAvailable: false, tradeStatus: 'accepted' });
    await Book.findByIdAndUpdate(trade.receiverBook, { owner: trade.sender, isAvailable: false, tradeStatus: 'accepted' });

    // Create Match document
    const match = await Match.create({
      users: [trade.sender, trade.receiver],
      books: [trade.senderBook, trade.receiverBook],
      tradeRequest: trade._id,
    });

    res.json({ success: true, message: 'Trade accepted! Match created.', match });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Reject a trade request
// @route  PUT /api/trades/:id/reject
// @access Private
const rejectTradeRequest = async (req, res) => {
  try {
    const trade = await TradeRequest.findById(req.params.id);
    if (!trade) return res.status(404).json({ success: false, message: 'Trade request not found' });

    if (trade.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to reject this request' });
    }
    if (trade.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Trade request is no longer pending' });
    }

    trade.status = 'rejected';
    await trade.save();

    // Reset tradeStatus for both books
    await Book.updateMany(
      { _id: { $in: [trade.senderBook, trade.receiverBook] } },
      { tradeStatus: 'none' }
    );

    res.json({ success: true, message: 'Trade request rejected', trade });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all trade requests (incoming + outgoing) for current user
// @route  GET /api/trades
// @access Private
const getMyTrades = async (req, res) => {
  try {
    const trades = await TradeRequest.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('senderBook', 'title author condition images')
      .populate('receiverBook', 'title author condition images')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: trades.length, trades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendTradeRequest, acceptTradeRequest, rejectTradeRequest, getMyTrades };
