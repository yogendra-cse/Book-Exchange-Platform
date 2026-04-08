const Match = require('../models/Match');
const Book = require('../models/Book');
const TradeRequest = require('../models/TradeRequest');
const crypto = require('crypto');

// Utility function to generate a 6-digit OTP
function generateOtpCode() {
  return crypto.randomInt(100000, 999999).toString();
}

// @desc   Get all matches for current user
// @route  GET /api/matches
// @access Private
const getMyMatches = async (req, res) => {
  try {
    const matches = await Match.find({ users: req.user._id })
      .populate('users', 'name email')
      .populate('books', 'title author condition')
      .sort({ createdAt: -1 });

    // Only show OTP to the user who generated it
    const sanitizedMatches = matches.map(m => {
      const matchObj = m.toObject();
      if (matchObj.otp && matchObj.otpGeneratedBy && matchObj.otpGeneratedBy.toString() !== req.user._id.toString()) {
        delete matchObj.otp;
      }
      return matchObj;
    });

    res.json({ success: true, count: matches.length, matches: sanitizedMatches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Mark a match as completed
// @route  PUT /api/matches/:id/complete
// @access Private
const completeMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    const isParticipant = match.users.some((u) => u.toString() === req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this match' });
    }

    match.status = 'completed';
    await match.save();

    // Update tradeStatus to completed for both books
    await Book.updateMany(
      { _id: { $in: match.books } },
      { tradeStatus: 'completed' }
    );

    res.json({ success: true, message: 'Match marked as completed', match });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Generate OTP for match verification
// @route  PUT /api/matches/:id/generate-otp
// @access Private
const generateOtp = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    const isParticipant = match.users.some((u) => u.toString() === req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this match' });
    }

    match.otp = generateOtpCode();
    match.otpGeneratedAt = new Date();
    match.otpGeneratedBy = req.user._id;
    match.otpVerified = false;

    await match.save();
    res.json({ success: true, message: 'OTP generated', otp: match.otp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Verify OTP to complete trade
// @route  PUT /api/matches/:id/verify-otp
// @access Private
const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    const isParticipant = match.users.some((u) => u.toString() === req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this match' });
    }

    if (!match.otp) return res.status(400).json({ success: false, message: 'OTP not generated yet' });

    // Make sure the other user is the one verifying
    if (match.otpGeneratedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'The other user must enter the OTP' });
    }

    if (match.otp === otp) {
      match.otpVerified = true;
      match.status = 'completed';
      await match.save();

      // Update tradeStatus to completed for both books
      await Book.updateMany(
        { _id: { $in: match.books } },
        { tradeStatus: 'completed' }
      );

      res.json({ success: true, message: 'OTP verified! Trade completed.', match });
    } else {
      res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Request to return books / reverse trade
// @route  PUT /api/matches/:id/return
// @access Private
const requestReturn = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    const isParticipant = match.users.some((u) => u.toString() === req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this match' });
    }

    if (match.status === 'returned') {
      return res.status(400).json({ success: false, message: 'Trade already returned' });
    }

    // Add user to returnRequests if not already there
    const alreadyRequested = match.returnRequests.some(u => u.toString() === req.user._id.toString());
    if (!alreadyRequested) {
      match.returnRequests.push(req.user._id);
      
      // If this is the first person requesting
      if (!match.returnRequested) {
        match.returnRequested = true;
        match.returnRequestedBy = req.user._id;
        match.status = 'return-pending';

        // Update tradeStatus for both books
        await Book.updateMany(
          { _id: { $in: match.books } },
          { tradeStatus: 'return-requested' }
        );
      }
    } else {
      return res.status(400).json({ success: false, message: 'You have already requested a return' });
    }

    // Check if both users have requested return
    if (match.returnRequests.length === 2) {
      match.status = 'returned';
      
      const trade = await TradeRequest.findById(match.tradeRequest);
      if (trade) {
        trade.status = 'returned';
        await trade.save();

        // Restore original ownership and make books available again
        // trade.senderBook original owner was trade.sender
        // trade.receiverBook original owner was trade.receiver
        await Book.findByIdAndUpdate(trade.senderBook, { owner: trade.sender, isAvailable: true, tradeStatus: 'none' });
        await Book.findByIdAndUpdate(trade.receiverBook, { owner: trade.receiver, isAvailable: true, tradeStatus: 'none' });
      }
    }

    await match.save();
    res.json({ 
      success: true, 
      message: match.status === 'returned' ? 'Trade reversed! Books returned to original owners.' : 'Return request submitted', 
      match 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMyMatches, completeMatch, requestReturn, generateOtp, verifyOtp };
