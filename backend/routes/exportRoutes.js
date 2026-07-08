const express = require('express');
const router = express.Router();
const { exportJson, exportPdf } = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/json', exportJson);
router.get('/pdf', exportPdf);

module.exports = router;
