const logger = require('../ws_server/config/winston');
const queris = require('../ws_server/db/queris');
const db = require('../ws_server/db/db');

module.exports = class UserManager {
    constructor() {
        this.activeUsers = new Map();
    }

    getUser = (login) => {
        return this.activeUsers.get(login);
    }

    getActiveUsers = () => {
        return this.activeUsers;
    }

    setUser = (login, user) => {
        this.activeUsers.set(login, user);
    }

    checkUserInActive = (login) => {
        return this.activeUsers.has(login);
    }

    sendActiveUsersForAll = () => {
        const array = Array.from(this.activeUsers.keys());
        const listActive = array.join(', ');
        const message = {
            type: 'updateActiveUsersList',
            body: listActive
        }
        for (const [login, user] of this.activeUsers) {
            const connections = user.getConnections();
            for (const [socket, chat] of connections) {
                socket.send(JSON.stringify(message));
                logger.info('Send "updateActiveUsersList" to %s', login);
            }
        }
    }

    sendMessageForAllActive = (message) => {
        for (const [login, user] of this.activeUsers) {
            const sockets = user.getConnections();
            for (const socket of sockets) {
                socket.send(JSON.stringify(message));
            }
        }
    }

    getChatLabelById = async (chatId) => {
        if(chatId === '0000') return 'systemchat';
        
        const connectDB = await db.getConnection();
        const [result] = await connectDB.query(queris.getChatNameById,[chatId]);
        logger.info('M A R I A %s WITH %s', queris.getChatNameById, [chatId]);
        console.log('#################################');
        logger.info(result[0].title);
        return result[0].title;
    }

    getValueFromURL = (param, url) => {
        const params = url.split('&');
        switch (param) {
            case 'login': return params[0].replace('login=', '');
            case 'chat': return params[1].replace('chat=', '');
        }
    }
}