const logger = require('../app/config/winston');
const queris = require('../app/db/queris');
const db = require('../app/db/db');

module.exports.getValueFromURL = (param, url) => {
    const params = url.split('&');
    switch (param) {
        case 'login': return params[0].replace('login=', '');
        case 'chat': return params[1].replace('chat=', '');
    }
}

module.exports.updateUsersList = ({ data, socket, usersList }) => {
    const list = usersList;
    const connect = new Map();
    connect.set(socket, data.chat);
    logger.info('Create mew Connect: %s fro User - "%s" and Chat - "%s"', connect, data.login, data.chat);
    list.has(data.login) ? list.get(data.login).set(socket, data.chat) : list.set(data.login, connect);
    logger.info('Update UsersList --> %s', list);
    return list;
}

module.exports.getChatNameById = async (chatId) => {
    const connectDB = await db.getConnection();
    const [result] = await connectDB.query(queris.getChatNameById,[chatId]);
    logger.info('M A R I A %s WITH %s', queris.getChatNameById, [chatId]);
    logger.info(result.title);
    return result.title;
}

module.exports.getActiveUsers = async (usersList) => {
    const array = Array.from(usersList.keys());
    const listActive = array.join(', ');
    const message = {
        type: 'apdateActiveUsersList',
        body: listActive
    }
    for (const [login, user] of usersList) {
        const tempUser = user;
        const connections = tempUser.getConnections();
        for (const [socket, chat] of connections) {
            socket.send(JSON.stringify(message));
            logger.info('Send "apdateActiveUsersList" to %s', login);
        }
    }
}
