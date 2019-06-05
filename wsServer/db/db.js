const mysql2 = require('mysql2/promise');
const config = require('../config/configDB');

module.exports = new class DB {
    constructor() {
        this.connection = null;
    }

    async getConnection() {
        if(!this.connection) {
            this.connection = await mysql2.createConnection(config.mariaDB);
        }
        return this.connection;
    }
};
