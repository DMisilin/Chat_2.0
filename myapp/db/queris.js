module.exports = {

    getInfoUser: `SELECT * FROM users WHERE user_name = ?`,

    addNewUser: `INSERT INTO users (user_name, password) VALUES (?, ?)`,

    checkUser: `SELECT * FROM users WHERE user_name = ? AND password = ?`,

    addMessageInHistory: `INSERT INTO history (dialog, text_mess) VALUES (?, ?)`,

    getHystoryOfDialog: `SELECT text_mess FROM history WHERE dialog = ?`
    
}