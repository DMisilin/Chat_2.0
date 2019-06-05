const queris = require('../db/queris');
const db = require('../db/db');
const logger = require('../config/logger');

module.exports = async ({ data, socket, usersList, user }) => {
    const message = {
        type: 'Invite',
        from: data.from,
        to: data.to,
        chat: data.chat
    }
    const sockets = usersList.get(data.to);
    for (const [socket, chat] of sockets) {
        socket.send(JSON.stringify(message));
        logger.info('Sended invite fo user "%s"', data.to);
    }
}