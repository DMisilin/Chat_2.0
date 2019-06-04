const webSocket = require('ws');
const http = require('http');
const logger = require('../ws_server/config/winston');
const methods = require('./methods/index');
const User = require('./user');
const UserManager = require('./userManader');

const httpServer = http.createServer();
const socketServer = new webSocket.Server({ noServer: true });
const port = 40509;
const userManager = new UserManager();

httpServer.on('upgrade', async (request, socket, head) => {
    socketServer.handleUpgrade(request, socket, head, (socket) => {
        const userParams = request.url.split('?')[1];
        const login = userManager.getValueFromURL('login', userParams);
        const chatId = userManager.getValueFromURL('chat', userParams);
        let user; 
        if (userManager.checkUserInActive(login)) {
            user = userManager.getUser(login);
            user.setConnection(socket, chatId);
        } else {
            const chatLabel = userManager.getChatLabelById(chatId);
            user = new User({login, chatLabel, chatId, socket});
            userManager.setUser(login, user);            
        }
        console.log('U S E R S    L I S T');
        console.log(userManager.getActiveUsers());
       
        socketServer.emit('connection', socket, user);
    });
});

socketServer.on('connection', (socket, user) => {
    userManager.sendActiveUsersForAll();

    socket.on('message', async (message) => {
        const usersList = userManager.getActiveUsers();
        const messageParsed = JSON.parse(message);
        logger.info('messageParsed: %s', JSON.parse(message));
        const { type } = messageParsed;
        const method = methods[type];
            if (typeof(method) !== 'function') {
                logger.info('Прилетело что-то неопознаваемое: %s', message);
                return;
            }

        await method({ messageParsed, socket, usersList, user });             
        
    });

    socket.on('close', () => {
        methods.close({ socket, usersList, user });
        userManager.sendActiveUsersForAll();
    });
});

httpServer.listen(port, () => logger.info('Server started and liastning %s port!', port));
