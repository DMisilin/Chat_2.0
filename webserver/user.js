const logger = require('../app/config/winston');

module.exports = class User {
    constructor({login, chat, chatId, socket}) {
        this.login = login;
        this.chat = chat;
        this.chatId = chatId;
        this.connections = new Map();
        this.connections.set(socket, chatId);
    }

    getLogin = () => {
        return this.login;
    }
    getChat = () => {
        return this.chat;
    }
    getChatId = () => {
        return this.chatId;
    }
    getConnections = () => {
        return this.connections;
    }

    setChat = (chat) => {
        this.chat = chat; 
    }
    setChatId = (chatId) => {
        this.chatId = chatId;
    }
    setConnection = (socket, chatId) => {
        this.connections.set(socket, chatId);
    }

    sendMessage = (message, id) => {
        for(const [socket, chatId] of this.connections) {
            if(id === chatId) {
                socket.send(JSON.stringify(message));
                logger.info('SEND message "%s" for user "%s"', message, this.login);
            }
        }
    }

}
