const webSocket = require('ws');
const http = require('http');
const db = require('../app/db/db');
const queris = require('../app/db/queris');
const logger = require('../app/config/winston');
const registration = require('./methods/registration');
const authorization = require('./methods/authorization');
const functions = require('./methods/functions');
const getHistory = require('./methods/getHistory');
const getActiveChats = require('./methods/getActiveChats');
const responceToInvite = require('./methods/responceToInvite');

const log = new logger();
const httpServer = http.createServer();
const socketServer = new webSocket.Server({ noServer: true });
const port = 40509;
const usersList = new Map();

const getActiveUsers = () => {
    const array = Array.from(usersList.keys());
    const listActive = array.join(', ');
    const message = {
        type: 'apdateActiveUsersList',
        body: listActive
    }
    socketServer.clients.forEach(each = (client) => {
        client.send(JSON.stringify(message));
    })
}
const updateUsersList = (login, chat, webSocket) => {
    const connect = new Map();
    connect.set(webSocket, chat);
    usersList.has(login) ? usersList.get(login).set(webSocket, chat) : usersList.set(login, connect);
}

httpServer.on('upgrade', (request, socket, head) => {
    socketServer.handleUpgrade(request, socket, head, (socket) => {
        const userParams = request.url.replace('/pages/chat.html?', '');
        const login = functions.getValueFromURL('login', userParams);
        const chat = functions.getValueFromURL('chat', userParams);
        const user = { socket, login, chat };
        updateUsersList(login, chat, socket);

        log.log('info', 'In "UsersList" added user - %s with chat "%s"', login, chat);
        socketServer.emit('connection', socket, user);
    });
});

socketServer.on('connection', (socket, user) => {
    getActiveUsers();

    socket.on('message', async (message) => {
        log.log('info', 'Received message:: %s', message);
        const login = user.login;
        const messageParsed = JSON.parse(message);
        log.log('info', 'messageParsed: %s', JSON.parse(message));
        const chat = messageParsed.chat;
        const connectDB = await db.getConnection();

        switch (messageParsed.type) {
            case 'registration': {
                const responceRegistration = await registration(messageParsed);
                socket.send(JSON.stringify(responceRegistration));
                log.log('info', 'responceRegistration: %s', responceRegistration);
                break;
            };
            case 'authorization': {
                const responceAuthorization = await authorization(messageParsed);
                socket.send(JSON.stringify(responceAuthorization));
                log.log('info', 'responceAuthorization: %s', responceAuthorization);
                break;
            };
            case 'userMessage': {
                message = {
                    type: 'messageOk',
                    chat: chat,
                    body: messageParsed.text
                }
                const [result] = await connectDB.query(queris.getUsersOfChat, [chat]);
                log.log('info', 'MatiaDB %s WITH %s', queris.getUsersOfChat, [chat]);
                result.forEach((item) => {
                    if (usersList.has(item.user)) { //если юзер есть в списке активных пользователей
                        const sockets = usersList.get(item.user);
                        for (const [socket, chat] of sockets) {
                            if (chat === messageParsed.chat) {
                                socket.send(JSON.stringify(message));
                                log.log('info', 'Send message %s', message);
                            }
                        }
                    }
                });
                await connectDB.query(queris.setHistoryRow, [chat, messageParsed.text, messageParsed.from]);
                log.log('info', 'MatiaDB %s WITH %s', queris.setHistoryRow, [chat, messageParsed.text, messageParsed.from]);
            }
            case 'getHistory': {
                updateUsersList(messageParsed.login, messageParsed.chat, socket);
                log.log('info', 'UsersList %s', usersList.keys());
                const historyPool = await getHistory(messageParsed.chat);
                socket.send(JSON.stringify(historyPool));
                break;
            }
            case 'createChat': {
                await connectDB.query(queris.createOrUpdateChat, [login, chat]);
                console.log(queris.createOrUpdateChat, [login, chat]); //SQL LOG
                break;
            }
            case 'getActiveChats': {
                const message = await getActiveChats(login);
                socket.send(JSON.stringify(message));
                break;
            }
            case 'inviteUser': {
                const message = {
                    type: 'Invite',
                    from: messageParsed.from,
                    to: messageParsed.to,
                    chat: chat
                }
                const sockets = usersList.get(messageParsed.to);
                for (const [socket, chat] of sockets) {
                    socket.send(JSON.stringify(message));
                    log.log('info', 'Sended invite fo user "%s"', messageParsed.to);
                }
                break;
            }
            case 'responceToInvite': {
                const message = await responceToInvite(messageParsed);
                if (message.type === 'RejectInvate') {
                    const sockets = usersList.get(messageParsed.from);
                    for (const [socket, chat] of sockets) {
                        socket.send(JSON.stringify(message));
                    }
                    log.log('info', 'Sended reject to "%s" from "%s"', messageParsed.from, messageParsed.to);
                }
                break;
            }
            default: {
                log.log('info', 'Прилетело что-то неопознаваемое: %s', message);
                break;
            }
        }
    });

    socket.on('close', () => {
        const leaveUserSockets = usersList.get(user.login);
        if (leaveUserSockets.size > 1) {
            usersList.get(user.login).delete(socket);
            log.log('info', 'Socket for user "%s" deleted', user.login);
        } else {
            usersList.delete(user.login);
            log.log('info', 'User "%s" deleted from UsersList', user.login);
        }
        log.log('info', 'UsersList was update: %s', usersList);
        getActiveUsers();
    });
});

httpServer.listen(port, () => log.log('info', 'Server started and liastning %s port!', port));
