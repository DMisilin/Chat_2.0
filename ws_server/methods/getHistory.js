const queris = require('../db/queris');
const db = require('../../ws_server/db/db');
const logger = require('../../ws_server/config/winston');
const functions = require('../functions');

module.exports = async ({ data, socket, usersList, user }) => {
    const list = functions.updateUsersList({ data, socket, usersList });

    const connectDB = await db.getConnection();
    const history = [];
    const [result] = await connectDB.query(queris.getHystoryOfChat, [data.chat]);
    logger.info('M A R I A %s WITH %s', queris.getHystoryOfChat, [data.chat]);
    logger.info(result);

    result.forEach((item) => {
        history.push(item.text);
    });

    const historyPool = {
        type: 'getHistory',
        body: history.join('<br>')
    }

    socket.send(JSON.stringify(historyPool));
    logger.info('JSON.stringify(historyPool) %s', JSON.stringify(historyPool));
    // console.log(list);

    return list;
}
