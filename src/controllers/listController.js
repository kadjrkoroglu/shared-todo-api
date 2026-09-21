const prisma = require('../prisma');

const createList = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'List name is required' });
    }

    try {
        const list = await prisma.lists.create({
            data: {
                name,
                owner_id: req.userId,
                list_members: {
                    create: { user_id: req.userId },
                },
            },
        });

        res.status(201).json(list);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create list', details: error.message });
    }
};

const getLists = async (req, res) => {
    try {
        const lists = await prisma.lists.findMany({
            where: {
                list_members: {
                    some: { user_id: req.userId },
                },
            },
        });

        res.json(lists);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch lists', details: error.message });
    }
};

const deleteList = async (req, res) => {
    const listId = parseInt(req.params.id);

    try {
        const list = await prisma.lists.findUnique({ where: { id: listId } });

        if (!list || list.owner_id !== req.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await prisma.list_members.deleteMany({ where: { list_id: listId } });
        await prisma.lists.delete({ where: { id: listId } });

        res.json({ message: 'List deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete list', details: error.message });
    }
};

module.exports = { createList, getLists, deleteList };