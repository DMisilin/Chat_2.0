const webSocket = require('ws');
const http = require('http');
const logger = require('../app/config/winston');
const functions = require('./methods/functions');
const methods = require('../webserver/methods');

const httpServer = http.createServer();
const socketServer = new webSocket.Server({ noServer: true });
const port = 40509;
let usersList = new Map();

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

httpServer.on('upgrade', (request, socket, head) => {
    socketServer.handleUpgrade(request, socket, head, (socket) => {
        const userParams = request.url.replace('/pages/chat.html?', '');
        const login = functions.getValueFromURL('login', userParams);
        const chat = functions.getValueFromURL('chat', userParams);
        const user = { socket, login, chat };
        usersList = functions.updateUsersList({ data: user, socket, usersList });
        socketServer.emit('connection', socket, user);
    });
});

socketServer.on('connection', (socket, user) => {
    getActiveUsers();

    socket.on('message', async (message) => {
        logger.info('Received message:: %s', message);
        const messageParsed = JSON.parse(message);
        logger.info('messageParsed: %s', JSON.parse(message));

        const { type } = messageParsed;
        console.log(type);
        
        const method = methods[type];
        console.log(method);

        if (typeof(method) !== 'function') {
            logger.info('Прилетело что-то неопознаваемое: %s', message);
            return;
        }

        const data = type === 'getActiveChats' ? user : messageParsed;

        await method({ data, socket, usersList });

        // switch (messageParsed.type) {
        //     case 'registration': {
        //         await methods.registration({ data: messageParsed, socket, usersList});
        //         break;
        //     };
        //     case 'authorization': {
        //         await methods.authorization({ data: messageParsed, socket, usersList});
        //         break;
        //     };
        //     case 'userMessage': {
        //         await methods.userMessage({ data: messageParsed, socket, usersList});
        //         break;
        //     }
        //     case 'getHistory': {
        //         usersList = await methods.getHistory({ data: messageParsed, socket, usersList });
        //         break;
        //     }
        //     case 'createChat': {
        //         await methods.createChat({ data: messageParsed, socket, usersList });
        //         break
        //     }
        //     case 'getActiveChats': {
        //         await methods.getActiveChats({ data: user, socket, usersList });
        //         break;
        //     }
        //     case 'inviteUser': {
        //         methods.inviteUser({ data: messageParsed, socket, usersList });
        //         break;
        //     }
        //     case 'responceToInvite': {
        //         methods.responceToInvite({ data: messageParsed, socket, usersList });
        //         break;
        //     }
        //     default: {
        //         logger.info('Прилетело что-то неопознаваемое: %s', message);
        //         break;
        //     }
        // }
    });

    socket.on('close', () => {
        usersList = methods.close({ data: user, socket, usersList });
        getActiveUsers();
    });
});

httpServer.listen(port, () => logger.info('Server started and liastning %s port!', port));
