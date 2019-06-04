const queris = require('../../app/db/queris');
const db = require('../../app/db/db');
const logger = require('../../app/config/winston');

module.exports = async ({ data, socket, usersList, user }) => {
    const connectDB = await db.getConnection();
    const [result] = await connectDB.query(queris.getChatsOfUser, [data.login]);
    logger.info('MatiaDB %s WITH %s', queris.getChatsOfUser, [data.login]);
    const chatList = [];

    result.forEach((item) => {
        chatList.push(item.title);
    });
    logger.info('Active chat for "%s" - "%s"', data.login, chatList);

    const message = {
        type: 'getActiveChats',
        login: data.login,
        chats: chatList
    }
    socket.send(JSON.stringify(message));
    logger.info('Sended message: %s', JSON.stringify(message));
}
