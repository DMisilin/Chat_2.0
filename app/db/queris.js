module.exports = {

    getInfoUser: `SELECT * FROM users WHERE login = ?`,

    getChatsOfUser: `SELECT title FROM chats WHERE user = ?`,

    getUsersOfChat: `SELECT user FROM chats WHERE title = ?`,

    getChatNameById: `SELECT title FROM chats WHERE chat_id = ?`,

    getHystoryOfChat: `SELECT text, date, sender FROM history WHERE chat = ?`,

    addNewUser: `INSERT INTO users (login, password) VALUES (?, ?)`,

    setHistoryRow: `INSERT INTO history (chat, text, sender) VALUES (?, ?, ?)`,
    
    checkUser: `SELECT * FROM users WHERE login = ? AND password = ?`,

    createOrUpdateChat: `INSERT INTO chats (user, title) VALUES (?, ?)`,

    getLastIdChat: `SELECT LAST_INSERT_ID()`

}