const registration = require('./registration');
const authorization = require('./authorization');
const getHistory = require('./getHistory');
const getActiveChats = require('./getActiveChats');
const responceToInvite = require('./responceToInvite');
const userMessage = require('./userMessage');
const createChat = require('./createChat');
const inviteUser = require('./inviteUser');
const close = require('./close');

module.exports = {
    registration,
    authorization,
    userMessage,
    getHistory,
    createChat,
    getActiveChats,
    inviteUser,
    responceToInvite,
    close
}
