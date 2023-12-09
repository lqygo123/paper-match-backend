const express = require('express');
const router = express.Router();

router.use('/file', require('./file'));
router.use('/duplicate', require('./duplicate'));
router.use('/user', require('./user'));

module.exports = router;
