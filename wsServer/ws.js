const webSocket = require('ws');
const http = require('http');
const logger = require('./config/winston');
const methods = require('./methods/index');
const UserManager = require('./userManader');

const httpServer = http.createServer();
const socketServer = new webSocket.Server({ noServer: true });
const port = 40509;
const userManager = new UserManager();

httpServer.on('upgrade', async (request, socket, head) => {
    socketServer.handleUpgrade(request, socket, head, (socket) => {

        const user = userManager.updateActiveUsers(request.url, socket);
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
        methods.close({ socket, userManager, user });
        userManager.sendActiveUsersForAll();
    });
});

httpServer.listen(port, () => logger.info('Server started and liastning %s port!', port));
