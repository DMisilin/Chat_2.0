const queris = require('../db/queris');
const db = require('../db/db');
const logger = require('../config/logger');
const helper = require('../helper');

module.exports = async ({ messageParsed, socket, userManager, user }) => {
    user.setChatId(messageParsed.chat_id);

    const connectDB = await db.getConnection();
    const history = [];
    const [result] = await connectDB.query(queris.getHystoryOfChat, [messageParsed.chat_id]);

    logger.info('M A R I A %s WITH %s', queris.getHystoryOfChat, [messageParsed.chat_id]);
    logger.info(result);

    result.forEach((item) => {
        history.push(item.text);
    });

    const historyPool = {
        type: 'getHistory',
        body: history.join('<br>'),
        chat_id: messageParsed.chat_id,
        chatLabel: helper.getChatLabelById(messageParsed.chat_id)
    }

    socket.send(JSON.stringify(historyPool));
    logger.info('JSON.stringify(historyPool) %s', JSON.stringify(historyPool));
}
