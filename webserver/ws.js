const webSocket = require('ws');
const http = require('http');
const logger = require('../app/config/winston');
const functions = require('./functions');
const methods = require('../webserver/methods/index');
const User = require('./user');

const httpServer = http.createServer();
const socketServer = new webSocket.Server({ noServer: true });
const port = 40509;
let usersList = new Map();

httpServer.on('upgrade', async (request, socket, head) => {
    socketServer.handleUpgrade(request, socket, head, (socket) => {
        const userParams = request.url.split('?')[1];
        const login = functions.getValueFromURL('login', userParams);
        const chatId = functions.getValueFromURL('chat', userParams);
        let user; 
        if (usersList.has(login)) {
            user = usersList.get(login);
            user.setConnection(socket, chatId);
        } else {
            const chat = functions.getChatNameById(chatId);
            user = new User({login, chat, chatId, socket});
            usersList.set(login, user);            
        }
        console.log('U S E R S    L I S T');
        console.log(usersList);
       
        socketServer.emit('connection', socket, user);
    });
});

socketServer.on('connection', (socket, user) => {
    functions.getActiveUsers(usersList);

    socket.on('message', async (message) => {
        const messageParsed = JSON.parse(message);
        logger.info('messageParsed: %s', JSON.parse(message));
        const { type } = messageParsed;
        const method = methods[type];
            if (typeof(method) !== 'function') {
                logger.info('Прилетело что-то неопознаваемое: %s', message);
                return;
            }
            
        await method({ data: messageParsed, socket, usersList });             
        
    });

    socket.on('close', () => {
        usersList = methods.close({ data: user, socket, usersList });
        functions.getActiveUsers(usersList);
    });
});

httpServer.listen(port, () => logger.info('Server started and liastning %s port!', port));
