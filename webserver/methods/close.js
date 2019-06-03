const logger = require('../../app/config/winston');

module.exports = ({ data, socket, usersList }) => {
    const list = usersList;
    const leaveUserSockets = list.get(data.login);
    if (leaveUserSockets.size > 1) {
        list.get(data.login).delete(socket);
        logger.info('Socket for user "%s" deleted', data.login);
    } else {
        list.delete(data.login);
        logger.info('User "%s" deleted from UsersList', data.login);
    }
    logger.info('UsersList was update: %s', list);
    console.log(list);
    return list;
}