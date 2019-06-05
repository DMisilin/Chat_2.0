const logger = require('../config/winston');

module.exports = ({ socket, userManager, user }) => {
    const leavirLogin = user.getLogin();
    const leavirConnections = user.getConnections();
    
    if (leavirConnections.size > 1) {
        user.deleteConnect(socket);
        logger.info('Socket for user "%s" deleted', leavirLogin);
    } else {
        userManager.deleteUser(leavirLogin);
        logger.info('User "%s" deleted from UsersList', leavirLogin);
    }
}