const queris = require('../db/queris');
const db = require('../../ws_server/db/db');
const logger = require('../../ws_server/config/winston');

module.exports = async ({ data, socket, usersList, user }) => {
    const connectDB = await db.getConnection();
    message = {
        type: 'messageOk',
        chat: data.chat,
        body: data.text
    }
    logger.info('message %s', message);

    const [result] = await connectDB.query(queris.getUsersOfChat, [data.chat]);
    logger.info('M A R I A %s WITH %s', queris.getUsersOfChat, [data.chat]);
    result.forEach((item) => {
        if (usersList.has(item.user)) { //если юзер есть в списке активных пользователей
            const sockets = usersList.get(item.user);
            for (const [socket, chat] of sockets) {
                if (chat === data.chat) {
                    socket.send(JSON.stringify(message));
                    logger.info('Send message %s', message);
                }
            }
        }
    });
    await connectDB.query(queris.setHistoryRow, [data.chat, data.text, data.from]);
    logger.info('M A R I A %s WITH %s', queris.setHistoryRow, [data.chat, data.text, data.from]);
}
