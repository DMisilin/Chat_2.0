const logger = require('../../app/config/winston');

const getValueFromURL = (param, url) => {
    const params = url.split('&');
    switch (param) {
        case 'login': return params[0].replace('login=', '');
        case 'chat': return params[1].replace('chat=', '');
    }
}

const updateUsersList = ({ data, socket, usersList }) => {
    const list = usersList;
    const connect = new Map();
    connect.set(socket, data.chat);
    logger.info('Create mew Connect: %s fro User - "%s" and Chat - "%s"', connect, data.login, data.chat);
    list.has(data.login) ? list.get(data.login).set(socket, data.chat) : list.set(data.login, connect);
    logger.info('Update UsersList --> %s', list);
    return list;
}

const getActiveUsers = ({ clientsList, keys }) => {
    const array = Array.from(keys);
    const listActive = array.join(', ');
    const message = {
        type: 'apdateActiveUsersList',
        body: listActive
    }
    clientsList.forEach(each = (client) => {
        client.send(JSON.stringify(message));
    })
}

module.exports.getValueFromURL = getValueFromURL;
module.exports.updateUsersList = updateUsersList;
module.exports.getActiveUsers = getActiveUsers;
