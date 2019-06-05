const queris = require('../db/queris');
const db = require('../db/db');
const logger = require('../config/logger');

module.exports = async ({ messageParsed, socket, userManager, user }) => {
    const connectDB = await db.getConnection();
    const message = {
        type: 'messageOk',
        chat_id: messageParsed.chat_id,
        body: messageParsed.text
    }

    logger.info('message %s', message);

    const [result] = await connectDB.query(queris.getUsersOfChat, [messageParsed.chat_id]);
    logger.info('M A R I A %s WITH %s', queris.getUsersOfChat, [messageParsed.chat_id]);

    result.forEach((item) => {
        if (userManager.checkActivity(item.user)) { //если юзер есть в списке активных пользователей
            const addressees = userManager.getUser(item.user);
            const sockets = addressees.getConnections();
            for (const [socket, chat_id] of sockets) {
                if (chat_id === messageParsed.chat_id) {
                    socket.send(JSON.stringify(message));
                    logger.info('Send UserMessage:: %s', message);
                }
            }
        }
    });

    await connectDB.query(queris.setHistoryRow, [messageParsed.chat_id, messageParsed.text, messageParsed.from]);
    logger.info('M A R I A %s WITH %s', queris.setHistoryRow, [messageParsed.chat_id, messageParsed.text, messageParsed.from]);
}
