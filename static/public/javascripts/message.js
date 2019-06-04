module.exports = new class Message {
    constructor (type, chat, login_from, login_to, body, text) {
        this.type = type;
        this.chat = chat;
        this.login_from = login_from;
        this.login_to = login_to;
    }
}