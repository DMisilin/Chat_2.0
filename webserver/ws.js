const webSocket = require('ws');
const http = require('http');
const db = require('../myapp/db/db');
const queris = require('../myapp/db/queris');

const server = http.createServer();
const ws1 = new webSocket.Server({ noServer: true });

ws1.on('connection', function connection(ws) {
    console.log(`Connection added!`);
});

server.on('upgrade', function upgrade(request, socket, head) {
    ws1.handleUpgrade(request, socket, head, function done(ws) {
        ws1.emit('connection', ws, request);
    });
});

server.listen(40509);

// server.on('connection', (socket) => {
//     socket.on('message', async (message) => {
//         console.log(`in: ${message}`);

//         const messageParsed = JSON.parse(message);
//         const login = messageParsed.login;
//         const password = messageParsed.password;
//         const dialog = messageParsed.dialog;
//         const connectDB = await db.getConnection();
        
//         switch (messageParsed.type) {
//             case 'registration': {
//                 let responceRegistration;
//                 const [result] = await connectDB.query(queris.getInfoUser, [login]);
//                 console.log(queris.getInfoUser, [login]); //SQL LOG
//                 if (result.length > 0) {
//                     responceRegistration = {
//                         type: 'errorRegistration',
//                         body: 'This user have account <a href="http://localhost:3000/pages/authorization.html">Go to AuthorizationPage</a>'
//                     }
//                 } else {
//                     connectDB.query(queris.addNewUser, [login, password]);
//                     console.log(queris.addNewUser, [login, password]); //SQL LOG
//                     console.log(`User ${login} added`);
//                     responceRegistration = {
//                         type: 'successRegistration',
//                         body: `${login}`
//                     }
//                 }
//                 socket.send(JSON.stringify(responceRegistration));
//                 console.log(JSON.stringify(responceRegistration));
//                 break;
//             };
//             case 'authorization': {
//                 let responceAuthorization;
//                 const [result] = await connectDB.query(queris.checkUser, [login, password]);
//                 console.log(queris.checkUser, [login, password]); //SQL LOG
//                 if (result.length === 0) {
//                     responceAuthorization = {
//                         type: 'errorAuthorization',
//                         body: 'Not validate login or password'
//                     }
//                 } else {
//                     responceAuthorization = {
//                         type: 'successAuthorization',
//                         body: `${login}`
//                     }
//                 }
//                 socket.send(JSON.stringify(responceAuthorization));
//                 console.log(JSON.stringify(responceAuthorization));
//                 break;
//             };
//             case 'userMessage': {
//                 const textMessage = `${messageParsed.from}: ${messageParsed.text}`
//                 await connectDB.query(queris.addMessageInHistory, [messageParsed.dialog, textMessage]);
//                 console.log(queris.addMessageInHistory, [messageParsed.dialog, textMessage]); //SQL LOG
//                 responceRegistration = {
//                     type: 'messageOk',
//                     dialog: messageParsed.dialog,
//                     body: textMessage
//                 }
//                 socket.send(JSON.stringify(responceRegistration));
//                 console.log(`new message added in history`);
//             }
//             case 'getHistory': {
//                 const history = [];
//                 const [result] = await connectDB.query(queris.getHystoryOfDialog, [dialog]);
//                 console.log(queris.getHystoryOfDialog, [dialog]); //SQL LOG
//                 result.forEach((item, i, result) => {
//                     history.push(item.text_mess);
//                 });
//                 const historyPool = {
//                     type: 'getHistory',
//                     body: history.join('<br>')
//                 }
//                 socket.send(JSON.stringify(historyPool));
//                 break;
//             }
//             default: {
//                 console.log(`Priletela kakayto kuny == ${messageParsed}`);
//                 break;
//             }
//         }
//     });
// });
