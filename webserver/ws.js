const webSocket = require('ws');
const http = require('http');
const db = require('../myapp/db/db');
const queris = require('../myapp/db/queris');

const httpServer = http.createServer();                        //server
const socketServer = new webSocket.Server({ noServer: true }); //wss1
const usersList = new Map();

const getValueFromURL = (param, url) => {
    const params = url.split('&');
    switch (param) {
        case 'login': return params[0].replace('login=', '');
        case 'chat': return params[1].replace('chat=', '');
    }
}
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
        const login = getValueFromURL('login', userParams);
        const chat = getValueFromURL('chat', userParams);
        const user = { socket, login, chat };
        updateUsersList(login, chat, socket);
        console.log(`insert ot update Map.UserList`);
        console.log(usersList);
        socketServer.emit('connection', socket, user);
    });
});

socketServer.on('connection', (socket, user) => {
    getActiveUsers();
    console.log(`user.login === ${user.login}`);
    console.log(`user.chat == ${user.chat}`);

    socket.on('message', async (message) => {
        console.log(`IN: ${message}`);
        const login = user.login;

        const messageParsed = JSON.parse(message);
        const password = messageParsed.password;
        const chat = messageParsed.chat;
        const connectDB = await db.getConnection();

        switch (messageParsed.type) {
            case 'registration': {
                let responceRegistration;
                const [result] = await connectDB.query(queris.getInfoUser, [messageParsed.login]);
                console.log(queris.getInfoUser, [login]); //SQL LOG
                if (result.length > 0) {
                    responceRegistration = {
                        type: 'errorRegistration',
                        body: 'This user have account <a href="http://localhost:3000/pages/authorization.html">Go to AuthorizationPage</a>'
                    }
                } else {
                    connectDB.query(queris.addNewUser, [messageParsed.login, messageParsed.password]);
                    console.log(queris.addNewUser, [messageParsed.login, messageParsed.password]); //SQL LOG
                    console.log(`User ${login} added`);
                    responceRegistration = {
                        type: 'successRegistration',
                        body: messageParsed.login
                    }
                }
                socket.send(JSON.stringify(responceRegistration));
                console.log(JSON.stringify(responceRegistration));
                break;
            };
            case 'authorization': {
                let responceAuthorization;
                const [result] = await connectDB.query(queris.checkUser, [messageParsed.login, password]);
                console.log(queris.checkUser, [messageParsed.login, password]); //SQL LOG
                if (result.length === 0) {
                    responceAuthorization = {
                        type: 'errorAuthorization',
                        body: 'Not validate login or password'
                    }
                } else {
                    responceAuthorization = {
                        type: 'successAuthorization',
                        body: `${login}`
                    }
                }
                socket.send(JSON.stringify(responceAuthorization));
                console.log(JSON.stringify(responceAuthorization));
                break;
            };
            case 'userMessage': {
                message = {
                    type: 'messageOk',
                    chat: chat,
                    body: messageParsed.text
                }
                const [result] = await connectDB.query(queris.getUsersOfChat, [chat]);
                result.forEach((item) => {
                    if (usersList.has(item.user)) { //если юзер есть в списке активных пользователей
                        const sockets = usersList.get(item.user);
                        for (const [socket, chat] of sockets) {
                            if (chat === messageParsed.chat) {
                                socket.send(JSON.stringify(message));
                            }
                        }
                    }
                });
                await connectDB.query(queris.setHistoryRow, [chat, messageParsed.text, messageParsed.from]);
                console.log(queris.setHistoryRow, [chat, messageParsed.text, messageParsed.from]); //SQL LOG
                console.log(`SENDED::`);
                console.log(message);
            }
            case 'getHistory': {
                updateUsersList(messageParsed.login, messageParsed.chat, socket);
                console.log(usersList);

                const history = [];
                const [result] = await connectDB.query(queris.getHystoryOfChat, [chat]);
                console.log(queris.getHystoryOfChat, [chat]); //SQL LOG

                result.forEach((item) => {
                    history.push(item.text);
                });
                const historyPool = {
                    type: 'getHistory',
                    body: history.join('<br>')
                }
                socket.send(JSON.stringify(historyPool));
                break;
            }
            case 'createChat': {
                await connectDB.query(queris.createOrUpdateChat, [login, chat]);
                console.log(queris.createOrUpdateChat, [login, chat]); //SQL LOG
                break;
            }
            case 'getActiveChats': {
                const [result] = await connectDB.query(queris.getChatsOfUser, [login]);
                console.log(queris.getChatsOfUser, [login]);
                const chatList = [];
                result.forEach((item) => {
                    chatList.push(item.title);
                });
                console.log(chatList);
                const message = {
                    type: 'getActiveChats',
                    login: login,
                    chats: chatList
                }
                socket.send(JSON.stringify(message));
                break;
            }
            case 'inviteUser': {
                const sockets = usersList.get(messageParsed.to);
                const message = {
                    type: 'Invite',
                    from: messageParsed.from,
                    to: messageParsed.to,
                    chat: chat
                }
                console.log(`messageParsed.from ==== ${messageParsed.from}`);
                console.log(`messageParsed.to ==== ${messageParsed.to}`);
                for (const [socket, chat] of sockets) {
                    socket.send(JSON.stringify(message));
                    console.log(`OUT:: ${JSON.stringify(message)}`);
                }
                break;
            }
            case 'responceToInvite': {
                if (messageParsed.result === 1) {
                    await connectDB.query(queris.createOrUpdateChat, [messageParsed.to, messageParsed.chat]);
                } else if (messageParsed.result === 2) {
                    const sockets = usersList.get(messageParsed.from);
                    const message = {
                        type: 'RejectInvate',
                        from: messageParsed.from,
                        to: messageParsed.to,
                        chat: messageParsed.chat
                    }
                    for (const [socket, chat] of sockets) {
                        socket.send(JSON.stringify(message));
                    }
                } else console.log(`Получен НЕвалидный ответ на инвайт в чат ${messageparse.chat}`);
                break;
            }
            default: {
                console.log(`Priletela kakayto kuny == ${messageParsed}`);
                break;
            }
        }
    });

    socket.on('open', () => {
        console.log(`OPEN`);
    });

    socket.on('close', () => {
        console.log(`User "${user.login}" leave!!!`);
        const leaveUserSockets = usersList.get(user.login);
        console.log('?????????????? BEFORE  ----  LEAVE ?????????????????????');
        console.log(usersList);
        if (leaveUserSockets.size > 1) {
            usersList.get(user.login).delete(socket);
            console.log('delete socket');
        } else {
            usersList.delete(user.login);
            console.log(`delete user --- ${user.login}`);
        }
        console.log('?????????????? LEAVE ?????????????????????');
        console.log(usersList);
        getActiveUsers();
    });
});

httpServer.listen(40509);
