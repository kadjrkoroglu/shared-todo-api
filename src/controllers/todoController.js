const prisma = require('../prisma');
const { isListMember } = require('../utils/access');

const parseIds = (req) => ({
    listId: parseInt(req.params.listId),
    todoId: req.params.id === undefined ? undefined : parseInt(req.params.id),
});

const createTodo = async (req, res) => {
    const { title } = req.body;
    const { listId } = parseIds(req);

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        if (!(await isListMember(listId, req.userId))) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const todo = await prisma.todos.create({
            data: { title, list_id: listId, created_by: req.userId },
        });

        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create todo' });
    }
};

const getTodos = async (req, res) => {
    const { listId } = parseIds(req);

    try {
        if (!(await isListMember(listId, req.userId))) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const todos = await prisma.todos.findMany({
            where: { list_id: listId },
            orderBy: { created_at: 'desc' },
        });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
};

const updateTodo = async (req, res) => {
    const { listId, todoId } = parseIds(req);
    const { is_completed, title } = req.body;

    try {
        if (!(await isListMember(listId, req.userId))) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const existing = await prisma.todos.findFirst({ where: { id: todoId, list_id: listId } });
        if (!existing) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        const todo = await prisma.todos.update({
            where: { id: todoId },
            data: {
                ...(is_completed !== undefined && { is_completed }),
                ...(title !== undefined && { title }),
            },
        });

        res.json(todo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update todo' });
    }
};

const deleteTodo = async (req, res) => {
    const { listId, todoId } = parseIds(req);

    try {
        if (!(await isListMember(listId, req.userId))) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const result = await prisma.todos.deleteMany({ where: { id: todoId, list_id: listId } });
        if (result.count === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        res.json({ message: 'Todo deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete todo' });
    }
};

module.exports = { createTodo, getTodos, updateTodo, deleteTodo };
