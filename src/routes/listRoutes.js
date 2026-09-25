const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { createList, getLists, getPersonalList, deleteList } = require('../controllers/listController');

router.use(authMiddleware);

router.post('/', createList);
router.get('/', getLists);
router.get('/personal', getPersonalList);
router.delete('/:id', deleteList);

module.exports = router;
