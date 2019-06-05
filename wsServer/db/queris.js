module.exports = {

    getInfoUser: `SELECT * FROM users WHERE login = ?`,

    getChatsOfUser: `SELECT chat_id, title FROM chats WHERE user = ?`,

    getUsersOfChat: `SELECT user FROM chats WHERE chat_id = ?`,

    getChatNameById: `SELECT title FROM chats WHERE chat_id = ?`,

    getHystoryOfChat: `SELECT text, date, sender FROM history WHERE chat_id = ?`,

    addNewUser: `INSERT INTO users (login, password) VALUES (?, ?)`,

    setHistoryRow: `INSERT INTO history (chat_id, text, sender) VALUES (?, ?, ?)`,
    
    checkUser: `SELECT * FROM users WHERE login = ? AND password = ?`,

    createOrUpdateChat: `INSERT INTO chats (user, title) VALUES (?, ?)`,

    getLastIdChat: `SELECT LAST_INSERT_ID() as ID`

}