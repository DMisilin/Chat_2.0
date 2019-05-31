const queris = require('../../app/db/queris');
const db = require('../../app/db/db');
const logger = require('../../app/config/winston');

module.exports = async (messageParsed) => {
    const connectDB = await db.getConnection();
    const responceAuthorization = {
        type: null,
        body: null
    };
    const [result] = await connectDB.query(queris.checkUser, [messageParsed.login, messageParsed.password]);
    logger.info('MatiaDB %s WITH %s', queris.checkUser, [messageParsed.login, messageParsed.password]);

    if (result.length === 0) {
        responceAuthorization.type = 'errorAuthorization';
        responceAuthorization.body = 'Not validate login or password';
    } else {
        responceAuthorization.type = 'successAuthorization';
        responceAuthorization.body = `${messageParsed.login}`;
    }
    return responceAuthorization;
}
