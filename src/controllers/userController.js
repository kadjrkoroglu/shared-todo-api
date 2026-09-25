const prisma = require('../prisma');

const lookupByUniqueId = async (req, res) => {
    const uniqueId = req.params.uniqueId.toUpperCase();

    try {
        const user = await prisma.users.findUnique({ where: { unique_id: uniqueId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ id: user.id, email: user.email, uniqueId: user.unique_id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to look up user' });
    }
};

module.exports = { lookupByUniqueId };
