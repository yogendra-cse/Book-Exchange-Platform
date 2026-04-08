const User = require('../models/User');

// @desc   Update current user's location
// @route  PUT /api/users/location
// @access Private
const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'latitude and longitude are required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        location: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
      },
      { new: true }
    );

    res.json({ success: true, message: 'Location updated', location: user.location });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Find nearby users within 5km
// @route  GET /api/users/nearby?lat=&lng=
// @access Private
//
// How $near works:
// MongoDB's $near operator requires a 2dsphere index and sorts results by proximity.
// $maxDistance is in METERS — 5000m = 5km.
// MongoDB returns only users whose location.coordinates fall within that radius,
// and sorts them from nearest to farthest automatically.
const getNearbyUsers = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'lat and lng query params are required' });
    }

    const users = await User.find({
      _id: { $ne: req.user._id }, // exclude self
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: 5000, // 5km in meters
        },
      },
    }).select('name email location');

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { updateLocation, getNearbyUsers };
