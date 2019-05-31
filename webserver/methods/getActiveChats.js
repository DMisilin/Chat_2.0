const queris = require('../../app/db/queris');
const db = require('../../app/db/db');
const logger = require('../../app/config/winston');

const log = new logger();

module.exports = async (login) => {
    const connectDB = await db.getConnection();
    const [result] = await connectDB.query(queris.getChatsOfUser, [login]);
    log.log('info', 'MatiaDB %s WITH %s', queris.getChatsOfUser, [login]);
    const chatList = [];

    result.forEach((item) => {
        chatList.push(item.title);
    });
    log.log('info', 'Active chat for "%s" - "%s"', login, chatList);

    const message = {
        type: 'getActiveChats',
        login: login,
        chats: chatList
    }
    return message;
}
