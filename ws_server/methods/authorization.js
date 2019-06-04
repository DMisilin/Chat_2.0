const queris = require('../db/queris');
const db = require('../../ws_server/db/db');
const logger = require('../../ws_server/config/winston');

module.exports = async ({ messageParsed, socket, usersList, user }) => {
    const connectDB = await db.getConnection();
    const responceAuthorization = {
        type: null,
        body: null
    };
    const [result] = await connectDB.query(queris.checkUser, [messageParsed.login, messageParsed.password]);
    logger.info('M A R I A %s WITH %s', queris.checkUser, [messageParsed.login, messageParsed.password]);

    if (result.length === 0) {
        responceAuthorization.type = 'errorAuthorization';
        responceAuthorization.body = 'Not validate login or password';
    } else {
        responceAuthorization.type = 'successAuthorization';
        responceAuthorization.body = `${messageParsed.login}`;
    }
    socket.send(JSON.stringify(responceAuthorization));
    logger.info('responceAuthorization: %s', responceAuthorization);
}
