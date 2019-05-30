const queris = require('../../app/db/db');

module.exports = async(connectDB, socket, messageParsed) => {
    console.log(`----> Registration start!`);

    let responceRegistration;
    const [result] = await connectDB.query(queris.getInfoUser, [messageParsed.login]);
    if (result.length > 0) {
        responceRegistration = {
            type: 'errorRegistration',
            body: 'This user have account <a href="http://localhost:3000/pages/authorization.html">Go to AuthorizationPage</a>'
        }
    } else {
        await connectDB.query(queris.addNewUser, [messageParsed.login, messageParsed.password]);
        responceRegistration = {
            type: 'successRegistration',
            body: messageParsed.login
        }
    }
    socket.send(JSON.stringify(responceRegistration));
    console.log(JSON.stringify(responceRegistration));
}
