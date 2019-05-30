module.exports = {

    getInfoUser: `SELECT * FROM users WHERE login = ?`,

    addNewUser: `INSERT INTO users (login, password) VALUES (?, ?)`,

    checkUser: `SELECT * FROM users WHERE login = ? AND password = ?`,

    setHistoryRow: `INSERT INTO history (chat, text, sender) VALUES (?, ?, ?)`,

    getHystoryOfChat: `SELECT text, date, sender FROM history WHERE chat = ?`,

    createOrUpdateChat: `INSERT INTO chats (user, title) VALUES (?, ?)`,

    getChatsOfUser: `SELECT title FROM chats WHERE user = ?`,

    getUsersOfChat: `SELECT user FROM chats WHERE title = ?`
    
}