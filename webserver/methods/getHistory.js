const queris = require('../../app/db/queris');
const db = require('../../app/db/db');
const logger = require('../../app/config/winston');

const log = new logger();

module.exports = async (chat) => {
    const connectDB = await db.getConnection();
    const history = [];
    const [result] = await connectDB.query(queris.getHystoryOfChat, [chat]);
    log.log('info', 'MatiaDB %s WITH %s', queris.getHystoryOfChat, [chat]);

    result.forEach((item) => {
        history.push(item.text);
    });

    const historyPool = {
        type: 'getHistory',
        body: history.join('<br>')
    }
    return historyPool;
}
