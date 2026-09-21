const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { createList, getLists, deleteList } = require('../controllers/listController');

router.use(authMiddleware);

router.post('/', createList);
router.get('/', getLists);
router.delete('/:id', deleteList);

module.exports = router;