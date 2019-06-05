const logger = require('./config/winston');
const helper = require('./helper');
const User = require('./user');

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

    deleteUser = (login) => {
        this.activeUsers.delete(login);
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

    sendMessageForAllUsers = (message) => {
        for (const [login, user] of this.activeUsers) {
            const sockets = user.getConnections();

            for (const socket of sockets) {
                socket.send(JSON.stringify(message));
            }
        }
    }

    updateActiveUsers = (url, socket) => {
        const urlParams = url.split('?')[1];
        const login = helper.getValueFromURL('login', urlParams);
        const chatId = helper.getValueFromURL('chat', urlParams);
        let user; 
        
        if (this.activeUsers.has(login)) {
            user = this.activeUsers.get(login);
            user.setConnection(socket, chatId);
        } else {
            const chatLabel = helper.getChatLabelById(chatId);
            user = new User({login, chatLabel, chatId, socket});
            this.activeUsers.set(login, user);            
        }

        return user;
    }
}