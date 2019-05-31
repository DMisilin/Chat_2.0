const webSocket = require('ws');
const http = require('http');
const db = require('../app/db/db');
const queris = require('../app/db/queris');
const logger = require('../app/config/winston');
const functions = require('./methods/functions');

const methods = require('../webserver/methods');
//const registration = require('./methods/registration');
const authorization = require('./methods/authorization');
const getHistory = require('./methods/getHistory');
const getActiveChats = require('./methods/getActiveChats');
const responceToInvite = require('./methods/responceToInvite');

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

        logger.info('In "UsersList" added user - %s with chat "%s"', login, chat);
        socketServer.emit('connection', socket, user);
    });
});

socketServer.on('connection', (socket, user) => {
    getActiveUsers();

    socket.on('message', async (message) => {
        logger.info('Received message:: %s', message);
        const login = user.login;
        const messageParsed = JSON.parse(message);
        logger.info('messageParsed: %s', JSON.parse(message));
        const chat = messageParsed.chat;
        const connectDB = await db.getConnection();

        switch (messageParsed.type) {
            case 'registration': {
                await methods.registration({ data: messageParsed, socket: socket, list: usersList, login: login });

                // const responceRegistration = await registration(messageParsed);
                // socket.send(JSON.stringify(responceRegistration));
                // logger.info('responceRegistration: %s', responceRegistration);
                break;
            };
            case 'authorization': {
                const responceAuthorization = await authorization(messageParsed);
                socket.send(JSON.stringify(responceAuthorization));
                logger.info('responceAuthorization: %s', responceAuthorization);
                break;
            };
            case 'userMessage': {
                message = {
                    type: 'messageOk',
                    chat: chat,
                    body: messageParsed.text
                }
                const [result] = await connectDB.query(queris.getUsersOfChat, [chat]);
                logger.info('MatiaDB %s WITH %s', queris.getUsersOfChat, [chat]);
                result.forEach((item) => {
                    if (usersList.has(item.user)) { //если юзер есть в списке активных пользователей
                        const sockets = usersList.get(item.user);
                        for (const [socket, chat] of sockets) {
                            if (chat === messageParsed.chat) {
                                socket.send(JSON.stringify(message));
                                logger.info('Send message %s', message);
                            }
                        }
                    }
                });
                await connectDB.query(queris.setHistoryRow, [chat, messageParsed.text, messageParsed.from]);
                logger.info('MatiaDB %s WITH %s', queris.setHistoryRow, [chat, messageParsed.text, messageParsed.from]);
            }
            case 'getHistory': {
                updateUsersList(messageParsed.login, messageParsed.chat, socket);
                logger.info('UsersList %s', usersList.keys());
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
                    logger.info('Sended invite fo user "%s"', messageParsed.to);
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
                    logger.info('Sended reject to "%s" from "%s"', messageParsed.from, messageParsed.to);
                }
                break;
            }
            default: {
                logger.info('Прилетело что-то неопознаваемое: %s', message);
                break;
            }
        }
    });

    socket.on('close', () => {
        const leaveUserSockets = usersList.get(user.login);
        if (leaveUserSockets.size > 1) {
            usersList.get(user.login).delete(socket);
            logger.info('Socket for user "%s" deleted', user.login);
        } else {
            usersList.delete(user.login);
            logger.info('User "%s" deleted from UsersList', user.login);
        }
        logger.info('UsersList was update: %s', usersList);
        getActiveUsers();
    });
});

httpServer.listen(port, () => logger.info('Server started and liastning %s port!', port));
