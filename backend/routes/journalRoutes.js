const express = require('express');
const router = express.Router();
const {
  getDailyPrompt,
  createEntry,
  getEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
} = require('../controllers/journalController');
const { protect } = require('../middleware/auth');

router.use(protect); // every journal route requires login

router.get('/prompt', getDailyPrompt);
router.route('/').post(createEntry).get(getEntries);
router.route('/:id').get(getEntryById).put(updateEntry).delete(deleteEntry);

module.exports = router;
