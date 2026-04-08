const express = require('express');
const router = express.Router();
const { getMyMatches, completeMatch, requestReturn, generateOtp, verifyOtp } = require('../controllers/matchController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.get('/', getMyMatches);
router.put('/:id/complete', completeMatch);
router.put('/:id/return', requestReturn);
router.put('/:id/generate-otp', generateOtp);
router.put('/:id/verify-otp', verifyOtp);

module.exports = router;
