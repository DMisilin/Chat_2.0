const queris = require('../../app/db/queris');
const db = require('../../app/db/db');
const logger = require('../../app/config/winston');
const functions = require('../functions');

module.exports = async ({ data, socket, usersList }) => {
    const connectDB = await db.getConnection();
    await connectDB.query(queris.createOrUpdateChat, [data.login, data.chat]);

    const [result] = await connectDB.query(queris.getChatsOfUser, [data.login]);
    logger.info('M A R I A %s WITH %s', queris.getChatsOfUser, [data.login]);
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
    console.log(`USER = ${data.login}`);
    const sockets = usersList.get(data.login);
    for (const [socket, chat] of sockets) {

        socket.send(JSON.stringify(message));
        logger.info('Send message "getActiveChats" %s', message);

    }
}