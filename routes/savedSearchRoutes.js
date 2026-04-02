const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getSavedSearches,
  createSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
  checkMatches,
} = require('../controllers/savedSearchController');

router.get('/', protect, getSavedSearches);
router.post('/', protect, createSavedSearch);
router.patch('/:id', protect, updateSavedSearch);
router.delete('/:id', protect, deleteSavedSearch);
router.post('/check-matches', protect, checkMatches);

module.exports = router;
