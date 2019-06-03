const queris = require('../../app/db/queris');
const db = require('../../app/db/db');
const logger = require('../../app/config/winston');

module.exports = async ({ data, socket, usersList}) => {
    const connectDB = await db.getConnection();
    const responceAuthorization = {
        type: null,
        body: null
    };
    const [result] = await connectDB.query(queris.checkUser, [data.login, data.password]);
    logger.info('M A R I A %s WITH %s', queris.checkUser, [data.login, data.password]);

    if (result.length === 0) {
        responceAuthorization.type = 'errorAuthorization';
        responceAuthorization.body = 'Not validate login or password';
    } else {
        responceAuthorization.type = 'successAuthorization';
        responceAuthorization.body = `${data.login}`;
    }
    socket.send(JSON.stringify(responceAuthorization));
    logger.info('responceAuthorization: %s', responceAuthorization);
}
