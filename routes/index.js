const express = require('express');
const router = express.Router();

router.use('/file', require('./file'));
router.use('/duplicate', require('./duplicate'));

module.exports = router;
