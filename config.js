require('dotenv').config()

const SECRET_KEY = process.env.SECRET_KEY || 'secret-dev'
const PORT = +process.env.PORT || 3001;

function getDatabaseUrl() {
    return(process.env.NODE_ENV === 'test')
        ? 'jens_kitchen_test'
        : process.env.DATABASE_URL || 'jens_kitchen'
}

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === 'test' ? 1 : 12

module.exports = {
    SECRET_KEY,
    PORT,
    BCRYPT_WORK_FACTOR,
    getDatabaseUrl
}