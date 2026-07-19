const express = require('express');
const router = express.Router();
const {
  getDailyPrompt,
  createEntry,
  getEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
  importEntries,
  getTemplates,
  shareEntry,
  revokeShare,
  getSharedEntry,
  getAiReflection,
  sendDigestNow,
} = require('../controllers/journalController');
const { protect } = require('../middleware/auth');

// Public route - no auth - must come before the protect middleware below
router.get('/shared/:token', getSharedEntry);

router.use(protect); // everything past this point requires login

router.get('/prompt', getDailyPrompt);
router.get('/templates', getTemplates);
router.post('/import', importEntries);
router.post('/digest/send-now', sendDigestNow);
router.route('/').post(createEntry).get(getEntries);
router.route('/:id').get(getEntryById).put(updateEntry).delete(deleteEntry);
router.post('/:id/share', shareEntry);
router.delete('/:id/share', revokeShare);
router.post('/:id/reflect', getAiReflection);

module.exports = router;
