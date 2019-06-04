const logger = require('../ws_server/config/winston');

module.exports = class User {
    constructor({ login, chatLabel, chatId, socket }) {
        this.login = login;
        this.chat = {
            id: chatId,
            label: chatLabel
        }
        this.connections = new Map();
        this.connections.set(socket, chatId);
    }

    getLogin = () => {
        return this.login;
    }

    getChatLabel = () => {
        return this.chat.label;
    }

    getChatId = () => {
        return this.chat.id;
    }

    getConnections = () => {
        return this.connections;
    }

    setChatLabel = (chatLabel) => {
        this.chat.label = chatLabel;
    }

    setChatId = (chatId) => {
        this.chat.id = chatId;
    }

    setConnection = (socket, chatId) => {
        this.connections.set(socket, chatId);
    }

    deleteConnect = (socket) => {
        this.connections.delete(socket);
    }

    sendMessageFromChat = (message, _chatId) => {
        for (const [socket, chatId] of this.connections) {
            if (_chatId === chatId) {
                socket.send(JSON.stringify(message));
                logger.info('SEND message "%s" for user "%s"', message, this.login);
            }
        }
    }

    sendInfoMessage = (message) => {
        for (const [socket, chatId] of this.connections) {
            socket.send(JSON.stringify(message));
            logger.info('SEND INFO_message "%s" for user "%s"', message, this.login);
        }
    }

}
