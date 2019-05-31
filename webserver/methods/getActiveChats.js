const queris = require('../../app/db/queris');
const db = require('../../app/db/db');
const logger = require('../../app/config/winston');

module.exports = async (login) => {
    const connectDB = await db.getConnection();
    const [result] = await connectDB.query(queris.getChatsOfUser, [login]);
    logger.info('MatiaDB %s WITH %s', queris.getChatsOfUser, [login]);
    const chatList = [];

    result.forEach((item) => {
        chatList.push(item.title);
    });
    logger.info('Active chat for "%s" - "%s"', login, chatList);

    const message = {
        type: 'getActiveChats',
        login: login,
        chats: chatList
    }
    return message;
}
