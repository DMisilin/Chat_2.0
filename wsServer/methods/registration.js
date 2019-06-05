const queris = require('../db/queris');
const db = require('../db/db');
const logger = require('../config/logger');

module.exports = async ({ messageParsed, socket, usersList, user }) => {
    const connectDB = await db.getConnection();
    const responceRegistration = {
        type: null,
        body: null
    };
    const [result] = await connectDB.query(queris.getInfoUser, [messageParsed.login]);
    logger.info('M A R I A %s WITH %s', queris.getInfoUser, [messageParsed.login]);
    if (result.length > 0) {
        responceRegistration.type = 'errorRegistration';
        responceRegistration.body = 'This user have account <a href="http://localhost:3000/pages/authorization.html">Go to AuthorizationPage</a>';
    } else {
        await connectDB.query(queris.addNewUser, [messageParsed.login, messageParsed.password]);
        logger.info('M A R I A %s WITH %s', queris.addNewUser, [messageParsed.login, messageParsed.password]);
        responceRegistration.type = 'successRegistration';
        responceRegistration.body = messageParsed.login;
    }
    socket.send(JSON.stringify(responceRegistration));
    logger.info('responceRegistration: %s', responceRegistration);
}
