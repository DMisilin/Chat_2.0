const queris = require('../db/queris');
const db = require('../db/db');
const logger = require('../config/winston');

module.exports = async ({ messageParsed, socket, usersList, user }) => {
    const loginUser = user.getLogin();
    const connectDB = await db.getConnection();

    await connectDB.query(queris.createOrUpdateChat, [messageParsed.creator, messageParsed.chatLabel]);

    const [idNewChat] = await connectDB.query(queris.getLastIdChat);
    const chatId = idNewChat[0].ID;
    const [result] = await connectDB.query(queris.getChatsOfUser, [loginUser]);
    logger.info('M A R I A %s WITH %s', queris.getChatsOfUser, [loginUser]);
    const chatList = [];

    result.forEach((item) => {
        chatList.push(item.title);
    });

    logger.info('Active chat for "%s" - "%s"', messageParsed.creator, chatList);

    const message = {
        type: 'getActiveChats',
        login: messageParsed.creator,
        chats: chatList,

    }
    const sockets = user.getConnections();
    for (const [socket, chat] of sockets) {

        socket.send(JSON.stringify(message));
        logger.info('Send message "getActiveChats" %s', message);

    }
}