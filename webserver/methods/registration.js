const queris = require('../../app/db/queris');
const db = require('../../app/db/db');
const logger = require('../../app/config/winston');

const log = new logger();

module.exports = async (messageParsed) => {
    const connectDB = await db.getConnection();
    const responceRegistration = {
        type: null,
        body: null
    };
    const [result] = await connectDB.query(queris.getInfoUser, [messageParsed.login]);
    log.log('info', 'MatiaDB %s WITH %s', queris.getInfoUser, [messageParsed.login]);
    if (result.length > 0) {
        responceRegistration.type = 'errorRegistration';
        responceRegistration.body = 'This user have account <a href="http://localhost:3000/pages/authorization.html">Go to AuthorizationPage</a>';
    } else {
        await connectDB.query(queris.addNewUser, [messageParsed.login, messageParsed.password]);
        log.log('info', 'MatiaDB %s WITH %s', queris.addNewUser, [messageParsed.login, messageParsed.password]);
        responceRegistration.type = 'successRegistration';
        responceRegistration.body = messageParsed.login;
    }
    return responceRegistration;
}
