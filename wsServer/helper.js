const logger = require('./config/winston');
const queris = require('./db/queris');
const db = require('./db/db');

module.exports.getValueFromURL = (param, url) => {
    const params = url.split('&');
    switch (param) {
        case 'login': return params[0].replace('login=', '');
        case 'chat': return params[1].replace('chat=', '');
    }
}

module.exports.getChatLabelById = async (chatId) => {
    const connectDB = await db.getConnection();
    const [result] = await connectDB.query(queris.getChatNameById,[chatId]);
    logger.info('M A R I A %s WITH %s', queris.getChatNameById, [chatId]);
    logger.info(result.title);
    return result.title;
}
