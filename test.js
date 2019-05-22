const mysql2 = require ('mysql2');

const connect = mysql2.createConnection({
    host: 'localhost',
    user: 'admin',
    password: 'password',
    database: 'chat_db'
})

connect.query(
    `SELECT * FROM users`,
    (err, results, fields) => {
        console.log(results);
        console.log(results.length);
        // console.log(fields);
        // console.log(err);
    }
)