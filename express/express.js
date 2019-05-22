const express = require('express');
const server = express();

server.get('/', (req, res) => {
    res.sendfile('/home/dmisilin/NodeJS/Chat_2.0/page/front.html');
})
server.listen(3003, () => {
    console.log('connected...listning 3003 port!');
})