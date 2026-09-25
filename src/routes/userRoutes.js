const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { lookupByUniqueId } = require('../controllers/userController');

router.use(authMiddleware);

router.get('/lookup/:uniqueId', lookupByUniqueId);

module.exports = router;
