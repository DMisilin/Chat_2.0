const logger = require('../config/winston');

module.exports = ({ messageParsed, socket, usersList, user }) => {
    const liver = user;
    const leavirLogin = liver.getLogin();
    const leavirConnections = liver.getConnections();
    
    if (leavirConnections.size > 1) {
        liver.deleteConnect(socket);
        logger.info('Socket for user "%s" deleted', leavirLogin);
    } else {
        usersList.delete(leavirLogin);
        logger.info('User "%s" deleted from UsersList', leavirLogin);
    }
}