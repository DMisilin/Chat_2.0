const queris = require('../db/queris');
const db = require('../db/db');
const logger = require('../config/logger');

module.exports = async ({ data, socket, usersList, user }) => {
    const message = {
        type: 'default',
        from: data.from,
        to: data.to,
        chat: data.chat
    }
    const connectDB = await db.getConnection();
    
    if (data.result === 1) {
        await connectDB.query(queris.createOrUpdateChat, [data.to, data.chat]);
        logger.info('M A R I A %s WITH %s', queris.createOrUpdateChat, [data.to, data.chat]);
    } else if (data.result === 2) {
        message.type = 'RejectInvate';
    }
    
    if (message.type === 'RejectInvate') {
        const sockets = usersList.get(data.from);
        for (const [socket, chat] of sockets) {
            socket.send(JSON.stringify(message));
        }
        logger.info('Sended reject to "%s" from "%s"', data.from, data.to);
    }
}