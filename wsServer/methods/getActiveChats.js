const queris = require('../db/queris');
const db = require('../db/db');
const logger = require('../config/logger');

module.exports = async ({ messageParsed, socket, userManager, user }) => {
    const login = user.getLogin();
    const connectDB = await db.getConnection();
    const [result] = await connectDB.query(queris.getChatsOfUser, [login]);
    logger.info('MatiaDB %s WITH %s', queris.getChatsOfUser, [login]);

    const chatList = [];

    result.forEach((item) => {
        const chat = {
            chat_id: item.chat_id,
            chat_label: item.title
        }
        chatList.push(chat);
    });
    
    logger.info('Active chat for "%s" - "%s"', login, chatList);

    const message = {
        type: 'getActiveChats',
        login: login,
        chats: chatList
    }

    socket.send(JSON.stringify(message));
    logger.info('Sended message: %s', JSON.stringify(message));
}
