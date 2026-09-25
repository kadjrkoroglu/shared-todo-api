const prisma = require('../prisma');

const isListMember = async (listId, userId) => {
    const member = await prisma.list_members.findUnique({
        where: { list_id_user_id: { list_id: listId, user_id: userId } },
    });
    return Boolean(member);
};

module.exports = { isListMember };
