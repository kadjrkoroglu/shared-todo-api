const prisma = require('../prisma');

const createTodo = async (req, res) => {
    const { title } = req.body;
    const listId = parseInt(req.params.listId);

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        const member = await prisma.list_members.findUnique({
            where: { list_id_user_id: { list_id: listId, user_id: req.userId } },
        });

        if (!member) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const todo = await prisma.todos.create({
            data: { title, list_id: listId, created_by: req.userId },
        });

        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create todo', details: error.message });
    }
};

const getTodos = async (req, res) => {
    const listId = parseInt(req.params.listId);

    try {
        const member = await prisma.list_members.findUnique({
            where: { list_id_user_id: { list_id: listId, user_id: req.userId } },
        });

        if (!member) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const todos = await prisma.todos.findMany({ where: { list_id: listId } });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch todos', details: error.message });
    }
};

const updateTodo = async (req, res) => {
    const todoId = parseInt(req.params.id);
    const { is_completed } = req.body;

    try {
        const todo = await prisma.todos.update({
            where: { id: todoId },
            data: { is_completed },
        });

        res.json(todo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update todo', details: error.message });
    }
};

const deleteTodo = async (req, res) => {
    const todoId = parseInt(req.params.id);

    try {
        await prisma.todos.delete({ where: { id: todoId } });
        res.json({ message: 'Todo deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete todo', details: error.message });
    }
};

module.exports = { createTodo, getTodos, updateTodo, deleteTodo };