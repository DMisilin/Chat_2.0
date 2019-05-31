const queris = require('../../app/db/queris');
const db = require('../../app/db/db');
const logger = require('../../app/config/winston');

const log = new logger();

module.exports = async (messageParsed) => {
    const message = {
        type: 'default',
        from: messageParsed.from,
        to: messageParsed.to,
        chat: messageParsed.chat
    }
    const connectDB = await db.getConnection();
    
    if (messageParsed.result === 1) {
        await connectDB.query(queris.createOrUpdateChat, [messageParsed.to, messageParsed.chat]);
        log.log('info', 'MatiaDB %s WITH %s', queris.createOrUpdateChat, [messageParsed.to, messageParsed.chat]);
    } else if (messageParsed.result === 2) {
        message.type = 'RejectInvate';
    }
    return message;
}