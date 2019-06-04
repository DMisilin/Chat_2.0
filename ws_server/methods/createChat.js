const queris = require('../db/queris');
const db = require('../../ws_server/db/db');
const logger = require('../../ws_server/config/winston');
const functions = require('../functions');

module.exports = async ({ messageParsed, socket, usersList, user }) => {
    const loginUser = user.getLogin();
    const connectDB = await db.getConnection();
    console.log('VVVVVVVVVVVV');
    console.log(messageParsed.creator);
    console.log(loginUser);
    await connectDB.query(queris.createOrUpdateChat, [messageParsed.creator, messageParsed.chatLabel]);
    const [idNewChat] = await connectDB.query(queris.getLastIdChat);
    const chatId = idNewChat[0].ID;
    console.log(chatId);

    const [result] = await connectDB.query(queris.getChatsOfUser, [messageParsed.login]);
    logger.info('M A R I A %s WITH %s', queris.getChatsOfUser, [messageParsed.login]);

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
    const creator = user;
    const sockets = creator.getConnections();
    for (const [socket, chat] of sockets) {

        socket.send(JSON.stringify(message));
        logger.info('Send message "getActiveChats" %s', message);

    }
}