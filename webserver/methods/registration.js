const queris = require('../../app/db/queris');
const db = require('../../app/db/db');
const logger = require('../../app/config/winston');

module.exports = async ({ message, socket, list }) => {
    const data = ['message'];
    
    const connectDB = await db.getConnection();
    const responceRegistration = {
        type: null,
        body: null
    };
    const [result] = await connectDB.query(queris.getInfoUser, [data.login]);
    logger.info('MatiaDB %s WITH %s', queris.getInfoUser, [data.login]);
    if (result.length > 0) {
        responceRegistration.type = 'errorRegistration';
        responceRegistration.body = 'This user have account <a href="http://localhost:3000/pages/authorization.html">Go to AuthorizationPage</a>';
    } else {
        await connectDB.query(queris.addNewUser, [data.login, data.password]);
        logger.info('MatiaDB %s WITH %s', queris.addNewUser, [data.login, data.password]);
        responceRegistration.type = 'successRegistration';
        responceRegistration.body = data.login;
    }
    socket.send(JSON.stringify(responceRegistration));
    logger.info('responceRegistration: %s', responceRegistration);
}
