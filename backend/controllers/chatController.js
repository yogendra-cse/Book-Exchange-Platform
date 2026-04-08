const Message = require('../models/Message');
const Match = require('../models/Match');

// @desc   Get chat history for a match
// @route  GET /api/chat/:matchId
// @access Private
const getChatHistory = async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    const isParticipant = match.users.some((u) => u.toString() === req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this chat' });
    }

    const messages = await Message.find({ matchId: req.params.matchId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getChatHistory };
