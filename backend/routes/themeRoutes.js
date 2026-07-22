const express = require('express');
const router = express.Router();
const { createTheme, getThemes, applyTheme, deleteTheme, toggleLikeTheme } = require('../controllers/themeController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createTheme);
router.get('/', getThemes);
router.post('/apply', applyTheme);
router.delete('/:themeId', deleteTheme);
router.post('/:themeId/like', toggleLikeTheme);

module.exports = router;