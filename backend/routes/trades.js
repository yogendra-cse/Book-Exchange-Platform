const express = require('express');
const router = express.Router();
const {
  sendTradeRequest,
  acceptTradeRequest,
  rejectTradeRequest,
  getMyTrades,
} = require('../controllers/tradeController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.route('/').get(getMyTrades).post(sendTradeRequest);
router.put('/:id/accept', acceptTradeRequest);
router.put('/:id/reject', rejectTradeRequest);

module.exports = router;
