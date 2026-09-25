const prisma = require('../prisma');

const listInclude = {
    list_members: {
        include: { users: { select: { id: true, email: true, unique_id: true } } },
    },
};

const formatList = (list) => ({
    id: list.id,
    name: list.name,
    ownerId: list.owner_id,
    isPersonal: list.is_personal,
    createdAt: list.created_at,
    members: list.list_members.map((m) => ({
        id: m.users.id,
        email: m.users.email,
        uniqueId: m.users.unique_id,
    })),
});

const createList = async (req, res) => {
    const { name, friendUniqueId } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'List name is required' });
    }

    try {
        const members = [{ user_id: req.userId }];

        if (friendUniqueId) {
            const friend = await prisma.users.findUnique({
                where: { unique_id: String(friendUniqueId).toUpperCase() },
            });

            if (!friend) {
                return res.status(404).json({ error: 'Friend not found' });
            }
            if (friend.id === req.userId) {
                return res.status(400).json({ error: 'You cannot share a list with yourself' });
            }

            members.push({ user_id: friend.id });
        }

        const list = await prisma.lists.create({
            data: {
                name,
                owner_id: req.userId,
                list_members: { create: members },
            },
            include: listInclude,
        });

        res.status(201).json(formatList(list));
    } catch (error) {
        res.status(500).json({ error: 'Failed to create list' });
    }
};

const getLists = async (req, res) => {
    try {
        const lists = await prisma.lists.findMany({
            where: {
                is_personal: false,
                list_members: { some: { user_id: req.userId } },
            },
            include: listInclude,
            orderBy: { created_at: 'desc' },
        });

        res.json(lists.map(formatList));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch lists' });
    }
};

const getPersonalList = async (req, res) => {
    try {
        let list = await prisma.lists.findFirst({
            where: { owner_id: req.userId, is_personal: true },
            include: listInclude,
        });

        if (!list) {
            list = await prisma.lists.create({
                data: {
                    name: 'Personal',
                    owner_id: req.userId,
                    is_personal: true,
                    list_members: { create: { user_id: req.userId } },
                },
                include: listInclude,
            });
        }

        res.json(formatList(list));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch personal list' });
    }
};

const deleteList = async (req, res) => {
    const listId = parseInt(req.params.id);

    if (Number.isNaN(listId)) {
        return res.status(400).json({ error: 'Invalid list id' });
    }

    try {
        const list = await prisma.lists.findUnique({ where: { id: listId } });

        if (!list || list.owner_id !== req.userId || list.is_personal) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await prisma.$transaction([
            prisma.todos.deleteMany({ where: { list_id: listId } }),
            prisma.list_members.deleteMany({ where: { list_id: listId } }),
            prisma.lists.delete({ where: { id: listId } }),
        ]);

        res.json({ message: 'List deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete list' });
    }
};

module.exports = { createList, getLists, getPersonalList, deleteList };
