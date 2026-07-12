const express = require('express');
const router = express.Router();
const VisitorCount = require('../models/VisitorCount');

// Increment and get visitor count
router.post('/visit', async (req, res) => {
  try {
    // Find the first document and increment it, or create it if it doesn't exist
    const result = await VisitorCount.findOneAndUpdate(
      {},
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );
    res.json({ success: true, count: result.count });
  } catch (error) {
    console.error('Error updating visitor count:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
