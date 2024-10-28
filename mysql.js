
const mysql = require('mysql');

const pool = mysql.createPool({
    host: '94.130.223.106',
    user: 'prisriapp_xbucks',
    password: 'xbucks@@ansh',
    database: 'prisriapp_xbucks'
});
function query(sql, args) {
    return new Promise((resolve, reject) => {
        pool.query(sql, args, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
}

module.exports = { pool, query };