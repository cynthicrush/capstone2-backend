const { Client } = require('pg')
const { getDatabaseUrl } = require('./config')

let db;

if(process.env.NODE_ENV === 'production') {
    db = new Client({
        connectionString: getDatabaseUrl(),
        ssl: {
            rejectUnauthorized: false
        }
    })
} else {
    db = new Client({
        connectionString: getDatabaseUrl()
    })
}

db.connect()

module.exports = db;
