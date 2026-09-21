const express = require('express');
const router = express.Router({ mergeParams: true });
const authMiddleware = require('../middleware/auth');
const { createTodo, getTodos, updateTodo, deleteTodo } = require('../controllers/todoController');

router.use(authMiddleware);

router.post('/', createTodo);
router.get('/', getTodos);
router.patch('/:id', updateTodo);
router.delete('/:id', deleteTodo);

module.exports = router;