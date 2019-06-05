const queris = require('../db/queris');
const db = require('../db/db');
const logger = require('../config/winston');

module.exports = async ({ messageParsed, socket, usersList, user }) => {
    const connectDB = await db.getConnection();
    const [result] = await connectDB.query(queris.getChatsOfUser, [messageParsed.login]);
    logger.info('MatiaDB %s WITH %s', queris.getChatsOfUser, [messageParsed.login]);
    const chatList = [];

    result.forEach((item) => {
        chatList.push(item.title);
    });
    logger.info('Active chat for "%s" - "%s"', messageParsed.login, chatList);

    const message = {
        type: 'getActiveChats',
        login: messageParsed.login,
        chats: chatList
    }
    socket.send(JSON.stringify(message));
    logger.info('Sended message: %s', JSON.stringify(message));
}
