const express = require('express');
const router = express.Router();
const { getChatHistory } = require('../controllers/chatController');
const { protect } = require('../middlewares/auth');

router.get('/:matchId', protect, getChatHistory);

module.exports = router;
